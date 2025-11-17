import { useState } from 'react';
import { contractService } from '../../services/contract.service';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { toast } from '../common/Toast';
import { Plus, Edit, Trash2, CheckCircle, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Milestone {
  id: string;
  name: string;
  description?: string;
  status: string;
  dueDate?: string;
  completedAt?: string;
  paymentAmount?: number;
  sequence: number;
}

interface MilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  milestones: Milestone[];
  onUpdate: () => void;
}

export default function MilestonesModal({
  isOpen,
  onClose,
  contractId,
  milestones,
  onUpdate,
}: MilestonesModalProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const handleDelete = async (milestoneId: string) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await contractService.removeMilestone(contractId, milestoneId);
      toast.success('Milestone deleted');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete milestone');
    }
  };

  const handleStatusUpdate = async (milestoneId: string, status: string) => {
    try {
      await contractService.updateMilestoneStatus(contractId, milestoneId, status);
      toast.success('Milestone status updated');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
      PENDING: 'warning',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      BLOCKED: 'error',
      CANCELLED: 'gray',
    };
    return colors[status] || 'gray';
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.sequence - b.sequence);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Milestones" size="large">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">{milestones.length} milestone(s)</p>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Milestone
            </Button>
          </div>

          {sortedMilestones.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No milestones yet</p>
              <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus size={16} className="mr-2" />
                Add First Milestone
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedMilestones.map((milestone, index) => (
                <div key={milestone.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <h3 className="font-medium text-gray-900">{milestone.name}</h3>
                        <Badge variant={getStatusColor(milestone.status)}>
                          {milestone.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                      )}
                      <div className="text-sm text-gray-600 space-y-1">
                        {milestone.dueDate && (
                          <div>Due: {format(parseISO(milestone.dueDate), 'MMM d, yyyy')}</div>
                        )}
                        {milestone.paymentAmount && (
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            Payment: {formatCurrency(milestone.paymentAmount)}
                          </div>
                        )}
                        {milestone.completedAt && (
                          <div className="text-green-600">
                            Completed: {format(parseISO(milestone.completedAt), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {milestone.status !== 'COMPLETED' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusUpdate(milestone.id, 'COMPLETED')}
                        >
                          <CheckCircle size={16} />
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" onClick={() => setEditingMilestone(milestone)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDelete(milestone.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <AddEditMilestoneModal
        isOpen={showAddModal || !!editingMilestone}
        onClose={() => {
          setShowAddModal(false);
          setEditingMilestone(null);
        }}
        contractId={contractId}
        milestone={editingMilestone}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingMilestone(null);
          onUpdate();
        }}
      />
    </>
  );
}

// Add/Edit Milestone Modal
interface AddEditMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  milestone?: Milestone | null;
  onSuccess: () => void;
}

function AddEditMilestoneModal({
  isOpen,
  onClose,
  contractId,
  milestone,
  onSuccess,
}: AddEditMilestoneModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: milestone?.name || '',
    description: milestone?.description || '',
    dueDate: milestone?.dueDate ? milestone.dueDate.split('T')[0] : '',
    paymentAmount: milestone?.paymentAmount?.toString() || '',
    status: milestone?.status || 'PENDING',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setLoading(true);
      if (milestone) {
        await contractService.updateMilestone(contractId, milestone.id, {
          ...formData,
          paymentAmount: formData.paymentAmount ? parseFloat(formData.paymentAmount) : undefined,
        });
        toast.success('Milestone updated successfully');
      } else {
        await contractService.addMilestone(contractId, {
          ...formData,
          paymentAmount: formData.paymentAmount ? parseFloat(formData.paymentAmount) : undefined,
        });
        toast.success('Milestone added successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${milestone ? 'update' : 'add'} milestone`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={milestone ? 'Edit Milestone' : 'Add Milestone'} size="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter milestone name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter milestone description..."
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
            <Input
              type="number"
              step="0.01"
              value={formData.paymentAmount}
              onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>

        {milestone && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            {milestone ? 'Update' : 'Add'} Milestone
          </Button>
        </div>
      </form>
    </Modal>
  );
}
