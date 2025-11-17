import { useState, useEffect } from 'react';
import { contractService } from '../../services/contract.service';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { toast } from '../common/Toast';
import { Plus, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Obligation {
  id: string;
  description: string;
  type: string;
  status: string;
  dueDate?: string;
  completedAt?: string;
  responsibleParty?: string;
}

interface ObligationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  obligations: Obligation[];
  onUpdate: () => void;
}

export default function ObligationsModal({
  isOpen,
  onClose,
  contractId,
  obligations,
  onUpdate,
}: ObligationsModalProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingObligation, setEditingObligation] = useState<Obligation | null>(null);

  const handleDelete = async (obligationId: string) => {
    if (!window.confirm('Are you sure you want to delete this obligation?')) {
      return;
    }

    try {
      await contractService.removeObligation(contractId, obligationId);
      toast.success('Obligation deleted');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete obligation');
    }
  };

  const handleStatusUpdate = async (obligationId: string, status: string) => {
    try {
      await contractService.updateObligationStatus(contractId, obligationId, status);
      toast.success('Obligation status updated');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
      PENDING: 'warning',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      OVERDUE: 'error',
      WAIVED: 'gray',
    };
    return colors[status] || 'gray';
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Obligations" size="large">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">{obligations.length} obligation(s)</p>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Obligation
            </Button>
          </div>

          {obligations.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No obligations yet</p>
              <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus size={16} className="mr-2" />
                Add First Obligation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {obligations.map((obligation) => (
                <div
                  key={obligation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{obligation.description}</h3>
                        <Badge variant={getStatusColor(obligation.status)}>
                          {obligation.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Type: {obligation.type.replace(/_/g, ' ')}</div>
                        {obligation.dueDate && (
                          <div>Due: {format(parseISO(obligation.dueDate), 'MMM d, yyyy')}</div>
                        )}
                        {obligation.responsibleParty && (
                          <div>Responsible: {obligation.responsibleParty}</div>
                        )}
                        {obligation.completedAt && (
                          <div className="text-green-600">
                            Completed: {format(parseISO(obligation.completedAt), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {obligation.status !== 'COMPLETED' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusUpdate(obligation.id, 'COMPLETED')}
                        >
                          <CheckCircle size={16} />
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingObligation(obligation)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(obligation.id)}
                      >
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

      <AddObligationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        contractId={contractId}
        onSuccess={() => {
          setShowAddModal(false);
          onUpdate();
        }}
      />

      {editingObligation && (
        <EditObligationModal
          isOpen={true}
          onClose={() => setEditingObligation(null)}
          contractId={contractId}
          obligation={editingObligation}
          onSuccess={() => {
            setEditingObligation(null);
            onUpdate();
          }}
        />
      )}
    </>
  );
}

// Add Obligation Modal
interface AddObligationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  onSuccess: () => void;
}

function AddObligationModal({ isOpen, onClose, contractId, onSuccess }: AddObligationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    type: 'PAYMENT',
    dueDate: '',
    responsibleParty: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    try {
      setLoading(true);
      await contractService.addObligation(contractId, formData);
      toast.success('Obligation added successfully');
      onSuccess();
      setFormData({ description: '', type: 'PAYMENT', dueDate: '', responsibleParty: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add obligation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Obligation" size="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter obligation description..."
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="PAYMENT">Payment</option>
            <option value="DELIVERY">Delivery</option>
            <option value="REPORTING">Reporting</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INSURANCE">Insurance</option>
            <option value="COMPLIANCE">Compliance</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Responsible Party</label>
          <Input
            type="text"
            value={formData.responsibleParty}
            onChange={(e) => setFormData({ ...formData, responsibleParty: e.target.value })}
            placeholder="Enter responsible party name..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            Add Obligation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Edit Obligation Modal
interface EditObligationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  obligation: Obligation;
  onSuccess: () => void;
}

function EditObligationModal({
  isOpen,
  onClose,
  contractId,
  obligation,
  onSuccess,
}: EditObligationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: obligation.description,
    type: obligation.type,
    dueDate: obligation.dueDate ? obligation.dueDate.split('T')[0] : '',
    responsibleParty: obligation.responsibleParty || '',
    status: obligation.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await contractService.updateObligation(contractId, obligation.id, formData);
      toast.success('Obligation updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update obligation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Obligation" size="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PAYMENT">Payment</option>
              <option value="DELIVERY">Delivery</option>
              <option value="REPORTING">Reporting</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INSURANCE">Insurance</option>
              <option value="COMPLIANCE">Compliance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

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
              <option value="OVERDUE">Overdue</option>
              <option value="WAIVED">Waived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Responsible Party</label>
          <Input
            type="text"
            value={formData.responsibleParty}
            onChange={(e) => setFormData({ ...formData, responsibleParty: e.target.value })}
            placeholder="Enter responsible party name..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            Update Obligation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
