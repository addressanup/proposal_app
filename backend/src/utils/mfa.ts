import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const generateMFASecret = (email: string) => {
  const secret = speakeasy.generateSecret({
    name: `Proposal Platform (${email})`,
    length: 32
  });

  return {
    secret: secret.base32!,
    otpauthUrl: secret.otpauth_url!
  };
};

export const generateQRCode = async (otpauthUrl: string): Promise<string> => {
  return await QRCode.toDataURL(otpauthUrl);
};

export const verifyMFAToken = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after
  });
};
