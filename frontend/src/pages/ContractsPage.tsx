import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contractService } from '../services/contract.service';
import { Contract, ContractStatus, ContractType } from '../types/contract.types';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';
import { FileSignature, Plus, Search, Filter, Calendar, DollarSign, Eye, Edit2, Trash2, Clock, AlertTriangle } from 'lucide-react';

export default function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ContractType | 'ALL'>('ALL');
  const [expiringFilter, setExpiringFilter] = useState<'ALL' | '30' | '60' | '90'>('ALL');

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchContracts();
  }, [currentPage, selectedStatus, selectedType, expiringFilter]);

  const fetchContracts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (selectedStatus !== 'ALL') filters.status = selectedStatus;
      if (selectedType !== 'ALL') filters.contractType = selectedType;

      const response = await contractService.list(filters, currentPage, ITEMS_PER_PAGE);
      setContracts(response.data);
      setTotalCount(response.pagination?.total || response.data.length);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load contracts');
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side search filter
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Expiring filter
    if (expiringFilter !== 'ALL' && contract.expirationDate) {
      const daysUntilExpiry = Math.ceil(
        (new Date(contract.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const days = parseInt(expiringFilter);
      if (daysUntilExpiry > days || daysUntilExpiry < 0) return false;
    }

    return matchesSearch;
  });

  // Get status badge variant
  const getStatusVariant = (status: ContractStatus): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
      ACTIVE: 'success',
      FULLY_EXECUTED: 'success',
      DRAFT: 'gray',
      PENDING_APPROVAL: 'info',
      IN_REVIEW: 'info',
      APPROVED: 'success',
      PENDING_SIGNATURE: 'warning',
      PARTIALLY_SIGNED: 'warning',
      EXPIRING_SOON: 'warning',
      EXPIRED: 'error',
      TERMINATED: 'error',
      CANCELLED: 'error',
      REJECTED: 'error',
      ARCHIVED: 'gray',
    };
    return variants[status] || 'gray';
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expirationDate?: Date | string) => {
    if (!expirationDate) return null;
    const days = Math.ceil(
      (new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (isLoading && contracts.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Contracts
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and track all your business contracts
            </p>
          </div>
          <Link to="/contracts/create">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold">
              <Plus size={20} />
              New Contract
            </button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === ContractStatus.ACTIVE).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Draft</div>
            <div className="text-2xl font-bold text-gray-500">
              {contracts.filter(c => c.status === ContractStatus.DRAFT).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {contracts.filter(c => [ContractStatus.PENDING_APPROVAL, ContractStatus.PENDING_SIGNATURE].includes(c.status)).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Expiring Soon</div>
            <div className="text-2xl font-bold text-orange-600">
              {contracts.filter(c => {
                const days = getDaysUntilExpiry(c.expirationDate);
                return days !== null && days <= 30 && days > 0;
              }).length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as ContractStatus | 'ALL');
                setCurrentPage(1);
              }}
              className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING_SIGNATURE">Pending Signature</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as ContractType | 'ALL');
                setCurrentPage(1);
              }}
              className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
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
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Expiring Filter */}
          <div className="relative">
            <select
              value={expiringFilter}
              onChange={(e) => setExpiringFilter(e.target.value as any)}
              className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="ALL">All Contracts</option>
              <option value="30">Expiring in 30 days</option>
              <option value="60">Expiring in 60 days</option>
              <option value="90">Expiring in 90 days</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Contracts Grid */}
      {filteredContracts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <FileSignature size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No contracts found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchTerm || selectedStatus !== 'ALL' || selectedType !== 'ALL'
              ? 'Try adjusting your search or filters to find what you\'re looking for'
              : 'Get started by creating your first contract to manage your business agreements'}
          </p>
          <Link to="/contracts/create">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold">
              <Plus size={20} />
              Create Your First Contract
            </button>
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredContracts.length} of {totalCount} contracts
            </div>
            {isLoading && <Loading />}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContracts.map((contract) => {
              const daysUntilExpiry = getDaysUntilExpiry(contract.expirationDate);
              const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

              return (
                <div
                  key={contract.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link
                          to={`/contracts/${contract.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {contract.title}
                        </Link>
                        {contract.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {contract.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={getStatusVariant(contract.status)}>
                        {contract.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    {/* Type Badge */}
                    <div className="inline-flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full text-xs font-medium text-blue-700">
                      <FileSignature size={14} />
                      {contract.contractType.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    {contract.effectiveDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>Starts {new Date(contract.effectiveDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {contract.expirationDate && (
                      <div className={`flex items-center gap-2 text-sm ${isExpiringSoon ? 'text-orange-600' : 'text-gray-600'}`}>
                        <Clock size={16} className={isExpiringSoon ? 'text-orange-500' : 'text-gray-400'} />
                        <span>
                          Expires {new Date(contract.expirationDate).toLocaleDateString()}
                          {isExpiringSoon && (
                            <span className="ml-2 inline-flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded-full text-xs font-medium text-orange-700">
                              <AlertTriangle size={12} />
                              {daysUntilExpiry}d left
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {contract.totalValue && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <DollarSign size={16} className="text-green-600" />
                        <span>{formatCurrency(contract.totalValue)}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <Link
                      to={`/contracts/${contract.id}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      <Eye size={16} />
                      View Contract
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
