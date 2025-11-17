import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../services/contract.service';
import { Contract, ContractStatistics } from '../types/contract.types';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<ContractStatistics | null>(null);
  const [expiringContracts, setExpiringContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, expiringResponse] = await Promise.all([
        contractService.getStatistics(),
        contractService.getExpiring(30),
      ]);

      setStatistics(statsResponse.data);
      setExpiringContracts(expiringResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiry = (expirationDate: string) => {
    const expiry = new Date(expirationDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's an overview of your contracts.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => navigate('/templates')}>
            Browse Templates
          </Button>
          <Button onClick={() => navigate('/contracts/create')}>
            Create Contract
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Contracts"
            value={statistics.totalContracts}
            icon="📄"
            color="blue"
          />
          <StatCard
            title="Active Contracts"
            value={statistics.activeContracts}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Expiring Soon"
            value={statistics.expiringContracts}
            icon="⚠️"
            color="yellow"
          />
          <StatCard
            title="Pending Approval"
            value={statistics.pendingApproval}
            icon="⏳"
            color="orange"
          />
          <StatCard
            title="Total Value"
            value={formatCurrency(statistics.totalValue)}
            icon="💰"
            color="purple"
            subtitle="Contract Value"
          />
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Contracts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Expiring Soon (Next 30 Days)
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {expiringContracts.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No contracts expiring in the next 30 days
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
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {contract.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {contract.contractType.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            daysLeft < 7
                              ? 'error'
                              : daysLeft < 14
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {daysLeft} days left
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          Expires {formatDate(contract.expirationDate!)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {expiringContracts.length > 5 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate('/contracts?filter=expiring')
                }
                fullWidth
              >
                View All Expiring Contracts
              </Button>
            </div>
          )}
        </div>

        {/* Contracts by Type */}
        {statistics && statistics.contractsByType.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Contracts by Type
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {statistics.contractsByType.slice(0, 6).map((item) => {
                  const percentage =
                    (item._count / statistics.totalContracts) * 100;
                  return (
                    <div key={item.contractType}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {item.contractType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item._count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contracts by Status */}
      {statistics && statistics.contractsByStatus.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Contracts by Status
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {statistics.contractsByStatus.map((item) => (
                <div
                  key={item.status}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="text-2xl font-bold text-gray-900">
                    {item._count}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.status.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-sm p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/contracts/create')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-colors"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium">Create New Contract</div>
            <div className="text-sm text-white text-opacity-90 mt-1">
              Start from a template or scratch
            </div>
          </button>
          <button
            onClick={() => navigate('/templates')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-colors"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium">Browse Templates</div>
            <div className="text-sm text-white text-opacity-90 mt-1">
              8 professional templates ready
            </div>
          </button>
          <button
            onClick={() => navigate('/contracts')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-colors"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium">View All Contracts</div>
            <div className="text-sm text-white text-opacity-90 mt-1">
              Search and filter contracts
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'orange' | 'purple';
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-full text-2xl ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
