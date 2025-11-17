import { useState, useEffect } from 'react';
import { proposalService } from '../../services/proposal.service';
import {
  ProposalCollaborator,
  CollaboratorRole,
  AddCollaboratorData,
} from '../../types/proposal.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Loading from '../common/Loading';
import { toast } from '../common/Toast';
import { UserPlus, Mail, Trash2, Shield, Edit, MessageSquare, Eye } from 'lucide-react';

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalTitle: string;
}

export default function CollaboratorModal({
  isOpen,
  onClose,
  proposalId,
  proposalTitle,
}: CollaboratorModalProps) {
  const [collaborators, setCollaborators] = useState<ProposalCollaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState<AddCollaboratorData & { email: string }>({
    email: '',
    userId: '',
    role: CollaboratorRole.VIEWER,
    canComment: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
  });

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, proposalId]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const data = await proposalService.getCollaborators(proposalId);
      setCollaborators(data);
    } catch (error) {
      toast.error('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      setAdding(true);
      // Note: In a real implementation, you'd first look up the user by email
      // For now, we'll assume the backend handles this
      await proposalService.addCollaborator(proposalId, {
        userId: formData.email, // Backend should resolve email to userId
        role: formData.role,
        canComment: formData.canComment,
        canEdit: formData.canEdit,
        canDelete: formData.canDelete,
        canShare: formData.canShare,
      });
      toast.success('Collaborator added successfully!');
      setShowAddForm(false);
      setFormData({
        email: '',
        userId: '',
        role: CollaboratorRole.VIEWER,
        canComment: true,
        canEdit: false,
        canDelete: false,
        canShare: false,
      });
      loadCollaborators();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add collaborator');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateRole = async (collaboratorId: string, role: CollaboratorRole) => {
    try {
      await proposalService.updateCollaborator(proposalId, collaboratorId, { role });
      toast.success('Role updated successfully');
      loadCollaborators();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemove = async (collaboratorId: string, userName: string) => {
    if (!window.confirm(`Remove ${userName} from this proposal?`)) {
      return;
    }

    try {
      await proposalService.removeCollaborator(proposalId, collaboratorId);
      toast.success('Collaborator removed');
      loadCollaborators();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  const getRoleBadgeColor = (role: CollaboratorRole) => {
    const colors: Record<CollaboratorRole, string> = {
      [CollaboratorRole.OWNER]: 'purple',
      [CollaboratorRole.ADMIN]: 'blue',
      [CollaboratorRole.EDITOR]: 'green',
      [CollaboratorRole.COMMENTATOR]: 'yellow',
      [CollaboratorRole.VIEWER]: 'gray',
    };
    return colors[role];
  };

  const getRoleIcon = (role: CollaboratorRole) => {
    const icons: Record<CollaboratorRole, JSX.Element> = {
      [CollaboratorRole.OWNER]: <Shield size={14} />,
      [CollaboratorRole.ADMIN]: <Shield size={14} />,
      [CollaboratorRole.EDITOR]: <Edit size={14} />,
      [CollaboratorRole.COMMENTATOR]: <MessageSquare size={14} />,
      [CollaboratorRole.VIEWER]: <Eye size={14} />,
    };
    return icons[role];
  };

  const handleRoleChange = (role: CollaboratorRole) => {
    setFormData({
      ...formData,
      role,
      canComment: true,
      canEdit: role === CollaboratorRole.EDITOR || role === CollaboratorRole.ADMIN,
      canDelete: role === CollaboratorRole.ADMIN,
      canShare: role === CollaboratorRole.ADMIN,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Collaborators - ${proposalTitle}`}
      size="medium"
    >
      <div className="space-y-6">
        {loading && collaborators.length === 0 ? (
          <div className="py-8 flex justify-center">
            <Loading />
          </div>
        ) : (
          <>
            {/* Add Collaborator Button */}
            {!showAddForm && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="w-full"
              >
                <UserPlus size={16} className="mr-2" />
                Add Collaborator
              </Button>
            )}

            {/* Add Collaborator Form */}
            {showAddForm && (
              <form onSubmit={handleAddCollaborator} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Add New Collaborator</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="colleague@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value as CollaboratorRole)}
                      className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={CollaboratorRole.VIEWER}>Viewer - Can view only</option>
                      <option value={CollaboratorRole.COMMENTATOR}>
                        Commentator - Can comment
                      </option>
                      <option value={CollaboratorRole.EDITOR}>
                        Editor - Can edit and comment
                      </option>
                      <option value={CollaboratorRole.ADMIN}>
                        Admin - Full access except delete
                      </option>
                    </select>
                  </div>

                  <div className="bg-white rounded-md p-3 border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Permissions:</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.canComment}
                          onChange={(e) =>
                            setFormData({ ...formData, canComment: e.target.checked })
                          }
                          className="rounded"
                        />
                        <span>Can comment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.canEdit}
                          onChange={(e) => setFormData({ ...formData, canEdit: e.target.checked })}
                          className="rounded"
                        />
                        <span>Can edit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.canShare}
                          onChange={(e) =>
                            setFormData({ ...formData, canShare: e.target.checked })
                          }
                          className="rounded"
                        />
                        <span>Can share</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.canDelete}
                          onChange={(e) =>
                            setFormData({ ...formData, canDelete: e.target.checked })
                          }
                          className="rounded"
                        />
                        <span>Can delete</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={adding}
                      disabled={adding}
                      className="flex-1"
                    >
                      <Mail size={16} className="mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Collaborators List */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                Current Collaborators ({collaborators.length})
              </h4>
              {collaborators.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <UserPlus size={48} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No collaborators yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {collaborators.map((collab) => (
                    <div
                      key={collab.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-xs">
                            {collab.user?.firstName?.[0]}
                            {collab.user?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {collab.user?.firstName} {collab.user?.lastName}
                            </p>
                            <Badge color={getRoleBadgeColor(collab.role)}>
                              <span className="flex items-center gap-1">
                                {getRoleIcon(collab.role)}
                                {collab.role}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{collab.user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {collab.role !== CollaboratorRole.OWNER && (
                          <>
                            <select
                              value={collab.role}
                              onChange={(e) =>
                                handleUpdateRole(collab.id, e.target.value as CollaboratorRole)
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              {Object.values(CollaboratorRole)
                                .filter((role) => role !== CollaboratorRole.OWNER)
                                .map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() =>
                                handleRemove(
                                  collab.id,
                                  `${collab.user?.firstName} ${collab.user?.lastName}`
                                )
                              }
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
