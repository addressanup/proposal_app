import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService } from '../services/template.service';
import { ContractType, ContractCategory } from '../types/template.types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function CreateTemplatePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contractType, setContractType] = useState<ContractType>(ContractType.EMPLOYMENT);
  const [category, setCategory] = useState<ContractCategory>(ContractCategory.EMPLOYMENT_HR);
  const [content, setContent] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [tags, setTags] = useState('');

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

    setIsCreating(true);
    try {
      const response = await templateService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        contractType,
        category,
        content: content.trim(),
        structure: {
          sections: [
            {
              id: 's1',
              name: 'Main Content',
              order: 1,
              clauseIds: []
            }
          ]
        },
        requiredFields: {},
        optionalFields: {},
        conditionalFields: {},
        jurisdiction: jurisdiction ? jurisdiction.split(',').map(j => j.trim()) : [],
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
      });

      navigate(`/templates/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create template');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Template</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create a new contract template
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/templates')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Brief description of the template"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
              Template Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder="Enter the template content here. You can use placeholders like {{fieldName}} for dynamic fields."
              required
            />
          </div>

          <Input
            label="Jurisdiction (comma-separated)"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            placeholder="e.g., US, California"
          />

          <Input
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., employment, hr, standard"
          />

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/templates')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

