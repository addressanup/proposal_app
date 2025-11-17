import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { templateService } from '../services/template.service';
import { ContractType, ContractCategory } from '../types/template.types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import { toast } from '../components/common/Toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contractType, setContractType] = useState<ContractType>(ContractType.EMPLOYMENT);
  const [category, setCategory] = useState<ContractCategory>(ContractCategory.EMPLOYMENT_HR);
  const [content, setContent] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const response = await templateService.getById(id!);
      const template = response.data;

      setName(template.name);
      setDescription(template.description || '');
      setContractType(template.contractType);
      setCategory(template.category);
      setContent(template.content || '');
      setJurisdiction(template.jurisdiction?.join(', ') || '');
      setTags(template.tags?.join(', ') || '');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load template');
      navigate('/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!content.trim()) {
      setError('Template content is required');
      return;
    }

    setSaving(true);
    try {
      await templateService.update(id!, {
        name: name.trim(),
        description: description.trim() || undefined,
        contractType,
        category,
        content: content.trim(),
        jurisdiction: jurisdiction ? jurisdiction.split(',').map(j => j.trim()) : [],
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
      });

      toast.success('Template updated successfully!');
      navigate(`/templates/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update template');
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
          onClick={() => navigate(`/templates/${id}`)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Template
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Template</h1>
        <p className="mt-2 text-sm text-gray-700">Update template details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Employment Agreement"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of this template"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Type
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {Object.values(ContractType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContractCategory)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {Object.values(ContractCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="Enter the template content with placeholders like {{company_name}}, {{employee_name}}, etc."
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              Use double curly braces for placeholders: {"{{placeholder_name}}"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jurisdiction (comma-separated)"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="e.g., California, New York, Federal"
            />

            <Input
              label="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., standard, tech, remote"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/templates/${id}`)}
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
