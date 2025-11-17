import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { proposalService } from '../services/proposal.service';
import { Proposal, ProposalStatus } from '../types/proposal.types';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import { toast } from '../components/common/Toast';
import { FileText, Plus, Search, Filter, Calendar, Eye, Edit2, Trash2, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadProposals();
  }, [statusFilter]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter;
      }
      const result = await proposalService.list(filters);
      setProposals(result.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this proposal?')) {
      return;
    }

    try {
      await proposalService.delete(id);
      toast.success('Proposal deleted successfully');
      loadProposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete proposal');
    }
  };

  const getStatusColor = (status: ProposalStatus) => {
    const colors: Record<ProposalStatus, string> = {
      [ProposalStatus.DRAFT]: 'gray',
      [ProposalStatus.PENDING_REVIEW]: 'yellow',
      [ProposalStatus.UNDER_NEGOTIATION]: 'blue',
      [ProposalStatus.FINAL]: 'purple',
      [ProposalStatus.SIGNED]: 'green',
      [ProposalStatus.ARCHIVED]: 'gray',
      [ProposalStatus.REJECTED]: 'red',
    };
    return colors[status] || 'gray';
  };

  const filteredProposals = proposals.filter((proposal) =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Proposals
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and track all your business proposals
            </p>
          </div>
          <Link to="/proposals/create">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold">
              <Plus size={20} />
              New Proposal
            </button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">{proposals.length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Draft</div>
            <div className="text-2xl font-bold text-gray-500">
              {proposals.filter(p => p.status === ProposalStatus.DRAFT).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-2xl font-bold text-blue-600">
              {proposals.filter(p => [ProposalStatus.PENDING_REVIEW, ProposalStatus.UNDER_NEGOTIATION].includes(p.status)).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Signed</div>
            <div className="text-2xl font-bold text-green-600">
              {proposals.filter(p => p.status === ProposalStatus.SIGNED).length}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'ALL')}
              className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(ProposalStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals Grid */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <FileText size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No proposals found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filters to find what you\'re looking for'
              : 'Get started by creating your first proposal to streamline your business process'}
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <Link to="/proposals/create">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold">
                <Plus size={20} />
                Create Your First Proposal
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link
                      to={`/proposals/${proposal.id}`}
                      className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {proposal.title}
                    </Link>
                  </div>
                  <Badge color={getStatusColor(proposal.status)}>
                    {proposal.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* Version Badge */}
                <div className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600">
                  <FileText size={14} />
                  Version {proposal.currentVersion || 1}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Created {format(new Date(proposal.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span>Updated {format(new Date(proposal.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to={`/proposals/${proposal.id}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  <Eye size={16} />
                  View Details
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/proposals/${proposal.id}/edit`}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(proposal.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
