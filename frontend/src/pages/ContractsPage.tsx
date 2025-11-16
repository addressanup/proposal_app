import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../services/contract.service';
import { Contract, ContractStatus, ContractType } from '../types/contract.types';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and track all your contracts
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/contracts/create')}
            >
              Create Contract
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search contracts..."
                className="input w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="input w-full"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as ContractStatus | 'ALL');
                  setCurrentPage(1);
                }}
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
            </div>

            {/* Type Filter */}
            <div>
              <select
                className="input w-full"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as ContractType | 'ALL');
                  setCurrentPage(1);
                }}
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
            </div>

            {/* Expiring Filter */}
            <div>
              <select
                className="input w-full"
                value={expiringFilter}
                onChange={(e) => setExpiringFilter(e.target.value as any)}
              >
                <option value="ALL">All Contracts</option>
                <option value="30">Expiring in 30 days</option>
                <option value="60">Expiring in 60 days</option>
                <option value="90">Expiring in 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredContracts.length} of {totalCount} contracts
          </div>
          {isLoading && <Loading />}
        </div>

        {/* Contracts Table */}
        {filteredContracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No contracts found matching your criteria.</p>
            <Button
              className="mt-4"
              onClick={() => navigate('/contracts/create')}
            >
              Create Your First Contract
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => {
                  const daysUntilExpiry = getDaysUntilExpiry(contract.expirationDate);
                  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                  return (
                    <tr
                      key={contract.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/contracts/${contract.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contract.title}
                          </div>
                          {contract.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {contract.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {contract.contractType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(contract.status)}>
                          {contract.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {contract.effectiveDate && (
                            <div>Start: {new Date(contract.effectiveDate).toLocaleDateString()}</div>
                          )}
                          {contract.expirationDate && (
                            <div className={isExpiringSoon ? 'text-orange-600 font-medium' : ''}>
                              End: {new Date(contract.expirationDate).toLocaleDateString()}
                              {isExpiringSoon && (
                                <span className="ml-1">({daysUntilExpiry}d)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatCurrency(contract.totalValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/contracts/${contract.id}`);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
