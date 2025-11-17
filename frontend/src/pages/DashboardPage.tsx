import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../services/contract.service';
import { proposalService } from '../services/proposal.service';
import { templateService } from '../services/template.service';
import { messageService } from '../services/message.service';
import { reminderService } from '../services/reminder.service';
import { connectionService } from '../services/connection.service';
import { auditService } from '../services/audit.service';
import { Contract, ContractStatistics } from '../types/contract.types';
import { Reminder } from '../types/reminder.types';
import { AuditLog } from '../types/audit.types';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import {
  FileText,
  File,
  Users,
  Mail,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';

interface DashboardStats {
  contracts: {
    total: number;
    active: number;
    expiring: number;
    totalValue: number;
    statistics?: ContractStatistics;
  };
  proposals: {
    total: number;
    draft: number;
    pending: number;
    approved: number;
  };
  templates: {
    total: number;
  };
  messages: {
    unread: number;
  };
  reminders: {
    upcoming: number;
    overdue: number;
  };
  connections: {
    total: number;
    pending: number;
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    contracts: { total: 0, active: 0, expiring: 0, totalValue: 0 },
    proposals: { total: 0, draft: 0, pending: 0, approved: 0 },
    templates: { total: 0 },
    messages: { unread: 0 },
    reminders: { upcoming: 0, overdue: 0 },
    connections: { total: 0, pending: 0 },
  });
  const [expiringContracts, setExpiringContracts] = useState<Contract[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [
        contractStats,
        expiringContractsData,
        proposalsData,
        templatesData,
        unreadCount,
        upcomingRemindersData,
        overdueRemindersData,
        connectionStats,
        recentActivityData,
      ] = await Promise.all([
        contractService.getStatistics().catch(() => ({ data: { totalContracts: 0, activeContracts: 0, expiringContracts: 0, totalValue: 0, contractsByType: [], contractsByStatus: [], pendingApproval: 0 } })),
        contractService.getExpiring(30).catch(() => ({ data: [] })),
        proposalService.getAll().catch(() => ({ proposals: [], total: 0, page: 1, totalPages: 0 })),
        templateService.getAll().catch(() => ({ templates: [], total: 0, page: 1, totalPages: 0 })),
        messageService.getUnreadCount().catch(() => 0),
        reminderService.getUpcoming().catch(() => []),
        reminderService.getOverdue().catch(() => []),
        connectionService.getStats().catch(() => ({ total: 0, accepted: 0, pending: 0, sentRequests: 0 })),
        auditService.getLogs({}, 1, 10).catch(() => ({ logs: [], total: 0, page: 1, totalPages: 0 })),
      ]);

      // Process proposals data
      const proposalsByStatus = {
        draft: proposalsData.proposals.filter((p: any) => p.status === 'DRAFT').length,
        pending: proposalsData.proposals.filter((p: any) => p.status === 'PENDING_REVIEW' || p.status === 'PENDING_APPROVAL').length,
        approved: proposalsData.proposals.filter((p: any) => p.status === 'APPROVED').length,
      };

      setStats({
        contracts: {
          total: contractStats.data.totalContracts,
          active: contractStats.data.activeContracts,
          expiring: contractStats.data.expiringContracts,
          totalValue: contractStats.data.totalValue,
          statistics: contractStats.data,
        },
        proposals: {
          total: proposalsData.total,
          ...proposalsByStatus,
        },
        templates: {
          total: templatesData.total,
        },
        messages: {
          unread: unreadCount,
        },
        reminders: {
          upcoming: upcomingRemindersData.length,
          overdue: overdueRemindersData.length,
        },
        connections: {
          total: connectionStats.accepted,
          pending: connectionStats.pending,
        },
      });

      setExpiringContracts(expiringContractsData.data);
      setUpcomingReminders(upcomingRemindersData);
      setRecentActivity(recentActivityData.logs);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDaysUntilExpiry = (expirationDate: string) => {
    const expiry = new Date(expirationDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Chart data
  const contractsByTypeChart = stats.contracts.statistics?.contractsByType.map(item => ({
    name: item.contractType.replace(/_/g, ' '),
    value: item._count,
  })) || [];

  const contractsByStatusChart = stats.contracts.statistics?.contractsByStatus.map(item => ({
    name: item.status.replace(/_/g, ' '),
    value: item._count,
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's your complete overview.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/templates')}
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 hover:shadow-md transition-all font-medium"
          >
            <FileText size={16} />
            Browse Templates
          </button>
          <button
            onClick={() => navigate('/contracts/create')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold"
          >
            <FileText size={16} />
            Create Contract
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Contracts"
          value={stats.contracts.total}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          trend={{ value: 12, isPositive: true }}
          onClick={() => navigate('/contracts')}
        />
        <StatCard
          title="Active Contracts"
          value={stats.contracts.active}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          onClick={() => navigate('/contracts?filter=active')}
        />
        <StatCard
          title="Total Proposals"
          value={stats.proposals.total}
          icon={<File className="w-6 h-6" />}
          color="purple"
          onClick={() => navigate('/proposals')}
        />
        <StatCard
          title="Unread Messages"
          value={stats.messages.unread}
          icon={<Mail className="w-6 h-6" />}
          color="yellow"
          onClick={() => navigate('/messages')}
          alert={stats.messages.unread > 0}
        />
        <StatCard
          title="Network"
          value={stats.connections.total}
          icon={<Users className="w-6 h-6" />}
          color="teal"
          onClick={() => navigate('/connections')}
        />
        <StatCard
          title="Contract Value"
          value={formatCurrency(stats.contracts.totalValue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          subtitle="Total"
        />
      </div>

      {/* Alerts Row */}
      {(stats.contracts.expiring > 0 || stats.reminders.overdue > 0 || stats.connections.pending > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.contracts.expiring > 0 && (
            <div
              onClick={() => navigate('/contracts?filter=expiring')}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-900">{stats.contracts.expiring}</div>
                  <div className="text-sm text-yellow-700">Contracts Expiring Soon</div>
                </div>
              </div>
            </div>
          )}
          {stats.reminders.overdue > 0 && (
            <div
              onClick={() => navigate('/reminders')}
              className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-200 rounded-lg">
                  <Bell className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-900">{stats.reminders.overdue}</div>
                  <div className="text-sm text-red-700">Overdue Reminders</div>
                </div>
              </div>
            </div>
          )}
          {stats.connections.pending > 0 && (
            <div
              onClick={() => navigate('/connections')}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Users className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">{stats.connections.pending}</div>
                  <div className="text-sm text-blue-700">Pending Connections</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contracts by Type Chart */}
        {contractsByTypeChart.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Contracts by Type</h2>
                <p className="text-sm text-gray-500 mt-1">Distribution of contract types</p>
              </div>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={contractsByTypeChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contractsByTypeChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Contracts by Status Chart */}
        {contractsByStatusChart.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Contracts by Status</h2>
                <p className="text-sm text-gray-500 mt-1">Current contract statuses</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contractsByStatusChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring Contracts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-900">Expiring Soon</h2>
              </div>
              <Badge variant="warning">{expiringContracts.length}</Badge>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {expiringContracts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No contracts expiring soon</p>
              </div>
            ) : (
              expiringContracts.slice(0, 5).map((contract) => {
                const daysLeft = getDaysUntilExpiry(contract.expirationDate!);
                return (
                  <div
                    key={contract.id}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {contract.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {contract.contractType.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          daysLeft < 7
                            ? 'error'
                            : daysLeft < 14
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {daysLeft}d
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {expiringContracts.length > 5 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/contracts?filter=expiring')}
                fullWidth
              >
                View All ({expiringContracts.length})
              </Button>
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Reminders</h2>
              </div>
              <Badge variant="info">{upcomingReminders.length}</Badge>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {upcomingReminders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No upcoming reminders</p>
              </div>
            ) : (
              upcomingReminders.slice(0, 5).map((reminder) => (
                <div
                  key={reminder.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate('/reminders')}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {reminder.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Due {format(parseISO(reminder.dueDate), 'MMM d')}
                      </p>
                    </div>
                    <Badge variant="info">{reminder.priority}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          {upcomingReminders.length > 5 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/reminders')}
                fullWidth
              >
                View All ({upcomingReminders.length})
              </Button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            ) : (
              recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {log.user?.firstName} {log.user?.lastName}
                        </span>
                        <Badge variant="gray" size="sm">{log.action}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.entityType} • {format(parseISO(log.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentActivity.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/audit-logs')}
                fullWidth
              >
                View All Activity
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={<FileText className="w-6 h-6" />}
            title="Create Contract"
            description="Start from template or scratch"
            onClick={() => navigate('/contracts/create')}
          />
          <QuickActionCard
            icon={<File className="w-6 h-6" />}
            title="New Proposal"
            description="Create a new proposal"
            onClick={() => navigate('/proposals/create')}
          />
          <QuickActionCard
            icon={<Mail className="w-6 h-6" />}
            title="Send Message"
            description="Communicate with team"
            onClick={() => navigate('/messages')}
          />
          <QuickActionCard
            icon={<Users className="w-6 h-6" />}
            title="Find People"
            description="Expand your network"
            onClick={() => navigate('/connections')}
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'teal';
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
  onClick?: () => void;
  alert?: boolean;
}

function StatCard({ title, value, icon, color, trend, subtitle, onClick, alert }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
      } ${alert ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {trend.value}%
              </div>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function QuickActionCard({ icon, title, description, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-xl p-6 text-left transition-all hover:scale-105 border border-white border-opacity-20"
    >
      <div className="mb-4">{icon}</div>
      <div className="font-semibold text-lg mb-1">{title}</div>
      <div className="text-sm text-white text-opacity-90">{description}</div>
    </button>
  );
}
