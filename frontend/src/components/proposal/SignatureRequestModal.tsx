import { useState, useEffect } from 'react';
import { signatureService } from '../../services/signature.service';
import {
  SignatureRequest,
  SignatureType,
  SigningOrder,
  SignatureRequestStatus,
  SignerStatus,
  AuthenticationMethod,
} from '../../types/signature.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Loading from '../common/Loading';
import { toast } from '../common/Toast';
import {
  FileSignature,
  Plus,
  Trash2,
  Send,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';

interface SignatureRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalTitle: string;
}

export default function SignatureRequestModal({
  isOpen,
  onClose,
  proposalId,
  proposalTitle,
}: SignatureRequestModalProps) {
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    signatureType: SignatureType.SIMPLE,
    signingOrder: SigningOrder.PARALLEL,
    expiresInDays: 30,
    message: '',
    signers: [
      {
        email: '',
        name: '',
        order: 1,
        authenticationMethod: AuthenticationMethod.EMAIL_VERIFICATION,
      },
    ],
  });

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen, proposalId]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await signatureService.getProposalRequests(proposalId);
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load signature requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSigner = () => {
    setFormData({
      ...formData,
      signers: [
        ...formData.signers,
        {
          email: '',
          name: '',
          order: formData.signers.length + 1,
          authenticationMethod: AuthenticationMethod.EMAIL_VERIFICATION,
        },
      ],
    });
  };

  const handleRemoveSigner = (index: number) => {
    const newSigners = formData.signers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      signers: newSigners.map((signer, i) => ({ ...signer, order: i + 1 })),
    });
  };

  const handleSignerChange = (
    index: number,
    field: string,
    value: string | AuthenticationMethod
  ) => {
    const newSigners = [...formData.signers];
    newSigners[index] = { ...newSigners[index], [field]: value };
    setFormData({ ...formData, signers: newSigners });
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.signers.some((s) => !s.email.trim() || !s.name.trim())) {
      toast.error('All signers must have email and name');
      return;
    }

    try {
      setCreating(true);
      await signatureService.createRequest({
        proposalId,
        signatureType: formData.signatureType,
        signingOrder: formData.signingOrder,
        expiresInDays: formData.expiresInDays,
        message: formData.message,
        signers: formData.signers,
      });
      toast.success('Signature request created and sent!');
      setShowCreateForm(false);
      setFormData({
        signatureType: SignatureType.SIMPLE,
        signingOrder: SigningOrder.PARALLEL,
        expiresInDays: 30,
        message: '',
        signers: [
          {
            email: '',
            name: '',
            order: 1,
            authenticationMethod: AuthenticationMethod.EMAIL_VERIFICATION,
          },
        ],
      });
      loadRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create signature request');
    } finally {
      setCreating(false);
    }
  };

  const handleSendReminder = async (requestId: string, signerEmail: string) => {
    try {
      await signatureService.sendReminder(requestId, signerEmail);
      toast.success('Reminder sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reminder');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Cancel this signature request?')) {
      return;
    }

    try {
      await signatureService.cancelRequest(requestId);
      toast.success('Signature request cancelled');
      loadRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const getStatusBadgeColor = (status: SignatureRequestStatus | SignerStatus) => {
    const colors: Record<string, string> = {
      PENDING: 'gray',
      SENT: 'blue',
      IN_PROGRESS: 'yellow',
      VIEWED: 'purple',
      SIGNED: 'green',
      COMPLETED: 'green',
      DECLINED: 'red',
      EXPIRED: 'gray',
      CANCELLED: 'gray',
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status: SignerStatus) => {
    const icons: Record<SignerStatus, JSX.Element> = {
      [SignerStatus.PENDING]: <Clock size={14} />,
      [SignerStatus.SENT]: <Mail size={14} />,
      [SignerStatus.VIEWED]: <Mail size={14} />,
      [SignerStatus.SIGNED]: <CheckCircle size={14} />,
      [SignerStatus.DECLINED]: <XCircle size={14} />,
    };
    return icons[status] || <Clock size={14} />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Signature Requests - ${proposalTitle}`}
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
            <FileSignature size={16} className="mr-2" />
            Create Signature Request
          </Button>
        )}

        {showCreateForm && (
          <form onSubmit={handleCreateRequest} className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-4">New Signature Request</h4>
            <div className="space-y-4">
              {/* Signature Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature Type
                </label>
                <select
                  value={formData.signatureType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      signatureType: e.target.value as SignatureType,
                    })
                  }
                  className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={SignatureType.SIMPLE}>Simple - Basic electronic signature</option>
                  <option value={SignatureType.ADVANCED}>
                    Advanced - Enhanced verification
                  </option>
                  <option value={SignatureType.QUALIFIED}>
                    Qualified - Highest legal standard
                  </option>
                </select>
              </div>

              {/* Signing Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signing Order
                </label>
                <select
                  value={formData.signingOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      signingOrder: e.target.value as SigningOrder,
                    })
                  }
                  className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={SigningOrder.PARALLEL}>Parallel - All can sign at once</option>
                  <option value={SigningOrder.SEQUENTIAL}>
                    Sequential - Sign in specific order
                  </option>
                </select>
              </div>

              {/* Expires In */}
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

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Add a message for the signers..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Signers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Signers</label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddSigner}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Signer
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.signers.map((signer, index) => (
                    <div key={index} className="bg-white rounded-md p-3 border border-gray-200">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="text"
                              placeholder="Signer Name"
                              value={signer.name}
                              onChange={(e) =>
                                handleSignerChange(index, 'name', e.target.value)
                              }
                              required
                            />
                            <Input
                              type="email"
                              placeholder="Email"
                              value={signer.email}
                              onChange={(e) =>
                                handleSignerChange(index, 'email', e.target.value)
                              }
                              required
                            />
                          </div>
                          {formData.signingOrder === SigningOrder.SEQUENTIAL && (
                            <div className="text-xs text-gray-500">
                              Order: {signer.order}
                            </div>
                          )}
                        </div>
                        {formData.signers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSigner(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                  <Send size={16} className="mr-2" />
                  Send Request
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Active Signature Requests */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Active Requests ({requests.length})</h4>
          {loading ? (
            <div className="py-8 flex justify-center">
              <Loading />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <FileSignature size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No signature requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge color={getStatusBadgeColor(request.status)}>
                          {request.status.replace(/_/g, ' ')}
                        </Badge>
                        <Badge color="blue">{request.signatureType}</Badge>
                        <Badge color="purple">{request.signingOrder}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                      {request.expiresAt && (
                        <p className="text-xs text-gray-500">
                          Expires {format(new Date(request.expiresAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    {request.status === SignatureRequestStatus.IN_PROGRESS && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>

                  {request.message && (
                    <p className="text-sm text-gray-600 mb-3 italic">"{request.message}"</p>
                  )}

                  {/* Signers */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Signers:</p>
                    {request.requirements.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={16} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{req.signerName}</p>
                            <p className="text-xs text-gray-500">{req.signerEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge color={getStatusBadgeColor(req.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(req.status)}
                              {req.status}
                            </span>
                          </Badge>
                          {req.status === SignerStatus.SENT && (
                            <button
                              onClick={() => handleSendReminder(request.id, req.signerEmail)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Remind
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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
