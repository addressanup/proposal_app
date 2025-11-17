import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { organizationService } from '../services/organization.service';
import { Organization, CreateOrganizationData } from '../types/organization.types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import { toast } from '../components/common/Toast';
import { Building2, Plus, Users, FileText, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateOrganizationData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationService.list();
      setOrganizations(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      setCreating(true);
      await organizationService.create(formData);
      toast.success('Organization created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      loadOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await organizationService.delete(id);
      toast.success('Organization deleted successfully');
      loadOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your organizations and team members
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="mr-2" />
            New Organization
          </Button>
        </div>
      </div>

      {/* Organizations List */}
      {organizations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first organization
          </p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="mr-2" />
            Create Organization
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building2 size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(org.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                {org.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {org.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{org._count?.members || 0} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={16} />
                    <span>{(org._count?.proposals || 0) + (org._count?.contracts || 0)} docs</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/organizations/${org.id}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      <Pencil size={16} className="mr-2" />
                      Manage
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(org.id, org.name)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ name: '', description: '' });
        }}
        title="Create New Organization"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Acme Corporation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Brief description of your organization"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ name: '', description: '' });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={creating} disabled={creating}>
              Create Organization
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
