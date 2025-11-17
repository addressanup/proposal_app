import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { organizationService } from '../services/organization.service';
import {
  Organization,
  OrganizationMember,
  InviteMemberData,
  OrganizationMemberRole,
} from '../types/organization.types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import { toast } from '../components/common/Toast';
import { ArrowLeft, UserPlus, Mail, Trash2, Crown, Shield, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteMemberData>({
    email: '',
    role: OrganizationMemberRole.MEMBER,
  });

  useEffect(() => {
    if (id) {
      loadOrganization();
      loadMembers();
    }
  }, [id]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getById(id!);
      setOrganization(data);
    } catch (error: any) {
      toast.error('Failed to load organization');
      navigate('/organizations');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await organizationService.getMembers(id!);
      setMembers(data);
    } catch (error) {
      toast.error('Failed to load members');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteForm.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      setInviting(true);
      await organizationService.inviteMember(id!, inviteForm);
      toast.success('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteForm({ email: '', role: OrganizationMemberRole.MEMBER });
      loadMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: OrganizationMemberRole) => {
    try {
      await organizationService.updateMemberRole(id!, memberId, role);
      toast.success('Role updated successfully');
      loadMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from this organization?`)) {
      return;
    }

    try {
      await organizationService.removeMember(id!, memberId);
      toast.success('Member removed successfully');
      loadMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const getRoleBadgeColor = (role: OrganizationMemberRole) => {
    const colors: Record<OrganizationMemberRole, string> = {
      [OrganizationMemberRole.OWNER]: 'purple',
      [OrganizationMemberRole.ADMIN]: 'blue',
      [OrganizationMemberRole.MEMBER]: 'green',
      [OrganizationMemberRole.VIEWER]: 'gray',
    };
    return colors[role];
  };

  const getRoleIcon = (role: OrganizationMemberRole) => {
    const icons: Record<OrganizationMemberRole, JSX.Element> = {
      [OrganizationMemberRole.OWNER]: <Crown size={16} />,
      [OrganizationMemberRole.ADMIN]: <Shield size={16} />,
      [OrganizationMemberRole.MEMBER]: <UserPlus size={16} />,
      [OrganizationMemberRole.VIEWER]: <Eye size={16} />,
    };
    return icons[role];
  };

  if (loading || !organization) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/organizations')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Organizations
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{organization.name}</h1>
            {organization.description && (
              <p className="text-sm text-gray-600">{organization.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Created {format(new Date(organization.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowInviteModal(true)}>
            <UserPlus size={18} className="mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Team Members ({members.length})
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="py-12 text-center">
            <UserPlus size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No members yet</p>
            <Button variant="primary" onClick={() => setShowInviteModal(true)}>
              Invite Your First Member
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {members.map((member) => (
              <div key={member.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {member.user?.firstName?.[0]}
                          {member.user?.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {member.user?.firstName} {member.user?.lastName}
                        </p>
                        <Badge color={getRoleBadgeColor(member.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            {member.role}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{member.user?.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.role !== OrganizationMemberRole.OWNER && (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              member.id,
                              e.target.value as OrganizationMemberRole
                            )
                          }
                          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.values(OrganizationMemberRole)
                            .filter((role) => role !== OrganizationMemberRole.OWNER)
                            .map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                        </select>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleRemoveMember(
                              member.id,
                              `${member.user?.firstName} ${member.user?.lastName}`
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteForm({ email: '', role: OrganizationMemberRole.MEMBER });
        }}
        title="Invite Team Member"
      >
        <form onSubmit={handleInvite} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role"
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm({
                  ...inviteForm,
                  role: e.target.value as OrganizationMemberRole,
                })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value={OrganizationMemberRole.MEMBER}>Member - Can edit documents</option>
              <option value={OrganizationMemberRole.ADMIN}>Admin - Full management access</option>
              <option value={OrganizationMemberRole.VIEWER}>Viewer - Read-only access</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowInviteModal(false);
                setInviteForm({ email: '', role: OrganizationMemberRole.MEMBER });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={inviting} disabled={inviting}>
              <Mail size={18} className="mr-2" />
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
