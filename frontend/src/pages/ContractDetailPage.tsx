import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractService } from '../services/contract.service';
import { documentService, Document } from '../services/document.service';
import { Contract, ContractStatus } from '../types/contract.types';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';
import { toast } from '../components/common/Toast';
import VersionHistoryModal from '../components/proposal/VersionHistoryModal';
import CommentSection from '../components/proposal/CommentSection';
import DocumentUpload from '../components/proposal/DocumentUpload';
import SignatureRequestModal from '../components/proposal/SignatureRequestModal';
import { exportContractToPDF } from '../utils/pdfExport';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  FileSignature,
  Clock,
  MessageSquare,
  Paperclip,
} from 'lucide-react';
import { format } from 'date-fns';

type TabType = 'details' | 'comments' | 'documents';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Modal states
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSignatureRequest, setShowSignatureRequest] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContract();
      loadDocuments();
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

  const loadDocuments = async () => {
    if (!id) return;
    try {
      setLoadingDocuments(true);
      const data = await documentService.getContractDocuments(id);
      setDocuments(data);
    } catch (error: any) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contract?')) {
      return;
    }

    try {
      await contractService.delete(id!);
      toast.success('Contract deleted successfully');
      navigate('/contracts');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete contract');
    }
  };

  const handleExportPDF = async () => {
    if (!contract) return;

    try {
      const signers = contract.counterparties?.map((cp) => ({
        name: cp.name,
        email: cp.email || '',
        signed: !!cp.signedAt,
      })) || [];

      await exportContractToPDF(
        contract.title,
        contract.content || '',
        signers,
        {
          status: contract.status,
          contractType: contract.contractType,
          effectiveDate: contract.effectiveDate ? format(new Date(contract.effectiveDate), 'MMMM d, yyyy') : undefined,
          expirationDate: contract.expirationDate ? format(new Date(contract.expirationDate), 'MMMM d, yyyy') : undefined,
          totalValue: contract.totalValue,
        }
      );
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/contracts')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Contracts
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{contract.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Badge variant={getStatusVariant(contract.status)}>
                {contract.status.replace(/_/g, ' ')}
              </Badge>
              <span>{contract.contractType.replace(/_/g, ' ')}</span>
              <span>Updated {format(new Date(contract.updatedAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/contracts/${id}/edit`)}
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowVersionHistory(true)}>
              <Clock size={16} className="mr-2" />
              History
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowSignatureRequest(true)}>
              <FileSignature size={16} className="mr-2" />
              Signatures
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportPDF}>
              <Download size={16} className="mr-2" />
              Export PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDelete}>
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(contract.totalValue)}
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Effective Date</div>
          <div className="text-lg font-semibold text-gray-900">
            {contract.effectiveDate
              ? new Date(contract.effectiveDate).toLocaleDateString()
              : 'Not set'}
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Expiration Date</div>
          <div className="text-lg font-semibold text-gray-900">
            {contract.expirationDate
              ? new Date(contract.expirationDate).toLocaleDateString()
              : 'No expiration'}
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare size={16} className="mr-2" />
            Comments
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Paperclip size={16} className="mr-2" />
            Documents
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'details' && (
          <>
            {/* Description */}
            {contract.description && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{contract.description}</p>
              </div>
            )}

            {/* Contract Content */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contract Content</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: contract.content || '<p class="text-gray-500">No content available</p>' }}
              />
            </div>
            {/* Counterparties */}
            {contract.counterparties && contract.counterparties.length > 0 && (
              <div className="bg-white shadow-sm rounded-lg p-6">
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
              <div className="bg-white shadow-sm rounded-lg p-6">
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
              <div className="bg-white shadow-sm rounded-lg p-6">
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
          </>
        )}

        {activeTab === 'comments' && <CommentSection proposalId={id!} />}

        {activeTab === 'documents' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <DocumentUpload
              proposalId={id!}
              existingDocuments={documents}
              onUploadComplete={loadDocuments}
              onDeleteDocument={loadDocuments}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <VersionHistoryModal
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        proposalId={id!}
        currentTitle={contract.title}
        onRevert={fetchContract}
      />

      <SignatureRequestModal
        isOpen={showSignatureRequest}
        onClose={() => setShowSignatureRequest(false)}
        proposalId={id!}
        proposalTitle={contract.title}
      />
    </div>
  );
}
