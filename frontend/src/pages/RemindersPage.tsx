import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reminderService } from '../services/reminder.service';
import {
  Reminder,
  ReminderType,
  ReminderStatus,
  ReminderPriority,
  ReminderFilters,
  CreateReminderData,
} from '../types/reminder.types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { toast } from '../components/common/Toast';
import {
  Bell,
  BellRing,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  FileText,
} from 'lucide-react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

export default function RemindersPage() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<ReminderFilters>({});

  // Summary stats
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    loadReminders();
    loadSummaryStats();
  }, [page]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderService.getAll(filters, page, 20);
      setReminders(data.reminders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const loadSummaryStats = async () => {
    try {
      const [upcoming, overdue] = await Promise.all([
        reminderService.getUpcoming(),
        reminderService.getOverdue(),
      ]);
      setUpcomingCount(upcoming.length);
      setOverdueCount(overdue.length);
    } catch (error) {
      console.error('Failed to load summary stats:', error);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    loadReminders();
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
    setTimeout(loadReminders, 0);
  };

  const handleMarkComplete = async (id: string) => {
    try {
      await reminderService.markComplete(id);
      toast.success('Reminder marked as completed');
      loadReminders();
      loadSummaryStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark reminder as complete');
    }
  };

  const handleSnooze = async (id: string) => {
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + 1);

    try {
      await reminderService.snooze(id, snoozeUntil.toISOString());
      toast.success('Reminder snoozed for 1 hour');
      loadReminders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to snooze reminder');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      await reminderService.delete(id);
      toast.success('Reminder deleted successfully');
      loadReminders();
      loadSummaryStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete reminder');
    }
  };

  const getPriorityColor = (priority: ReminderPriority): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
    const colors: Record<ReminderPriority, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
      [ReminderPriority.LOW]: 'gray',
      [ReminderPriority.MEDIUM]: 'info',
      [ReminderPriority.HIGH]: 'warning',
      [ReminderPriority.URGENT]: 'error',
    };
    return colors[priority];
  };

  const getStatusColor = (status: ReminderStatus): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
    const colors: Record<ReminderStatus, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
      [ReminderStatus.PENDING]: 'info',
      [ReminderStatus.SENT]: 'warning',
      [ReminderStatus.COMPLETED]: 'success',
      [ReminderStatus.CANCELLED]: 'gray',
      [ReminderStatus.OVERDUE]: 'error',
    };
    return colors[status];
  };

  const getTypeIcon = (type: ReminderType) => {
    const icons: Record<ReminderType, JSX.Element> = {
      [ReminderType.OBLIGATION]: <FileText size={16} className="text-blue-500" />,
      [ReminderType.MILESTONE]: <CheckCircle size={16} className="text-green-500" />,
      [ReminderType.CONTRACT_EXPIRATION]: <AlertCircle size={16} className="text-red-500" />,
      [ReminderType.SIGNATURE_REQUEST]: <FileText size={16} className="text-purple-500" />,
      [ReminderType.REVIEW_DUE]: <Clock size={16} className="text-yellow-500" />,
      [ReminderType.PAYMENT_DUE]: <Calendar size={16} className="text-orange-500" />,
      [ReminderType.RENEWAL]: <Bell size={16} className="text-teal-500" />,
      [ReminderType.CUSTOM]: <BellRing size={16} className="text-gray-500" />,
    };
    return icons[type];
  };

  const isOverdue = (reminder: Reminder) => {
    if (reminder.status === ReminderStatus.COMPLETED || reminder.status === ReminderStatus.CANCELLED) {
      return false;
    }
    return isAfter(new Date(), parseISO(reminder.dueDate));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reminders</h1>
            <p className="text-sm text-gray-600">
              Manage your contract obligations and upcoming deadlines
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} className="mr-2" />
              New Reminder
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Reminders</div>
              <div className="text-3xl font-bold text-gray-900">{total}</div>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Upcoming (7 days)</div>
              <div className="text-3xl font-bold text-yellow-600">{upcomingCount}</div>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Overdue</div>
              <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value as ReminderType || undefined })
                }
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {Object.values(ReminderType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as ReminderStatus || undefined })
                }
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.values(ReminderStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priority: e.target.value as ReminderPriority || undefined,
                  })
                }
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                {Object.values(ReminderPriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                type="text"
                placeholder="Search reminders..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="secondary" size="sm" onClick={handleClearFilters}>
              <X size={16} className="mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No reminders found</p>
            {Object.keys(filters).length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearFilters}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    isOverdue(reminder) ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(reminder.type)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reminder.title}
                        </h3>
                        <Badge variant={getPriorityColor(reminder.priority)}>
                          {reminder.priority}
                        </Badge>
                        <Badge variant={getStatusColor(reminder.status)}>
                          {reminder.status}
                        </Badge>
                        {isOverdue(reminder) && (
                          <Badge variant="error">OVERDUE</Badge>
                        )}
                      </div>

                      {reminder.description && (
                        <p className="text-sm text-gray-600 mb-3">{reminder.description}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Due: {format(parseISO(reminder.dueDate), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          Remind: {format(parseISO(reminder.reminderDate), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <FileText size={14} className="mr-1" />
                          {reminder.type.replace(/_/g, ' ')}
                        </div>
                      </div>

                      {(reminder.contract || reminder.proposal) && (
                        <div className="mt-3">
                          {reminder.contract && (
                            <button
                              onClick={() => navigate(`/contracts/${reminder.contract!.id}`)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              → Contract: {reminder.contract.title}
                            </button>
                          )}
                          {reminder.proposal && (
                            <button
                              onClick={() => navigate(`/proposals/${reminder.proposal!.id}`)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              → Proposal: {reminder.proposal.title}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {reminder.status !== ReminderStatus.COMPLETED &&
                        reminder.status !== ReminderStatus.CANCELLED && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleMarkComplete(reminder.id)}
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Complete
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleSnooze(reminder.id)}
                            >
                              <Clock size={16} className="mr-1" />
                              Snooze
                            </Button>
                          </>
                        )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <X size={16} />
                      </Button>
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

      {/* Create Reminder Modal */}
      <CreateReminderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadReminders();
          loadSummaryStats();
        }}
      />
    </div>
  );
}

// Create Reminder Modal Component
interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateReminderModal({ isOpen, onClose, onSuccess }: CreateReminderModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateReminderData>({
    type: ReminderType.CUSTOM,
    priority: ReminderPriority.MEDIUM,
    title: '',
    description: '',
    dueDate: '',
    reminderDate: '',
    isRecurring: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.dueDate) {
      toast.error('Due date is required');
      return;
    }

    if (!formData.reminderDate) {
      toast.error('Reminder date is required');
      return;
    }

    try {
      setLoading(true);
      await reminderService.create(formData);
      toast.success('Reminder created successfully');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        type: ReminderType.CUSTOM,
        priority: ReminderPriority.MEDIUM,
        title: '',
        description: '',
        dueDate: '',
        reminderDate: '',
        isRecurring: false,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Reminder" size="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter reminder title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add additional details..."
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ReminderType })}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {Object.values(ReminderType).map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value as ReminderPriority })
              }
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {Object.values(ReminderPriority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.reminderDate}
              onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRecurring"
            checked={formData.isRecurring}
            onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
            Recurring reminder
          </label>
        </div>

        {formData.isRecurring && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select
              value={formData.recurringFrequency || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recurringFrequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
                })
              }
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select frequency</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>
            Create Reminder
          </Button>
        </div>
      </form>
    </Modal>
  );
}
