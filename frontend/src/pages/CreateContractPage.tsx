import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { templateService } from '../services/template.service';
import { contractService } from '../services/contract.service';
import { Template, ContractType } from '../types/template.types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';

export default function CreateContractPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateIdFromUrl = searchParams.get('templateId');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Steps
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (templateIdFromUrl && templates.length > 0) {
      const template = templates.find((t) => t.id === templateIdFromUrl);
      if (template) {
        handleSelectTemplate(template);
      }
    }
  }, [templateIdFromUrl, templates]);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await templateService.list();
      setTemplates(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentStep(2);

    // Initialize field values
    const initialValues: Record<string, string> = {};
    if (template.requiredFields) {
      template.requiredFields.forEach((field) => {
        initialValues[field] = '';
      });
    }
    if (template.optionalFields) {
      template.optionalFields.forEach((field) => {
        initialValues[field] = '';
      });
    }
    setFieldValues(initialValues);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFieldValues({
      ...fieldValues,
      [field]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    // Validate required fields
    if (selectedTemplate.requiredFields) {
      const missingFields = selectedTemplate.requiredFields.filter(
        (field) => !fieldValues[field] || fieldValues[field].trim() === ''
      );
      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }
    }

    if (!title.trim()) {
      setError('Contract title is required');
      return;
    }

    setIsCreating(true);
    try {
      const response = await contractService.createFromTemplate({
        templateId: selectedTemplate.id,
        title,
        description: description || undefined,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        totalValue: totalValue ? parseFloat(totalValue) : undefined,
        fieldValues,
      });

      navigate(`/contracts/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create contract');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoadingTemplates) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/contracts')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
              <p className="mt-1 text-sm text-gray-600">
                {currentStep === 1
                  ? 'Step 1: Choose a template'
                  : currentStep === 2
                  ? 'Step 2: Fill in contract details'
                  : 'Step 3: Review and create'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-24 h-1 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Template Selection */}
        {currentStep === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose a Template</h2>
              <p className="text-gray-600">Select a contract template to get started</p>
            </div>

            {templates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">No templates available. Please create a template first.</p>
                <Button className="mt-4" onClick={() => navigate('/templates/create')}>
                  Create Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <Badge variant="info">
                        {template.contractType.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {template.description || 'No description available'}
                    </p>
                    <div className="pt-4 border-t border-gray-100">
                      <Button size="sm" fullWidth onClick={() => handleSelectTemplate(template)}>
                        Use This Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Contract Details */}
        {currentStep === 2 && selectedTemplate && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contract Details</h2>
              <p className="text-gray-600">
                Template: <span className="font-medium">{selectedTemplate.name}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <Input
                    label="Contract Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g., John Doe Employment Agreement"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="input w-full"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Effective Date"
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                    />

                    <Input
                      label="Expiration Date"
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Total Value (USD)"
                    type="number"
                    step="0.01"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Required Fields */}
              {selectedTemplate.requiredFields && selectedTemplate.requiredFields.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Required Template Fields
                  </h3>
                  <div className="space-y-4">
                    {selectedTemplate.requiredFields.map((field) => (
                      <Input
                        key={field}
                        label={field}
                        value={fieldValues[field] || ''}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        required
                        placeholder={`Enter ${field}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Fields */}
              {selectedTemplate.optionalFields && selectedTemplate.optionalFields.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Optional Template Fields
                  </h3>
                  <div className="space-y-4">
                    {selectedTemplate.optionalFields.map((field) => (
                      <Input
                        key={field}
                        label={field}
                        value={fieldValues[field] || ''}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        placeholder={`Enter ${field} (optional)`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedTemplate(null);
                  }}
                >
                  Back to Templates
                </Button>
                <Button type="submit" isLoading={isCreating} className="flex-1">
                  Create Contract
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
