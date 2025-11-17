import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { proposalService } from '../services/proposal.service';
import { Proposal, ProposalStatus } from '../types/proposal.types';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import { toast } from '../components/common/Toast';
import { FileText, Plus, Search } from 'lucide-react';
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
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track all your proposals
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/proposals/create">
            <Button variant="primary">
              <Plus size={18} className="mr-2" />
              New Proposal
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'ALL')}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(ProposalStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first proposal'}
          </p>
          {!searchTerm && (
            <Link to="/proposals/create">
              <Button variant="primary">
                <Plus size={18} className="mr-2" />
                Create Proposal
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/proposals/${proposal.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {proposal.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={getStatusColor(proposal.status)}>
                      {proposal.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    v{proposal.currentVersion || 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(proposal.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(proposal.updatedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/proposals/${proposal.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(proposal.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
