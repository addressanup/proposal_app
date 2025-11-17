import { useState } from 'react';
import { contractService } from '../../services/contract.service';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { toast } from '../common/Toast';
import { Plus, Edit, Trash2, User, Mail, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Counterparty {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  address?: string;
  signedAt?: string;
}

interface CounterpartiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  counterparties: Counterparty[];
  onUpdate: () => void;
}

export default function CounterpartiesModal({
  isOpen,
  onClose,
  contractId,
  counterparties,
  onUpdate,
}: CounterpartiesModalProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCounterparty, setEditingCounterparty] = useState<Counterparty | null>(null);

  const handleDelete = async (counterpartyId: string) => {
    if (!window.confirm('Are you sure you want to remove this counterparty?')) return;
    try {
      await contractService.removeCounterparty(contractId, counterpartyId);
      toast.success('Counterparty removed');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove counterparty');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Counterparties" size="large">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">{counterparties.length} counterparties</p>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} className="mr-2" />
              Add Counterparty
            </Button>
          </div>

          {counterparties.length === 0 ? (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No counterparties yet</p>
              <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus size={16} className="mr-2" />
                Add First Counterparty
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {counterparties.map((counterparty) => (
                <div key={counterparty.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{counterparty.name}</h3>
                          <Badge variant="info">{counterparty.role.replace(/_/g, ' ')}</Badge>
                          {counterparty.signedAt && (
                            <Badge variant="success">
                              <CheckCircle size={12} className="mr-1" />
                              Signed
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {counterparty.email && (
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              {counterparty.email}
                            </div>
                          )}
                          {counterparty.phone && <div>Phone: {counterparty.phone}</div>}
                          {counterparty.address && <div>Address: {counterparty.address}</div>}
                          {counterparty.signedAt && (
                            <div className="text-green-600">
                              Signed: {format(parseISO(counterparty.signedAt), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingCounterparty(counterparty)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(counterparty.id)}
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

      <AddEditCounterpartyModal
        isOpen={showAddModal || !!editingCounterparty}
        onClose={() => {
          setShowAddModal(false);
          setEditingCounterparty(null);
        }}
        contractId={contractId}
        counterparty={editingCounterparty}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingCounterparty(null);
          onUpdate();
        }}
      />
    </>
  );
}

interface AddEditCounterpartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  counterparty?: Counterparty | null;
  onSuccess: () => void;
}

function AddEditCounterpartyModal({
  isOpen,
  onClose,
  contractId,
  counterparty,
  onSuccess,
}: AddEditCounterpartyModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: counterparty?.name || '',
    role: counterparty?.role || 'PARTY',
    email: counterparty?.email || '',
    phone: counterparty?.phone || '',
    address: counterparty?.address || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setLoading(true);
      if (counterparty) {
        await contractService.updateCounterparty(contractId, counterparty.id, formData);
        toast.success('Counterparty updated');
      } else {
        await contractService.addCounterparty(contractId, formData);
        toast.success('Counterparty added');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save counterparty');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={counterparty ? 'Edit Counterparty' : 'Add Counterparty'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="PARTY">Party</option>
            <option value="CLIENT">Client</option>
            <option value="VENDOR">Vendor</option>
            <option value="CONTRACTOR">Contractor</option>
            <option value="SUBCONTRACTOR">Subcontractor</option>
            <option value="GUARANTOR">Guarantor</option>
            <option value="WITNESS">Witness</option>
            <option value="NOTARY">Notary</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter address..."
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            {counterparty ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
