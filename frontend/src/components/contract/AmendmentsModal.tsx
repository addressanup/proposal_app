import { useState, useEffect } from 'react';
import { amendmentService } from '../../services/amendment.service';
import {
  Amendment,
  AmendmentType,
  AmendmentStatus,
  CreateAmendmentData,
} from '../../types/amendment.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Loading from '../common/Loading';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { toast } from '../common/Toast';
import {
  FileText,
  Plus,
  Check,
  X,
  Calendar,
  User,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AmendmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  contractTitle: string;
}

export default function AmendmentsModal({
  isOpen,
  onClose,
  contractId,
  contractTitle,
}: AmendmentsModalProps) {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAmendments();
    }
  }, [isOpen, contractId]);

  const loadAmendments = async () => {
    try {
      setLoading(true);
      const data = await amendmentService.getContractAmendments(contractId);
      setAmendments(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load amendments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (amendmentId: string) => {
    try {
      await amendmentService.approve(amendmentId);
      toast.success('Amendment approved');
      loadAmendments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve amendment');
    }
  };

  const handleReject = async (amendmentId: string) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await amendmentService.reject(amendmentId, reason);
      toast.success('Amendment rejected');
      loadAmendments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject amendment');
    }
  };

  const handleMarkEffective = async (amendmentId: string) => {
    try {
      await amendmentService.markEffective(amendmentId);
      toast.success('Amendment marked as effective');
      loadAmendments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark amendment as effective');
    }
  };

  const handleDelete = async (amendmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this amendment?')) {
      return;
    }

    try {
      await amendmentService.delete(amendmentId);
      toast.success('Amendment deleted');
      loadAmendments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete amendment');
    }
  };

  const getStatusColor = (
    status: AmendmentStatus
  ): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
    const colors: Record<AmendmentStatus, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
      [AmendmentStatus.DRAFT]: 'gray',
      [AmendmentStatus.PENDING_APPROVAL]: 'warning',
      [AmendmentStatus.APPROVED]: 'success',
      [AmendmentStatus.REJECTED]: 'error',
      [AmendmentStatus.EFFECTIVE]: 'info',
      [AmendmentStatus.SUPERSEDED]: 'gray',
    };
    return colors[status];
  };

  const getTypeIcon = (type: AmendmentType) => {
    return <FileText size={16} className="text-blue-500" />;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Amendments - ${contractTitle}`} size="large">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {amendments.length} amendment{amendments.length !== 1 ? 's' : ''} recorded
            </p>
            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} className="mr-2" />
              Create Amendment
            </Button>
          </div>

          {/* Amendments List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : amendments.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No amendments yet</p>
              <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} className="mr-2" />
                Create First Amendment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {amendments.map((amendment) => (
                <div
                  key={amendment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedAmendment(amendment);
                    setShowDetailModal(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(amendment.type)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          Amendment #{amendment.amendmentNumber}: {amendment.title}
                        </h3>
                        <Badge variant={getStatusColor(amendment.status)}>
                          {amendment.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{amendment.description}</p>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FileText size={14} className="mr-2" />
                          {amendment.type.replace(/_/g, ' ')}
                        </div>
                        <div className="flex items-center">
                          <User size={14} className="mr-2" />
                          {amendment.createdBy.firstName} {amendment.createdBy.lastName}
                        </div>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2" />
                          {format(parseISO(amendment.createdAt), 'MMM d, yyyy')}
                        </div>
                        {amendment.effectiveDate && (
                          <div className="flex items-center">
                            <AlertCircle size={14} className="mr-2" />
                            Effective: {format(parseISO(amendment.effectiveDate), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      {amendment.status === AmendmentStatus.PENDING_APPROVAL && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(amendment.id)}
                          >
                            <Check size={16} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleReject(amendment.id)}
                          >
                            <X size={16} className="mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {amendment.status === AmendmentStatus.APPROVED && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleMarkEffective(amendment.id)}
                        >
                          Mark Effective
                        </Button>
                      )}
                      {(amendment.status === AmendmentStatus.DRAFT ||
                        amendment.status === AmendmentStatus.REJECTED) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDelete(amendment.id)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Create Amendment Modal */}
      <CreateAmendmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        contractId={contractId}
        onSuccess={() => {
          loadAmendments();
          setShowCreateModal(false);
        }}
      />

      {/* Amendment Detail Modal */}
      {selectedAmendment && (
        <AmendmentDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAmendment(null);
          }}
          amendment={selectedAmendment}
          onApprove={() => {
            handleApprove(selectedAmendment.id);
            setShowDetailModal(false);
          }}
          onReject={() => {
            handleReject(selectedAmendment.id);
            setShowDetailModal(false);
          }}
          onMarkEffective={() => {
            handleMarkEffective(selectedAmendment.id);
            setShowDetailModal(false);
          }}
          onDelete={() => {
            handleDelete(selectedAmendment.id);
            setShowDetailModal(false);
          }}
        />
      )}
    </>
  );
}

// Create Amendment Modal
interface CreateAmendmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  onSuccess: () => void;
}

function CreateAmendmentModal({
  isOpen,
  onClose,
  contractId,
  onSuccess,
}: CreateAmendmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAmendmentData>({
    contractId,
    type: AmendmentType.OTHER,
    title: '',
    description: '',
    changesDescription: '',
    effectiveDate: '',
    oldValue: '',
    newValue: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    try {
      setLoading(true);
      await amendmentService.create(formData);
      toast.success('Amendment created successfully');
      onSuccess();
      // Reset form
      setFormData({
        contractId,
        type: AmendmentType.OTHER,
        title: '',
        description: '',
        changesDescription: '',
        effectiveDate: '',
        oldValue: '',
        newValue: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create amendment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Amendment" size="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amendment Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as AmendmentType })}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {Object.values(AmendmentType).map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter amendment title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the amendment..."
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Changes Description
          </label>
          <textarea
            value={formData.changesDescription}
            onChange={(e) => setFormData({ ...formData, changesDescription: e.target.value })}
            placeholder="Detail the specific changes being made..."
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Effective Date</label>
          <Input
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Old Value</label>
            <Input
              type="text"
              value={formData.oldValue}
              onChange={(e) => setFormData({ ...formData, oldValue: e.target.value })}
              placeholder="Previous value"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Value</label>
            <Input
              type="text"
              value={formData.newValue}
              onChange={(e) => setFormData({ ...formData, newValue: e.target.value })}
              placeholder="Updated value"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            Create Amendment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Amendment Detail Modal
interface AmendmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  amendment: Amendment;
  onApprove: () => void;
  onReject: () => void;
  onMarkEffective: () => void;
  onDelete: () => void;
}

function AmendmentDetailModal({
  isOpen,
  onClose,
  amendment,
  onApprove,
  onReject,
  onMarkEffective,
  onDelete,
}: AmendmentDetailModalProps) {
  const getStatusColor = (
    status: AmendmentStatus
  ): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
    const colors: Record<AmendmentStatus, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
      [AmendmentStatus.DRAFT]: 'gray',
      [AmendmentStatus.PENDING_APPROVAL]: 'warning',
      [AmendmentStatus.APPROVED]: 'success',
      [AmendmentStatus.REJECTED]: 'error',
      [AmendmentStatus.EFFECTIVE]: 'info',
      [AmendmentStatus.SUPERSEDED]: 'gray',
    };
    return colors[status];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Amendment #${amendment.amendmentNumber}`}
      size="large"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{amendment.title}</h2>
            <Badge variant={getStatusColor(amendment.status)}>
              {amendment.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{amendment.type.replace(/_/g, ' ')}</span>
            <span>•</span>
            <span>
              Created by {amendment.createdBy.firstName} {amendment.createdBy.lastName}
            </span>
            <span>•</span>
            <span>{format(parseISO(amendment.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <p className="text-gray-900">{amendment.description}</p>
        </div>

        {/* Changes Description */}
        {amendment.changesDescription && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Changes</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{amendment.changesDescription}</p>
          </div>
        )}

        {/* Value Changes */}
        {(amendment.oldValue || amendment.newValue) && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Value Changes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-xs text-red-600 font-medium mb-1">Previous</div>
                <div className="text-sm text-gray-900">{amendment.oldValue || 'N/A'}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-xs text-green-600 font-medium mb-1">Updated</div>
                <div className="text-sm text-gray-900">{amendment.newValue || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Effective Date */}
        {amendment.effectiveDate && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Effective Date</h3>
            <p className="text-gray-900">{format(parseISO(amendment.effectiveDate), 'MMMM d, yyyy')}</p>
          </div>
        )}

        {/* Approval/Rejection Info */}
        {amendment.approvedBy && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check size={16} className="text-green-600" />
              <h3 className="text-sm font-medium text-green-900">Approved</h3>
            </div>
            <p className="text-sm text-gray-700">
              By {amendment.approvedBy.firstName} {amendment.approvedBy.lastName} on{' '}
              {format(parseISO(amendment.approvedAt!), 'MMMM d, yyyy')}
            </p>
          </div>
        )}

        {amendment.rejectedBy && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <X size={16} className="text-red-600" />
              <h3 className="text-sm font-medium text-red-900">Rejected</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              By {amendment.rejectedBy.firstName} {amendment.rejectedBy.lastName} on{' '}
              {format(parseISO(amendment.rejectedAt!), 'MMMM d, yyyy')}
            </p>
            {amendment.rejectionReason && (
              <p className="text-sm text-gray-900">Reason: {amendment.rejectionReason}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            {amendment.status === AmendmentStatus.PENDING_APPROVAL && (
              <>
                <Button variant="success" size="sm" onClick={onApprove}>
                  <Check size={16} className="mr-2" />
                  Approve
                </Button>
                <Button variant="secondary" size="sm" onClick={onReject}>
                  <X size={16} className="mr-2" />
                  Reject
                </Button>
              </>
            )}
            {amendment.status === AmendmentStatus.APPROVED && (
              <Button variant="primary" size="sm" onClick={onMarkEffective}>
                Mark Effective
              </Button>
            )}
            {(amendment.status === AmendmentStatus.DRAFT ||
              amendment.status === AmendmentStatus.REJECTED) && (
              <Button variant="secondary" size="sm" onClick={onDelete}>
                <X size={16} className="mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
