import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { proposalService } from '../services/proposal.service';
import { documentService, Document } from '../services/document.service';
import { Proposal } from '../types/proposal.types';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import { toast } from '../components/common/Toast';
import VersionHistoryModal from '../components/proposal/VersionHistoryModal';
import CollaboratorModal from '../components/proposal/CollaboratorModal';
import ShareLinkModal from '../components/proposal/ShareLinkModal';
import SignatureRequestModal from '../components/proposal/SignatureRequestModal';
import CommentSection from '../components/proposal/CommentSection';
import DocumentUpload from '../components/proposal/DocumentUpload';
import { exportProposalToPDF } from '../utils/pdfExport';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  FileSignature,
  Clock,
  Users,
  MessageSquare,
  Download,
  Paperclip,
} from 'lucide-react';
import { format } from 'date-fns';

type TabType = 'content' | 'comments' | 'documents';

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Modal states
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [showSignatureRequest, setShowSignatureRequest] = useState(false);

  useEffect(() => {
    if (id) {
      loadProposal();
      loadDocuments();
    }
  }, [id]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const data = await proposalService.getById(id!);
      setProposal(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load proposal');
      navigate('/proposals');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const data = await documentService.getProposalDocuments(id!);
      setDocuments(data);
    } catch (error: any) {
      console.error('Failed to load documents:', error);
      // Don't show error toast for documents - they're not critical
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this proposal?')) {
      return;
    }

    try {
      await proposalService.delete(id!);
      toast.success('Proposal deleted successfully');
      navigate('/proposals');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete proposal');
    }
  };

  const handleExportPDF = async () => {
    if (!proposal) return;

    try {
      await exportProposalToPDF(proposal.title, proposal.content, {
        author: `${proposal.creator?.firstName} ${proposal.creator?.lastName}`,
        status: proposal.status,
        createdDate: format(new Date(proposal.createdAt), 'MMMM d, yyyy'),
        version: proposal.currentVersion || 1,
      });
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'gray',
      PENDING_REVIEW: 'yellow',
      UNDER_NEGOTIATION: 'blue',
      FINAL: 'purple',
      SIGNED: 'green',
      ARCHIVED: 'gray',
      REJECTED: 'red',
    };
    return colors[status] || 'gray';
  };

  if (loading || !proposal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/proposals')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Proposals
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{proposal.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Badge color={getStatusColor(proposal.status)}>
                {proposal.status.replace(/_/g, ' ')}
              </Badge>
              <span>Version {proposal.currentVersion || 1}</span>
              <span>Updated {format(new Date(proposal.updatedAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/proposals/${id}/edit`)}
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowVersionHistory(true)}>
              <Clock size={16} className="mr-2" />
              History
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowCollaborators(true)}>
              <Users size={16} className="mr-2" />
              Collaborators
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowShareLink(true)}>
              <Share2 size={16} className="mr-2" />
              Share
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Content
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
      <div className="bg-white shadow-sm rounded-lg p-6">
        {activeTab === 'content' && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: proposal.content }}
          />
        )}

        {activeTab === 'comments' && <CommentSection proposalId={id!} />}

        {activeTab === 'documents' && (
          <DocumentUpload
            proposalId={id!}
            existingDocuments={documents}
            onUploadComplete={loadDocuments}
            onDeleteDocument={loadDocuments}
          />
        )}
      </div>

      {/* Modals */}
      <VersionHistoryModal
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        proposalId={id!}
        currentTitle={proposal.title}
        onRevert={loadProposal}
      />

      <CollaboratorModal
        isOpen={showCollaborators}
        onClose={() => setShowCollaborators(false)}
        proposalId={id!}
        proposalTitle={proposal.title}
      />

      <ShareLinkModal
        isOpen={showShareLink}
        onClose={() => setShowShareLink(false)}
        proposalId={id!}
        proposalTitle={proposal.title}
      />

      <SignatureRequestModal
        isOpen={showSignatureRequest}
        onClose={() => setShowSignatureRequest(false)}
        proposalId={id!}
        proposalTitle={proposal.title}
      />
    </div>
  );
}
