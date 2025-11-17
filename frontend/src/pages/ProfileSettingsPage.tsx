import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { userService } from '../services/user.service';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { toast } from '../components/common/Toast';
import { User, Lock, Shield, Save, QrCode } from 'lucide-react';
import QRCodeLib from 'qrcode';

type TabType = 'profile' | 'password' | 'mfa';

export default function ProfileSettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // MFA state
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaData, setMfaData] = useState<{
    qrCodeUrl: string;
    secret: string;
    backupCodes: string[];
  } | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [mfaToken, setMfaToken] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  useEffect(() => {
    if (mfaData?.qrCodeUrl) {
      generateQRCode(mfaData.qrCodeUrl);
    }
  }, [mfaData]);

  const generateQRCode = async (url: string) => {
    try {
      const qr = await QRCodeLib.toDataURL(url, { width: 256 });
      setQrCodeImage(qr);
    } catch (error) {
      console.error('Failed to generate QR code', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await userService.updateProfile(profileForm);
      setUser(updatedUser, localStorage.getItem('accessToken') || '');
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupMFA = async () => {
    try {
      setLoading(true);
      const data = await userService.setupMFA();
      setMfaData(data);
      setShowMFASetup(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!mfaToken || mfaToken.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      await userService.verifyMFA(mfaToken);
      toast.success('MFA enabled successfully!');
      setShowMFASetup(false);
      setMfaData(null);
      setMfaToken('');
      // Refresh user data
      const updatedUser = await userService.getProfile();
      setUser(updatedUser, localStorage.getItem('accessToken') || '');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    const token = window.prompt('Enter your current MFA code to disable:');
    if (!token) return;

    try {
      setLoading(true);
      await userService.disableMFA(token);
      toast.success('MFA disabled successfully');
      const updatedUser = await userService.getProfile();
      setUser(updatedUser, localStorage.getItem('accessToken') || '');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage your profile, password, and security settings
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User size={16} className="mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Lock size={16} className="mr-2" />
            Password
          </button>
          <button
            onClick={() => setActiveTab('mfa')}
            className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeTab === 'mfa'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield size={16} className="mr-2" />
            Two-Factor Authentication
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={loading} disabled={loading}>
                  <Save size={18} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={loading} disabled={loading}>
                  <Lock size={18} className="mr-2" />
                  Change Password
                </Button>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'mfa' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account by requiring a code from your
                authenticator app in addition to your password.
              </p>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600">
                    {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.mfaEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {user?.mfaEnabled ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            {!user?.mfaEnabled ? (
              <Button
                variant="primary"
                onClick={handleSetupMFA}
                loading={loading}
                disabled={loading}
              >
                <Shield size={18} className="mr-2" />
                Enable Two-Factor Authentication
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleDisableMFA}
                loading={loading}
                disabled={loading}
              >
                <Shield size={18} className="mr-2" />
                Disable Two-Factor Authentication
              </Button>
            )}
          </div>
        )}
      </div>

      {/* MFA Setup Modal */}
      <Modal
        isOpen={showMFASetup}
        onClose={() => {
          setShowMFASetup(false);
          setMfaData(null);
          setMfaToken('');
        }}
        title="Setup Two-Factor Authentication"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Step 1: Scan QR Code</h4>
            <p className="text-sm text-gray-600 mb-4">
              Use an authenticator app (like Google Authenticator or Authy) to scan this QR
              code:
            </p>
            {qrCodeImage && (
              <div className="flex justify-center mb-4">
                <img src={qrCodeImage} alt="MFA QR Code" className="rounded-lg shadow" />
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mb-4">
              Or manually enter: <code className="bg-gray-100 px-2 py-1 rounded">{mfaData?.secret}</code>
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Step 2: Enter Verification Code</h4>
            <Input
              type="text"
              placeholder="000000"
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          {mfaData?.backupCodes && mfaData.backupCodes.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Backup Codes</h4>
              <p className="text-sm text-yellow-800 mb-3">
                Save these backup codes in a safe place. You can use them to access your
                account if you lose access to your authenticator app.
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {mfaData.backupCodes.map((code, idx) => (
                  <div key={idx} className="bg-white px-3 py-2 rounded border border-yellow-300">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowMFASetup(false);
                setMfaData(null);
                setMfaToken('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleVerifyMFA}
              loading={loading}
              disabled={loading || mfaToken.length !== 6}
            >
              Verify and Enable
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
