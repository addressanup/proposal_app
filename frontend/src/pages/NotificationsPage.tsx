import { useState, useEffect } from 'react';
import { notificationService } from '../services/notification.service';
import { Notification, NotificationType } from '../types/notification.types';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { toast } from '../components/common/Toast';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [page, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.list(page, 20);
      setNotifications(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error: any) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationTypeLabel = (type: NotificationType) => {
    return type.replace(/_/g, ' ').toLowerCase();
  };

  const getNotificationColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      [NotificationType.PROPOSAL_SHARED]: 'blue',
      [NotificationType.COMMENT_ADDED]: 'green',
      [NotificationType.COMMENT_REPLY]: 'green',
      [NotificationType.PROPOSAL_STATUS_CHANGED]: 'purple',
      [NotificationType.COLLABORATOR_ADDED]: 'yellow',
      [NotificationType.SIGNATURE_REQUESTED]: 'orange',
      [NotificationType.SIGNATURE_COMPLETED]: 'green',
      [NotificationType.DOCUMENT_UPLOADED]: 'blue',
      [NotificationType.CONNECTION_REQUEST]: 'indigo',
      [NotificationType.CONNECTION_ACCEPTED]: 'green',
      [NotificationType.MENTION]: 'pink',
    };
    return colors[type] || 'gray';
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-sm text-gray-700">Stay updated with your activity</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Unread
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead}>
            <Check size={16} className="mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Bell size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {filter === 'unread'
              ? "You're all caught up!"
              : 'Notifications will appear here when you have activity'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                !notif.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`p-3 rounded-full ${
                      !notif.read
                        ? `bg-${getNotificationColor(notif.type)}-100 text-${getNotificationColor(
                            notif.type
                          )}-600`
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Bell size={20} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {notif.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {getNotificationTypeLabel(notif.type)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{notif.message}</p>
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
