import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateService } from '../services/template.service';
import { Template } from '../types/template.types';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    if (!id) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await templateService.getById(id);
      setTemplate(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!id) return;

    setIsPreviewLoading(true);
    try {
      // Generate sample data for preview
      const sampleData: Record<string, string> = {};
      if (template?.requiredFields) {
        template.requiredFields.forEach((field: string) => {
          sampleData[field] = `[Sample ${field}]`;
        });
      }
      if (template?.optionalFields) {
        template.optionalFields.forEach((field: string) => {
          sampleData[field] = `[Sample ${field}]`;
        });
      }

      const response = await templateService.preview(id, sampleData);
      setPreviewHtml(response.data.preview);
      setIsPreviewOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleClone = async () => {
    if (!id || !template) return;

    try {
      const newName = `${template.name} (Copy)`;
      const response = await templateService.clone(id, newName);
      navigate(`/templates/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clone template');
    }
  };

  const handleUseTemplate = () => {
    navigate(`/contracts/create?templateId=${id}`);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error && !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Template not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/templates')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                <Badge variant="info">
                  {template.contractType.replace(/_/g, ' ')}
                </Badge>
              </div>
              {template.category && (
                <p className="mt-1 text-sm text-gray-600">Category: {template.category}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClone}>
                Clone Template
              </Button>
              <Button variant="secondary" onClick={handlePreview} isLoading={isPreviewLoading}>
                Preview
              </Button>
              <Button variant="primary" onClick={handleUseTemplate}>
                Use This Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {template.description || 'No description available'}
              </p>
            </div>

            {/* Required Fields */}
            {template.requiredFields && template.requiredFields.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Required Fields ({template.requiredFields.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {template.requiredFields.map((field: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Fields */}
            {template.optionalFields && template.optionalFields.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Optional Fields ({template.optionalFields.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {template.optionalFields.map((field: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Template Content Preview */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Template Content</h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {template.content}
                </pre>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Info</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="text-sm font-medium text-gray-900">
                    {template.contractType.replace(/_/g, ' ')}
                  </div>
                </div>

                {template.category && (
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="text-sm font-medium text-gray-900">{template.category}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {template.updatedAt && (
                  <div>
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button fullWidth onClick={handleUseTemplate}>
                  Create Contract
                </Button>
                <Button fullWidth variant="secondary" onClick={handlePreview} isLoading={isPreviewLoading}>
                  Preview with Sample Data
                </Button>
                <Button fullWidth variant="secondary" onClick={handleClone}>
                  Clone Template
                </Button>
              </div>
            </div>

            {/* Usage Statistics (Placeholder) */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Statistics</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Times Used</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Contracts</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Template Preview"
        size="lg"
      >
        <div className="prose max-w-none">
          <div
            className="bg-white p-6 rounded border border-gray-200"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
            Close
          </Button>
          <Button onClick={handleUseTemplate}>
            Use This Template
          </Button>
        </div>
      </Modal>
    </div>
  );
}
