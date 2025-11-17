import { useState, useEffect } from 'react';
import { connectionService } from '../services/connection.service';
import {
  Connection,
  ConnectionStatus,
  ConnectionStats,
  CreateConnectionData,
} from '../types/connection.types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { toast } from '../components/common/Toast';
import { useAuthStore } from '../stores/auth.store';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Mail,
  Briefcase,
  Building,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

type ViewType = 'connections' | 'received' | 'sent' | 'search';

export default function ConnectionsPage() {
  const { user: currentUser } = useAuthStore();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Connection[]>([]);
  const [sentRequests, setSentRequests] = useState<Connection[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [stats, setStats] = useState<ConnectionStats>({
    total: 0,
    accepted: 0,
    pending: 0,
    sentRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('connections');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    loadData();
    loadStats();
  }, [activeView, page]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeView === 'connections') {
        const data = await connectionService.getMyConnections(page, 20);
        setConnections(data.connections);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else if (activeView === 'received') {
        const data = await connectionService.getPendingRequests();
        setReceivedRequests(data);
      } else if (activeView === 'sent') {
        const data = await connectionService.getSentRequests();
        setSentRequests(data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await connectionService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load connection stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setSearching(true);
      const results = await connectionService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = (user: any) => {
    setSelectedUser(user);
    setShowConnectModal(true);
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      await connectionService.acceptRequest(connectionId);
      toast.success('Connection request accepted');
      loadData();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      await connectionService.rejectRequest(connectionId);
      toast.success('Connection request rejected');
      loadData();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleCancelRequest = async (connectionId: string) => {
    try {
      await connectionService.cancelRequest(connectionId);
      toast.success('Connection request cancelled');
      loadData();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) {
      return;
    }

    try {
      await connectionService.removeConnection(connectionId);
      toast.success('Connection removed');
      loadData();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove connection');
    }
  };

  const getConnectionUser = (connection: Connection) => {
    if (connection.requesterId === currentUser?.id) {
      return connection.addressee;
    }
    return connection.requester;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Network</h1>
            <p className="text-sm text-gray-600">Connect and collaborate with colleagues</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Connections</div>
              <div className="text-3xl font-bold text-gray-900">{stats.accepted}</div>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Pending Requests</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Sent Requests</div>
              <div className="text-3xl font-bold text-purple-600">{stats.sentRequests}</div>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <UserPlus size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Network</div>
              <div className="text-3xl font-bold text-green-600">{stats.total}</div>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveView('connections');
              setPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeView === 'connections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users size={16} className="mr-2" />
            My Connections
            {stats.accepted > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.accepted}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveView('received');
              setPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeView === 'received'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserCheck size={16} className="mr-2" />
            Received
            {stats.pending > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveView('sent');
              setPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeView === 'sent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserPlus size={16} className="mr-2" />
            Sent Requests
            {stats.sentRequests > 0 && (
              <span className="ml-2 bg-purple-100 text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.sentRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveView('search');
              setPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeView === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Search size={16} className="mr-2" />
            Find People
          </button>
        </nav>
      </div>

      {/* Search View */}
      {activeView === 'search' && (
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleSearch}
                loading={searching}
                disabled={searching}
              >
                <Search size={16} className="mr-2" />
                Search
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {searchResults.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onConnect={() => handleSendRequest(user)}
                    showConnectButton={!user.isConnected && !user.hasPendingRequest}
                    isCurrentUser={user.id === currentUser?.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connections List */}
      {activeView !== 'search' && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : (
            <>
              {activeView === 'connections' &&
                (connections.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No connections yet</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveView('search')}
                      className="mt-4"
                    >
                      Find People to Connect
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {connections.map((connection) => {
                      const user = getConnectionUser(connection);
                      return (
                        <div key={connection.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <Users size={24} className="text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {user.firstName} {user.lastName}
                                </h3>
                                <div className="space-y-1 mt-1">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail size={14} className="mr-2" />
                                    {user.email}
                                  </div>
                                  {user.jobTitle && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Briefcase size={14} className="mr-2" />
                                      {user.jobTitle}
                                      {user.department && ` • ${user.department}`}
                                    </div>
                                  )}
                                  {user.organization && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Building size={14} className="mr-2" />
                                      {user.organization.name}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Connected {format(parseISO(connection.acceptedAt!), 'MMM d, yyyy')}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRemoveConnection(connection.id)}
                              >
                                <UserX size={16} className="mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

              {activeView === 'received' &&
                (receivedRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No pending requests</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {receivedRequests.map((connection) => {
                      const user = connection.requester;
                      return (
                        <div key={connection.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <Users size={24} className="text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {user.firstName} {user.lastName}
                                </h3>
                                <div className="space-y-1 mt-1">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail size={14} className="mr-2" />
                                    {user.email}
                                  </div>
                                  {user.jobTitle && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Briefcase size={14} className="mr-2" />
                                      {user.jobTitle}
                                      {user.department && ` • ${user.department}`}
                                    </div>
                                  )}
                                  {user.organization && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Building size={14} className="mr-2" />
                                      {user.organization.name}
                                    </div>
                                  )}
                                </div>
                                {connection.message && (
                                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                    "{connection.message}"
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 mt-2">
                                  Sent {format(parseISO(connection.createdAt), 'MMM d, yyyy')}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleAcceptRequest(connection.id)}
                              >
                                <Check size={16} className="mr-1" />
                                Accept
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRejectRequest(connection.id)}
                              >
                                <X size={16} className="mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

              {activeView === 'sent' &&
                (sentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No sent requests</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {sentRequests.map((connection) => {
                      const user = connection.addressee;
                      return (
                        <div key={connection.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <Users size={24} className="text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {user.firstName} {user.lastName}
                                </h3>
                                <div className="space-y-1 mt-1">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail size={14} className="mr-2" />
                                    {user.email}
                                  </div>
                                  {user.jobTitle && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Briefcase size={14} className="mr-2" />
                                      {user.jobTitle}
                                      {user.department && ` • ${user.department}`}
                                    </div>
                                  )}
                                  {user.organization && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Building size={14} className="mr-2" />
                                      {user.organization.name}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="warning">Pending</Badge>
                                  <span className="text-xs text-gray-500">
                                    Sent {format(parseISO(connection.createdAt), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCancelRequest(connection.id)}
                              >
                                <X size={16} className="mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

              {/* Pagination */}
              {activeView === 'connections' && totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {page} of {totalPages} ({total.toLocaleString()} total)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft size={16} className="mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Connect Modal */}
      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => {
          setShowConnectModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => {
          loadStats();
          handleSearch(); // Refresh search results
        }}
      />
    </div>
  );
}

// User Card Component
interface UserCardProps {
  user: any;
  onConnect: () => void;
  showConnectButton: boolean;
  isCurrentUser: boolean;
}

function UserCard({ user, onConnect, showConnectButton, isCurrentUser }: UserCardProps) {
  return (
    <div className="p-6 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <Users size={24} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {user.firstName} {user.lastName}
              {isCurrentUser && <span className="text-sm text-gray-500 ml-2">(You)</span>}
            </h3>
            <div className="space-y-1 mt-1">
              <div className="flex items-center text-sm text-gray-600">
                <Mail size={14} className="mr-2" />
                {user.email}
              </div>
              {user.jobTitle && (
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase size={14} className="mr-2" />
                  {user.jobTitle}
                  {user.department && ` • ${user.department}`}
                </div>
              )}
              {user.organization && (
                <div className="flex items-center text-sm text-gray-600">
                  <Building size={14} className="mr-2" />
                  {user.organization.name}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {showConnectButton && !isCurrentUser && (
            <Button variant="primary" size="sm" onClick={onConnect}>
              <UserPlus size={16} className="mr-2" />
              Connect
            </Button>
          )}
          {user.isConnected && <Badge variant="success">Connected</Badge>}
          {user.hasPendingRequest && <Badge variant="warning">Request Sent</Badge>}
        </div>
      </div>
    </div>
  );
}

// Connect Modal
interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

function ConnectModal({ isOpen, onClose, user, onSuccess }: ConnectModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setLoading(true);
      const data: CreateConnectionData = {
        addresseeId: user.id,
        message: message.trim() || undefined,
      };
      await connectionService.sendRequest(data);
      toast.success('Connection request sent');
      onSuccess();
      onClose();
      setMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send connection request');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Connection Request" size="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <Users size={24} className="text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a personal message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself or explain why you'd like to connect..."
            rows={4}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            <UserPlus size={16} className="mr-2" />
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
