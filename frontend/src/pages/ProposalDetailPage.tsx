import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { proposalService } from '../services/proposal.service';
import {
  Proposal,
  ProposalVersion,
  Comment,
  ProposalCollaborator,
} from '../types/proposal.types';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import { toast } from '../components/common/Toast';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  FileSignature,
  Clock,
  MessageSquare,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';

type TabType = 'content' | 'versions' | 'comments' | 'collaborators';

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [collaborators, setCollaborators] = useState<ProposalCollaborator[]>([]);

  useEffect(() => {
    if (id) {
      loadProposal();
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === 'versions') {
      loadVersions();
    } else if (id && activeTab === 'comments') {
      loadComments();
    } else if (id && activeTab === 'collaborators') {
      loadCollaborators();
    }
  }, [activeTab, id]);

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

  const loadVersions = async () => {
    try {
      const data = await proposalService.getVersions(id!);
      setVersions(data);
    } catch (error: any) {
      toast.error('Failed to load versions');
    }
  };

  const loadComments = async () => {
    try {
      const data = await proposalService.getComments(id!);
      setComments(data);
    } catch (error: any) {
      toast.error('Failed to load comments');
    }
  };

  const loadCollaborators = async () => {
    try {
      const data = await proposalService.getCollaborators(id!);
      setCollaborators(data);
    } catch (error: any) {
      toast.error('Failed to load collaborators');
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
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/proposals/${id}/edit`)}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
            <Button variant="secondary" size="sm">
              <FileSignature size={16} className="mr-2" />
              Sign
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
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeTab === 'versions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock size={16} className="mr-2" />
            Versions
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
            onClick={() => setActiveTab('collaborators')}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeTab === 'collaborators'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users size={16} className="mr-2" />
            Collaborators
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

        {activeTab === 'versions' && (
          <div>
            {versions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No versions yet</p>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div key={version.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        Version {version.versionNumber} - {version.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {version.changeDescription && (
                      <p className="text-sm text-gray-600 mb-2">{version.changeDescription}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      By {version.createdBy?.firstName} {version.createdBy?.lastName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div>
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'collaborators' && (
          <div>
            {collaborators.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No collaborators yet</p>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {collab.user?.firstName} {collab.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{collab.user?.email}</p>
                    </div>
                    <Badge color="blue">{collab.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
