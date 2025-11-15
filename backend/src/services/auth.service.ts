import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import { generateMFASecret, generateQRCode, verifyMFAToken } from '../utils/mfa';
import { AppError } from '../middleware/errorHandler';
import { auditLog } from '../services/audit.service';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  shareToken?: string;
}

interface LoginData {
  email: string;
  password: string;
  mfaToken?: string;
}

export const register = async (data: RegisterData, ipAddress: string, userAgent: string) => {
  const { email, password, firstName, lastName } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true
    }
  });

  // Log registration
  await auditLog({
    userId: user.id,
    action: 'USER_REGISTERED',
    resourceType: 'user',
    resourceId: user.id,
    ipAddress,
    userAgent
  });

  return user;
};

export const login = async (data: LoginData, ipAddress: string, userAgent: string) => {
  const { email, password, mfaToken } = data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      mfaEnabled: true,
      mfaSecret: true
    }
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check MFA if enabled
  if (user.mfaEnabled) {
    if (!mfaToken) {
      throw new AppError('MFA token required', 403);
    }

    if (!user.mfaSecret) {
      throw new AppError('MFA not properly configured', 500);
    }

    const isMfaValid = verifyMFAToken(mfaToken, user.mfaSecret);
    if (!isMfaValid) {
      throw new AppError('Invalid MFA token', 401);
    }
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken();

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry()
    }
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Log login
  await auditLog({
    userId: user.id,
    action: 'USER_LOGIN',
    resourceType: 'user',
    resourceId: user.id,
    ipAddress,
    userAgent
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    accessToken,
    refreshToken
  };
};

export const setupMFA = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.mfaEnabled) {
    throw new AppError('MFA already enabled', 400);
  }

  const { secret, otpauthUrl } = generateMFASecret(user.email);
  const qrCode = await generateQRCode(otpauthUrl);

  // Store secret temporarily (will be confirmed when user verifies)
  await prisma.user.update({
    where: { id: userId },
    data: { mfaSecret: secret }
  });

  return {
    secret,
    qrCode
  };
};

export const verifyAndEnableMFA = async (userId: string, token: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.mfaSecret) {
    throw new AppError('MFA not set up', 400);
  }

  const isValid = verifyMFAToken(token, user.mfaSecret);
  if (!isValid) {
    throw new AppError('Invalid MFA token', 401);
  }

  // Enable MFA
  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: true }
  });

  return { message: 'MFA enabled successfully' };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  });

  if (!tokenRecord) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (tokenRecord.expiresAt < new Date()) {
    // Delete expired token
    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    throw new AppError('Refresh token expired', 401);
  }

  // Generate new access token
  const accessToken = generateAccessToken(tokenRecord.user.id, tokenRecord.user.email);

  return { accessToken };
};
