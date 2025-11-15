import { prisma } from './setup';
import * as authService from '../services/auth.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Auth Service', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    firstName: 'Test',
    lastName: 'User'
  };

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const result = await authService.register(
        testUser,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(testUser.email);
      expect(result.user.firstName).toBe(testUser.firstName);
      expect(result.user.lastName).toBe(testUser.lastName);
      expect(result.user.passwordHash).toBeUndefined();
    });

    it('should hash the password correctly', async () => {
      await authService.register(testUser, '127.0.0.1', 'test-user-agent');

      const user = await prisma.user.findUnique({
        where: { email: testUser.email }
      });

      expect(user).toBeTruthy();
      expect(user!.passwordHash).not.toBe(testUser.password);

      const isPasswordValid = await bcrypt.compare(
        testUser.password,
        user!.passwordHash
      );
      expect(isPasswordValid).toBe(true);
    });

    it('should throw error if email already exists', async () => {
      await authService.register(testUser, '127.0.0.1', 'test-user-agent');

      await expect(
        authService.register(testUser, '127.0.0.1', 'test-user-agent')
      ).rejects.toThrow('Email already registered');
    });

    it('should create an audit log entry', async () => {
      const result = await authService.register(
        testUser,
        '127.0.0.1',
        'test-user-agent'
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: result.user.id,
          action: 'USER_REGISTERED'
        }
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog!.ipAddress).toBe('127.0.0.1');
    });

    it('should generate valid JWT tokens', async () => {
      const result = await authService.register(
        testUser,
        '127.0.0.1',
        'test-user-agent'
      );

      const accessTokenPayload = jwt.verify(
        result.accessToken,
        process.env.JWT_SECRET!
      ) as any;

      expect(accessTokenPayload.userId).toBe(result.user.id);
      expect(accessTokenPayload.email).toBe(result.user.email);

      const refreshTokenPayload = jwt.verify(
        result.refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as any;

      expect(refreshTokenPayload.userId).toBe(result.user.id);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register(testUser, '127.0.0.1', 'test-user-agent');
    });

    it('should successfully login with correct credentials', async () => {
      const result = await authService.login(
        {
          email: testUser.email,
          password: testUser.password
        },
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(testUser.email);
    });

    it('should throw error with invalid email', async () => {
      await expect(
        authService.login(
          {
            email: 'nonexistent@example.com',
            password: testUser.password
          },
          '127.0.0.1',
          'test-user-agent'
        )
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with invalid password', async () => {
      await expect(
        authService.login(
          {
            email: testUser.email,
            password: 'WrongPassword123!'
          },
          '127.0.0.1',
          'test-user-agent'
        )
      ).rejects.toThrow('Invalid credentials');
    });

    it('should create login audit log entry', async () => {
      const result = await authService.login(
        {
          email: testUser.email,
          password: testUser.password
        },
        '127.0.0.1',
        'test-user-agent'
      );

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: result.user.id,
          action: 'USER_LOGIN'
        }
      });

      expect(auditLog).toBeTruthy();
    });

    it('should require MFA token when MFA is enabled', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email }
      });

      await prisma.user.update({
        where: { id: user!.id },
        data: {
          mfaEnabled: true,
          mfaSecret: 'test-secret'
        }
      });

      await expect(
        authService.login(
          {
            email: testUser.email,
            password: testUser.password
          },
          '127.0.0.1',
          'test-user-agent'
        )
      ).rejects.toThrow('MFA token required');
    });
  });

  describe('setupMFA', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await authService.register(
        testUser,
        '127.0.0.1',
        'test-user-agent'
      );
      userId = result.user.id;
    });

    it('should generate MFA secret and QR code', async () => {
      const result = await authService.setupMFA(userId);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(result.secret).toBeTruthy();
      expect(result.qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('should update user with MFA secret', async () => {
      const result = await authService.setupMFA(userId);

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      expect(user!.mfaSecret).toBe(result.secret);
      expect(user!.mfaEnabled).toBe(false); // Not enabled until verified
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        authService.setupMFA('non-existent-id')
      ).rejects.toThrow('User not found');
    });
  });

  describe('refreshAccessToken', () => {
    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      const result = await authService.register(
        testUser,
        '127.0.0.1',
        'test-user-agent'
      );
      refreshToken = result.refreshToken;
      userId = result.user.id;
    });

    it('should generate new access token with valid refresh token', async () => {
      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('accessToken');

      const payload = jwt.verify(
        result.accessToken,
        process.env.JWT_SECRET!
      ) as any;

      expect(payload.userId).toBe(userId);
    });

    it('should throw error with invalid refresh token', async () => {
      await expect(
        authService.refreshAccessToken('invalid-token')
      ).rejects.toThrow();
    });

    it('should throw error with expired refresh token', async () => {
      const expiredToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '-1h' }
      );

      await expect(
        authService.refreshAccessToken(expiredToken)
      ).rejects.toThrow();
    });
  });

  describe('Password Security', () => {
    it('should use bcrypt with sufficient salt rounds', async () => {
      const result = await authService.register(
        testUser,
        '127.0.0.1',
        'test-user-agent'
      );

      const user = await prisma.user.findUnique({
        where: { id: result.user.id }
      });

      // Bcrypt hashes start with $2b$ followed by cost factor
      expect(user!.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should not return password hash in user object', async () => {
      const result = await authService.register(
        testUser,
        '127.0.0.1',
        'test-user-agent'
      );

      expect(result.user.passwordHash).toBeUndefined();
    });
  });

  describe('Token Expiration', () => {
    it('should set appropriate expiration for access token', async () => {
      const result = await authService.register(
        testUser,
        '127.0.0.1',
        'test-user-agent'
      );

      const payload = jwt.decode(result.accessToken) as any;
      const expirationTime = payload.exp - payload.iat;

      // Access token should expire in 15 minutes (900 seconds)
      expect(expirationTime).toBe(900);
    });

    it('should set appropriate expiration for refresh token', async () => {
      const result = await authService.register(
        testUser,
        '127.0.0.1',
        'test-user-agent'
      );

      const payload = jwt.decode(result.refreshToken) as any;
      const expirationTime = payload.exp - payload.iat;

      // Refresh token should expire in 7 days (604800 seconds)
      expect(expirationTime).toBe(604800);
    });
  });
});
