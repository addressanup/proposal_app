import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contractService } from '../services/contract.service';
import { ContractStatus } from '../types/contract.types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import RichTextEditor from '../components/common/RichTextEditor';
import Loading from '../components/common/Loading';
import { toast } from '../components/common/Toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditContractPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    status: ContractStatus.DRAFT,
    effectiveDate: '',
    expirationDate: '',
    totalValue: '',
  });
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    effectiveDate?: string;
  }>({});

  useEffect(() => {
    if (id) {
      loadContract();
    }
  }, [id]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const response = await contractService.getById(id!);
      const contract = response.data;
      setFormData({
        title: contract.title,
        description: contract.description || '',
        content: contract.content || '',
        status: contract.status,
        effectiveDate: contract.effectiveDate
          ? new Date(contract.effectiveDate).toISOString().split('T')[0]
          : '',
        expirationDate: contract.expirationDate
          ? new Date(contract.expirationDate).toISOString().split('T')[0]
          : '',
        totalValue: contract.totalValue?.toString() || '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load contract');
      navigate('/contracts');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.content.trim() || formData.content === '<p></p>') {
      newErrors.content = 'Content is required';
    }

    if (formData.effectiveDate && formData.expirationDate) {
      if (new Date(formData.effectiveDate) > new Date(formData.expirationDate)) {
        newErrors.effectiveDate = 'Effective date must be before expiration date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setSaving(true);
      await contractService.update(id!, {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        status: formData.status,
        effectiveDate: formData.effectiveDate || undefined,
        expirationDate: formData.expirationDate || undefined,
        totalValue: formData.totalValue ? parseFloat(formData.totalValue) : undefined,
      });
      toast.success('Contract updated successfully!');
      navigate(`/contracts/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update contract');
    } finally {
      setSaving(false);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/contracts/${id}`)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Contract
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Contract</h1>
        <p className="mt-2 text-sm text-gray-700">Update contract details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Enter contract title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Enter a brief description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Status */}
          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as ContractStatus })
              }
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {Object.values(ContractStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Dates and Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date
              </label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                error={errors.effectiveDate}
              />
            </div>
            <div>
              <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date
              </label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="totalValue" className="block text-sm font-medium text-gray-700 mb-2">
                Total Value ($)
              </label>
              <Input
                id="totalValue"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.totalValue}
                onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Write your contract content here..."
            />
            {errors.content && (
              <p className="mt-2 text-sm text-red-600">{errors.content}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/contracts/${id}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving} loading={saving}>
            <Save size={18} className="mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
