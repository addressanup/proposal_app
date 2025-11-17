import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Loading from '../common/Loading';
import { toast } from '../common/Toast';
import {
  Share2,
  Link2,
  Copy,
  Trash2,
  Eye,
  Calendar,
  Lock,
  Mail,
  Globe,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

enum ShareLinkType {
  PUBLIC = 'PUBLIC',
  EMAIL_SPECIFIC = 'EMAIL_SPECIFIC',
  ONE_TIME = 'ONE_TIME',
  PASSWORD_PROTECTED = 'PASSWORD_PROTECTED',
}

interface ShareLink {
  id: string;
  proposalId: string;
  linkType: ShareLinkType;
  token: string;
  expiresAt?: string;
  recipientEmail?: string;
  recipientName?: string;
  canComment: boolean;
  canDownload: boolean;
  canSign: boolean;
  viewCount: number;
  createdAt: string;
}

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalTitle: string;
}

export default function ShareLinkModal({
  isOpen,
  onClose,
  proposalId,
  proposalTitle,
}: ShareLinkModalProps) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    linkType: ShareLinkType.PUBLIC,
    recipientEmail: '',
    recipientName: '',
    password: '',
    expiresInDays: 7,
    canComment: true,
    canDownload: true,
    canSign: false,
    message: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadLinks();
    }
  }, [isOpen, proposalId]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      // This would call the actual API endpoint
      // const data = await sharingService.getProposalShareLinks(proposalId);
      // setLinks(data);
      // For now, showing empty state
      setLinks([]);
    } catch (error) {
      toast.error('Failed to load share links');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.linkType === ShareLinkType.EMAIL_SPECIFIC &&
      !formData.recipientEmail.trim()
    ) {
      toast.error('Recipient email is required for email-specific links');
      return;
    }

    if (formData.linkType === ShareLinkType.PASSWORD_PROTECTED && !formData.password.trim()) {
      toast.error('Password is required for password-protected links');
      return;
    }

    try {
      setCreating(true);
      // This would call the actual API endpoint
      // await sharingService.createShareLink(proposalId, {
      //   linkType: formData.linkType,
      //   recipientEmail: formData.recipientEmail,
      //   recipientName: formData.recipientName,
      //   password: formData.password,
      //   expiresAt: new Date(Date.now() + formData.expiresInDays * 24 * 60 * 60 * 1000),
      //   canComment: formData.canComment,
      //   canDownload: formData.canDownload,
      //   canSign: formData.canSign,
      //   message: formData.message,
      // });
      toast.success('Share link created successfully!');
      setShowCreateForm(false);
      setFormData({
        linkType: ShareLinkType.PUBLIC,
        recipientEmail: '',
        recipientName: '',
        password: '',
        expiresInDays: 7,
        canComment: true,
        canDownload: true,
        canSign: false,
        message: '',
      });
      loadLinks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create share link');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleRevokeLink = async (linkId: string) => {
    if (!window.confirm('Revoke this share link? It will no longer be accessible.')) {
      return;
    }

    try {
      // await sharingService.revokeShareLink(linkId);
      toast.success('Share link revoked');
      loadLinks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to revoke link');
    }
  };

  const getLinkTypeIcon = (type: ShareLinkType) => {
    const icons: Record<ShareLinkType, JSX.Element> = {
      [ShareLinkType.PUBLIC]: <Globe size={14} />,
      [ShareLinkType.EMAIL_SPECIFIC]: <Mail size={14} />,
      [ShareLinkType.ONE_TIME]: <Eye size={14} />,
      [ShareLinkType.PASSWORD_PROTECTED]: <Lock size={14} />,
    };
    return icons[type];
  };

  const getLinkTypeBadgeColor = (type: ShareLinkType) => {
    const colors: Record<ShareLinkType, string> = {
      [ShareLinkType.PUBLIC]: 'blue',
      [ShareLinkType.EMAIL_SPECIFIC]: 'green',
      [ShareLinkType.ONE_TIME]: 'yellow',
      [ShareLinkType.PASSWORD_PROTECTED]: 'purple',
    };
    return colors[type];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share - ${proposalTitle}`}
      size="large"
    >
      <div className="space-y-6">
        {!showCreateForm && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="w-full"
          >
            <Share2 size={16} className="mr-2" />
            Create New Share Link
          </Button>
        )}

        {showCreateForm && (
          <form onSubmit={handleCreateLink} className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-4">Create Share Link</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Type
                </label>
                <select
                  value={formData.linkType}
                  onChange={(e) =>
                    setFormData({ ...formData, linkType: e.target.value as ShareLinkType })
                  }
                  className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={ShareLinkType.PUBLIC}>Public - Anyone with the link</option>
                  <option value={ShareLinkType.EMAIL_SPECIFIC}>
                    Email-Specific - Only for specific recipient
                  </option>
                  <option value={ShareLinkType.ONE_TIME}>One-Time - Expires after first view</option>
                  <option value={ShareLinkType.PASSWORD_PROTECTED}>
                    Password-Protected - Requires password
                  </option>
                </select>
              </div>

              {formData.linkType === ShareLinkType.EMAIL_SPECIFIC && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={formData.recipientEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, recipientEmail: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Name (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={formData.recipientName}
                      onChange={(e) =>
                        setFormData({ ...formData, recipientName: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {formData.linkType === ShareLinkType.PASSWORD_PROTECTED && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}

              {formData.linkType !== ShareLinkType.ONE_TIME && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires In (Days)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.expiresInDays}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })
                    }
                  />
                </div>
              )}

              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Permissions:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.canComment}
                      onChange={(e) =>
                        setFormData({ ...formData, canComment: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span>Can comment</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.canDownload}
                      onChange={(e) =>
                        setFormData({ ...formData, canDownload: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span>Can download</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.canSign}
                      onChange={(e) =>
                        setFormData({ ...formData, canSign: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span>Can sign</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Message (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add a message for the recipient..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={creating}
                  disabled={creating}
                  className="flex-1"
                >
                  <Link2 size={16} className="mr-2" />
                  Create Link
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Active Share Links */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Active Share Links ({links.length})</h4>
          {loading ? (
            <div className="py-8 flex justify-center">
              <Loading />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <Link2 size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No share links yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge color={getLinkTypeBadgeColor(link.linkType)}>
                        <span className="flex items-center gap-1">
                          {getLinkTypeIcon(link.linkType)}
                          {link.linkType.replace(/_/g, ' ')}
                        </span>
                      </Badge>
                      {link.recipientEmail && (
                        <span className="text-xs text-gray-600">→ {link.recipientEmail}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {link.viewCount} views
                      </span>
                      {link.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Expires {format(new Date(link.expiresAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyLink(link.token)}
                    >
                      <Copy size={14} className="mr-2" />
                      Copy
                    </Button>
                    <button
                      onClick={() => handleRevokeLink(link.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
