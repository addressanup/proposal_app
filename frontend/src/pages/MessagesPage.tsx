import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageService } from '../services/message.service';
import { userService } from '../services/user.service';
import {
  Message,
  MessageStatus,
  MessagePriority,
  MessageFilters,
  CreateMessageData,
} from '../types/message.types';
import { User } from '../types/user.types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { toast } from '../components/common/Toast';
import { useAuthStore } from '../stores/auth.store';
import {
  Mail,
  Send,
  Inbox,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Reply,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  User as UserIcon,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

type ViewType = 'inbox' | 'sent' | 'archived';

export default function MessagesPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeView, setActiveView] = useState<ViewType>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showMessageDetail, setShowMessageDetail] = useState(false);
  const [filters, setFilters] = useState<MessageFilters>({});
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
  }, [activeView, page]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      let data;

      if (activeView === 'inbox') {
        data = await messageService.getInbox(filters, page, 20);
      } else if (activeView === 'sent') {
        data = await messageService.getSent(filters, page, 20);
      } else {
        // Archived
        data = await messageService.getInbox(
          { ...filters, status: MessageStatus.ARCHIVED },
          page,
          20
        );
      }

      setMessages(data.messages);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setShowMessageDetail(true);

    // Mark as read if in inbox and unread
    if (
      activeView === 'inbox' &&
      message.status !== MessageStatus.READ &&
      message.recipientId === currentUser?.id
    ) {
      try {
        await messageService.markRead(message.id);
        loadMessages();
        loadUnreadCount();
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const handleArchive = async (messageId: string) => {
    try {
      await messageService.archive(messageId);
      toast.success('Message archived');
      loadMessages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to archive message');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await messageService.delete(messageId);
      toast.success('Message deleted');
      loadMessages();
      setShowMessageDetail(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleMarkUnread = async (messageId: string) => {
    try {
      await messageService.markUnread(messageId);
      toast.success('Message marked as unread');
      loadMessages();
      loadUnreadCount();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark message as unread');
    }
  };

  const getPriorityColor = (
    priority: MessagePriority
  ): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
    const colors: Record<MessagePriority, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
      [MessagePriority.LOW]: 'gray',
      [MessagePriority.NORMAL]: 'info',
      [MessagePriority.HIGH]: 'warning',
      [MessagePriority.URGENT]: 'error',
    };
    return colors[priority];
  };

  const isUnread = (message: Message) => {
    return (
      message.status !== MessageStatus.READ &&
      message.recipientId === currentUser?.id &&
      activeView === 'inbox'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-sm text-gray-600">
              Communicate with team members and collaborators
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowComposeModal(true)}>
            <Plus size={16} className="mr-2" />
            Compose
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveView('inbox');
              setPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeView === 'inbox'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Inbox size={16} className="mr-2" />
            Inbox
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
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
            <Send size={16} className="mr-2" />
            Sent
          </button>
          <button
            onClick={() => {
              setActiveView('archived');
              setPage(1);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeView === 'archived'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Archive size={16} className="mr-2" />
            Archived
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search messages..."
            value={filters.search || ''}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value });
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <Mail size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleViewMessage(message)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isUnread(message) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <UserIcon size={20} className="text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-sm font-medium truncate ${
                                isUnread(message) ? 'font-bold text-gray-900' : 'text-gray-900'
                              }`}
                            >
                              {activeView === 'inbox'
                                ? `${message.sender.firstName} ${message.sender.lastName}`
                                : `${message.recipient.firstName} ${message.recipient.lastName}`}
                            </h3>
                            {message.priority !== MessagePriority.NORMAL && (
                              <Badge variant={getPriorityColor(message.priority)} size="sm">
                                {message.priority}
                              </Badge>
                            )}
                            {isUnread(message) && (
                              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {activeView === 'inbox' ? message.sender.email : message.recipient.email}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 flex-shrink-0">
                          {format(parseISO(message.createdAt), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>

                      <div className="ml-13">
                        <h4
                          className={`text-sm mb-1 truncate ${
                            isUnread(message) ? 'font-semibold text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {message.subject}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">{message.body}</p>

                        {(message.contract || message.proposal) && (
                          <div className="mt-2 flex items-center gap-2">
                            <FileText size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {message.contract && `Contract: ${message.contract.title}`}
                              {message.proposal && `Proposal: ${message.proposal.title}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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

      {/* Compose Modal */}
      <ComposeMessageModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        onSuccess={() => {
          loadMessages();
          toast.success('Message sent successfully');
        }}
      />

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          isOpen={showMessageDetail}
          onClose={() => {
            setShowMessageDetail(false);
            setSelectedMessage(null);
          }}
          message={selectedMessage}
          onArchive={() => {
            handleArchive(selectedMessage.id);
            setShowMessageDetail(false);
          }}
          onDelete={() => handleDelete(selectedMessage.id)}
          onMarkUnread={() => {
            handleMarkUnread(selectedMessage.id);
            setShowMessageDetail(false);
          }}
          onReply={() => {
            setShowMessageDetail(false);
            setShowComposeModal(true);
          }}
        />
      )}
    </div>
  );
}

// Compose Message Modal
interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  replyTo?: Message;
}

function ComposeMessageModal({ isOpen, onClose, onSuccess, replyTo }: ComposeMessageModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState<CreateMessageData>({
    recipientId: replyTo?.senderId || '',
    subject: replyTo ? `Re: ${replyTo.subject}` : '',
    body: '',
    priority: MessagePriority.NORMAL,
  });

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipientId) {
      toast.error('Please select a recipient');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Subject is required');
      return;
    }

    if (!formData.body.trim()) {
      toast.error('Message body is required');
      return;
    }

    try {
      setLoading(true);
      await messageService.send(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        recipientId: '',
        subject: '',
        body: '',
        priority: MessagePriority.NORMAL,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compose Message" size="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient <span className="text-red-500">*</span>
          </label>
          {loadingUsers ? (
            <Loading />
          ) : (
            <select
              value={formData.recipientId}
              onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!!replyTo}
            >
              <option value="">Select recipient...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Enter subject"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as MessagePriority })
            }
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(MessagePriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Type your message..."
            rows={6}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            <Send size={16} className="mr-2" />
            Send Message
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Message Detail Modal
interface MessageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
  onArchive: () => void;
  onDelete: () => void;
  onMarkUnread: () => void;
  onReply: () => void;
}

function MessageDetailModal({
  isOpen,
  onClose,
  message,
  onArchive,
  onDelete,
  onMarkUnread,
  onReply,
}: MessageDetailModalProps) {
  const navigate = useNavigate();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Message Details" size="large">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon size={24} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {message.sender.firstName} {message.sender.lastName}
                </h3>
                <p className="text-sm text-gray-500">{message.sender.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {message.priority !== MessagePriority.NORMAL && (
                <Badge variant={getPriorityColor(message.priority)}>{message.priority}</Badge>
              )}
              <span className="text-sm text-gray-500">
                {format(parseISO(message.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">{message.subject}</h2>

          <div className="text-sm text-gray-500">
            To: {message.recipient.firstName} {message.recipient.lastName} (
            {message.recipient.email})
          </div>
        </div>

        {/* Body */}
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{message.body}</p>
        </div>

        {/* Related Items */}
        {(message.contract || message.proposal) && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Related To:</h4>
            {message.contract && (
              <button
                onClick={() => {
                  navigate(`/contracts/${message.contract!.id}`);
                  onClose();
                }}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <FileText size={16} />
                Contract: {message.contract.title}
              </button>
            )}
            {message.proposal && (
              <button
                onClick={() => {
                  navigate(`/proposals/${message.proposal!.id}`);
                  onClose();
                }}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <FileText size={16} />
                Proposal: {message.proposal.title}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={onReply}>
              <Reply size={16} className="mr-2" />
              Reply
            </Button>
            <Button variant="secondary" size="sm" onClick={onArchive}>
              <Archive size={16} className="mr-2" />
              Archive
            </Button>
            <Button variant="secondary" size="sm" onClick={onMarkUnread}>
              <EyeOff size={16} className="mr-2" />
              Mark Unread
            </Button>
          </div>
          <Button variant="secondary" size="sm" onClick={onDelete}>
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function getPriorityColor(
  priority: MessagePriority
): 'success' | 'warning' | 'error' | 'info' | 'gray' {
  const colors: Record<MessagePriority, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
    [MessagePriority.LOW]: 'gray',
    [MessagePriority.NORMAL]: 'info',
    [MessagePriority.HIGH]: 'warning',
    [MessagePriority.URGENT]: 'error',
  };
  return colors[priority];
}
