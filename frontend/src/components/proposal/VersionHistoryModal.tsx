import { useState, useEffect } from 'react';
import { proposalService } from '../../services/proposal.service';
import { contractService } from '../../services/contract.service';
import { ProposalVersion } from '../../types/proposal.types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import Badge from '../common/Badge';
import { toast } from '../common/Toast';
import { Clock, GitBranch, RotateCcw, User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId?: string;
  contractId?: string;
  currentTitle: string;
  onRevert?: () => void;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  proposalId,
  contractId,
  currentTitle,
  onRevert,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<number | null>(null);
  const [compareVersionNumber, setCompareVersionNumber] = useState<number | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffData, setDiffData] = useState<{ oldValue: string; newValue: string } | null>(null);
  const [reverting, setReverting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, proposalId, contractId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      let data;
      if (proposalId) {
        data = await proposalService.getVersions(proposalId);
      } else if (contractId) {
        // For now, contracts use the same version structure
        // This would need a contract version service in a real implementation
        data = [];
        toast.info('Contract version history coming soon');
      } else {
        data = [];
      }
      setVersions(data);
      if (data.length > 0) {
        setSelectedVersionNumber(data[0].versionNumber);
      }
    } catch (error) {
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedVersionNumber || !compareVersionNumber || !proposalId) {
      toast.error('Please select two versions to compare');
      return;
    }

    try {
      setLoading(true);
      const comparison = await proposalService.compareVersions(
        proposalId,
        selectedVersionNumber,
        compareVersionNumber
      );

      const oldVersion = versions.find((v) => v.versionNumber === compareVersionNumber);
      const newVersion = versions.find((v) => v.versionNumber === selectedVersionNumber);

      setDiffData({
        oldValue: oldVersion?.content || '',
        newValue: newVersion?.content || '',
      });
      setShowDiff(true);
    } catch (error) {
      toast.error('Failed to compare versions');
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (versionNumber: number) => {
    const version = versions.find((v) => v.versionNumber === versionNumber);
    if (
      !window.confirm(
        `Are you sure you want to revert to version ${version?.versionNumber}? This will create a new version with the old content.`
      )
    ) {
      return;
    }

    if (!proposalId) {
      toast.error('Proposal ID is required');
      return;
    }

    try {
      setReverting(true);
      await proposalService.revertToVersion(proposalId, versionNumber);
      toast.success('Successfully reverted to previous version');
      onClose();
      if (onRevert) {
        onRevert();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to revert version');
    } finally {
      setReverting(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Version History - ${currentTitle}`}
      size="large"
    >
      <div className="space-y-6">
        {loading && versions.length === 0 ? (
          <div className="py-8 flex justify-center">
            <Loading />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No version history available</p>
          </div>
        ) : (
          <>
            {!showDiff ? (
              <>
                {/* Version Comparison Controls */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Version A
                      </label>
                      <select
                        value={selectedVersionNumber || ''}
                        onChange={(e) => setSelectedVersionNumber(Number(e.target.value))}
                        className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {versions.map((version) => (
                          <option key={version.id} value={version.versionNumber}>
                            v{version.versionNumber} - {version.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <ChevronRight className="text-gray-400 mt-5" size={20} />
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Version B
                      </label>
                      <select
                        value={compareVersionNumber || ''}
                        onChange={(e) => setCompareVersionNumber(Number(e.target.value))}
                        className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select version...</option>
                        {versions.map((version) => (
                          <option key={version.id} value={version.versionNumber}>
                            v{version.versionNumber} - {version.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCompare}
                      disabled={!selectedVersionNumber || !compareVersionNumber}
                      className="mt-5"
                    >
                      <GitBranch size={16} className="mr-2" />
                      Compare
                    </Button>
                  </div>
                </div>

                {/* Version List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        selectedVersionNumber === version.versionNumber
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge color={index === 0 ? 'green' : 'gray'}>
                              v{version.versionNumber}
                              {index === 0 && ' (Current)'}
                            </Badge>
                            <h4 className="font-medium text-gray-900">{version.title}</h4>
                          </div>
                          {version.changeDescription && (
                            <p className="text-sm text-gray-600 mb-2">
                              {version.changeDescription}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {version.createdBy?.firstName} {version.createdBy?.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                        </div>
                        {index > 0 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRevert(version.versionNumber)}
                            disabled={reverting}
                          >
                            <RotateCcw size={16} className="mr-2" />
                            Revert
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Diff View */}
                <div className="mb-4">
                  <Button variant="secondary" size="sm" onClick={() => setShowDiff(false)}>
                    ← Back to Version List
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  {diffData && (
                    <ReactDiffViewer
                      oldValue={stripHtml(diffData.oldValue)}
                      newValue={stripHtml(diffData.newValue)}
                      splitView={true}
                      showDiffOnly={false}
                      useDarkTheme={false}
                      leftTitle={`Version ${
                        versions.find((v) => v.versionNumber === compareVersionNumber)?.versionNumber
                      }`}
                      rightTitle={`Version ${
                        versions.find((v) => v.versionNumber === selectedVersionNumber)?.versionNumber
                      }`}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
