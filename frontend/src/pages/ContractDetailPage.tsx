import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractService } from '../services/contract.service';
import { Contract, ContractStatus } from '../types/contract.types';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id]);

  const fetchContract = async () => {
    if (!id) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await contractService.getById(id);
      setContract(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load contract');
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error && !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Contract not found</div>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(contract.expirationDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/contracts')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
                <Badge variant={getStatusVariant(contract.status)}>
                  {contract.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {contract.contractType.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate(`/contracts/${id}/edit`)}>
                Edit
              </Button>
              <Button variant="danger">
                Delete
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Total Value</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(contract.totalValue)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Effective Date</div>
              <div className="text-lg font-semibold text-gray-900">
                {contract.effectiveDate
                  ? new Date(contract.effectiveDate).toLocaleDateString()
                  : 'Not set'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Expiration Date</div>
              <div className="text-lg font-semibold text-gray-900">
                {contract.expirationDate
                  ? new Date(contract.expirationDate).toLocaleDateString()
                  : 'No expiration'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Days Remaining</div>
              <div className="text-lg font-semibold text-gray-900">
                {daysUntilExpiry !== null
                  ? daysUntilExpiry > 0
                    ? `${daysUntilExpiry} days`
                    : 'Expired'
                  : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {contract.description && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{contract.description}</p>
              </div>
            )}

            {/* Contract Content */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contract Content</h2>
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: contract.content || '<p class="text-gray-500">No content available</p>' }}
                />
              </div>
            </div>

            {/* Counterparties */}
            {contract.counterparties && contract.counterparties.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Counterparties ({contract.counterparties.length})
                </h2>
                <div className="space-y-3">
                  {contract.counterparties.map((party) => (
                    <div
                      key={party.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{party.name}</div>
                        <div className="text-sm text-gray-600">
                          {party.role?.replace(/_/g, ' ')}
                        </div>
                        {party.email && (
                          <div className="text-sm text-gray-500">{party.email}</div>
                        )}
                      </div>
                      {party.signedAt && (
                        <Badge variant="success">Signed</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Obligations */}
            {contract.obligations && contract.obligations.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Obligations ({contract.obligations.length})
                </h2>
                <div className="space-y-3">
                  {contract.obligations.map((obligation) => (
                    <div
                      key={obligation.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{obligation.description}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Type: {obligation.type?.replace(/_/g, ' ')}
                        </div>
                        {obligation.dueDate && (
                          <div className="text-sm text-gray-500">
                            Due: {new Date(obligation.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Badge variant={obligation.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {obligation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {contract.milestones && contract.milestones.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Milestones ({contract.milestones.length})
                </h2>
                <div className="space-y-3">
                  {contract.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{milestone.name}</div>
                        {milestone.description && (
                          <div className="text-sm text-gray-600 mt-1">{milestone.description}</div>
                        )}
                        {milestone.dueDate && (
                          <div className="text-sm text-gray-500">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {milestone.paymentAmount && (
                          <div className="text-sm text-gray-700 font-medium">
                            Payment: {formatCurrency(milestone.paymentAmount)}
                          </div>
                        )}
                      </div>
                      <Badge variant={milestone.status === 'COMPLETED' ? 'success' : 'info'}>
                        {milestone.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contract Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Info</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Contract Type</div>
                  <div className="text-sm font-medium text-gray-900">
                    {contract.contractType.replace(/_/g, ' ')}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(contract.status)}>
                      {contract.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                {contract.effectiveDate && (
                  <div>
                    <div className="text-sm text-gray-500">Effective Date</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(contract.effectiveDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {contract.expirationDate && (
                  <div>
                    <div className="text-sm text-gray-500">Expiration Date</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(contract.expirationDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {contract.totalValue && (
                  <div>
                    <div className="text-sm text-gray-500">Total Value</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(contract.totalValue)}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(contract.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button fullWidth variant="secondary" onClick={() => navigate(`/contracts/${id}/edit`)}>
                  Edit Contract
                </Button>
                <Button fullWidth variant="secondary">
                  Download PDF
                </Button>
                <Button fullWidth variant="secondary">
                  View Version History
                </Button>
                <Button fullWidth variant="secondary">
                  Add Comment
                </Button>
                <Button fullWidth variant="danger">
                  Delete Contract
                </Button>
              </div>
            </div>

            {/* Related */}
            {contract.templateId && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Template</h3>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => navigate(`/templates/${contract.templateId}`)}
                >
                  View Template
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
