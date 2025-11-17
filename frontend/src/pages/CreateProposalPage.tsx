import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { proposalService } from '../services/proposal.service';
import { ProposalStatus } from '../types/proposal.types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import RichTextEditor from '../components/common/RichTextEditor';
import { toast } from '../components/common/Toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateProposalPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: ProposalStatus.DRAFT,
  });
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

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
      setLoading(true);
      const proposal = await proposalService.create(formData);
      toast.success('Proposal created successfully!');
      navigate(`/proposals/${proposal.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);
      const proposal = await proposalService.create({
        ...formData,
        status: ProposalStatus.DRAFT,
      });
      toast.success('Proposal saved as draft!');
      navigate(`/proposals/${proposal.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/proposals')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Proposals
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Proposal</h1>
        <p className="mt-2 text-sm text-gray-700">
          Fill in the details to create a new proposal
        </p>
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
              placeholder="Enter proposal title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
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
                setFormData({ ...formData, status: e.target.value as ProposalStatus })
              }
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {Object.values(ProposalStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Write your proposal content here..."
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
            onClick={() => navigate('/proposals')}
            disabled={loading}
          >
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveAsDraft}
              disabled={loading}
            >
              <Save size={18} className="mr-2" />
              Save as Draft
            </Button>
            <Button type="submit" variant="primary" disabled={loading} loading={loading}>
              <Save size={18} className="mr-2" />
              Create Proposal
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
