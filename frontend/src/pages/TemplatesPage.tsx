import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { templateService } from '../services/template.service';
import { Template, ContractType } from '../types/template.types';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';
import { FileText, Plus, Search, Filter, Folder, Eye, Copy, Grid3x3, List } from 'lucide-react';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ContractType | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await templateService.list();
      setTemplates(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter templates based on search and type
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || template.contractType === selectedType;
    return matchesSearch && matchesType;
  });

  // Get contract type badge variant
  const getTypeVariant = (type: ContractType): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
      EMPLOYMENT: 'success',
      OFFER_LETTER: 'info',
      NDA: 'warning',
      VENDOR_SERVICE: 'gray',
      CONSULTING: 'info',
      PARTNERSHIP: 'success',
      SALES: 'success',
      LEASE: 'warning',
      IP_LICENSE: 'info',
    };
    return variants[type] || 'gray';
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/contracts/create?templateId=${templateId}`);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Contract Templates
            </h1>
            <p className="mt-2 text-gray-600">
              Choose from {templates.length} professional templates or create your own
            </p>
          </div>
          <Link to="/templates/create">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold">
              <Plus size={20} />
              Create Template
            </button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total Templates</div>
            <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Employment</div>
            <div className="text-2xl font-bold text-green-600">
              {templates.filter(t => [ContractType.EMPLOYMENT, ContractType.OFFER_LETTER].includes(t.contractType)).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Business</div>
            <div className="text-2xl font-bold text-blue-600">
              {templates.filter(t => [ContractType.VENDOR_SERVICE, ContractType.CONSULTING, ContractType.PARTNERSHIP].includes(t.contractType)).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Legal</div>
            <div className="text-2xl font-bold text-purple-600">
              {templates.filter(t => [ContractType.NDA, ContractType.IP_LICENSE].includes(t.contractType)).length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                className="input w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="w-full md:w-64">
              <select
                className="input w-full"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ContractType | 'ALL')}
              >
                <option value="ALL">All Types</option>
                <option value="EMPLOYMENT">Employment</option>
                <option value="OFFER_LETTER">Offer Letter</option>
                <option value="NDA">NDA</option>
                <option value="VENDOR_SERVICE">Vendor Service</option>
                <option value="CONSULTING">Consulting</option>
                <option value="PARTNERSHIP">Partnership</option>
                <option value="SALES">Sales</option>
                <option value="LEASE">Lease</option>
                <option value="IP_LICENSE">IP License</option>
                <option value="SUPPLY">Supply</option>
                <option value="PROCUREMENT">Procurement</option>
                <option value="SUBSCRIPTION">Subscription</option>
                <option value="FREELANCE">Freelance</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>

        {/* Templates Grid/List */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No templates found matching your criteria.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/templates/${template.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <Badge variant={getTypeVariant(template.contractType)}>
                    {template.contractType.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {template.description || 'No description available'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {template.category && (
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                        {template.category}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template.id);
                    }}
                  >
                    Use Template
                  </Button>
                </div>

                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <tr
                    key={template.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/templates/${template.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {template.name}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {template.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getTypeVariant(template.contractType)}>
                        {template.contractType.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {template.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseTemplate(template.id);
                        }}
                      >
                        Use Template
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
