import request from 'supertest';
import { prisma } from './setup';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '../routes/auth.routes';
import proposalRoutes from '../routes/proposal.routes';
import organizationRoutes from '../routes/organization.routes';

// Create test app
let app: Express;

beforeAll(() => {
  app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register routes
  app.use('/api/auth', authRoutes);
  app.use('/api/proposals', proposalRoutes);
  app.use('/api/organizations', organizationRoutes);
});

describe('API Integration Tests', () => {
  describe('Auth API', () => {
    const testUser = {
      email: 'integration@example.com',
      password: 'SecurePass123!',
      firstName: 'Integration',
      lastName: 'Test'
    };

    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testUser)
          .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body.user.email).toBe(testUser.email);
        expect(response.body.user.passwordHash).toBeUndefined();
      });

      it('should return 400 for duplicate email', async () => {
        await request(app)
          .post('/api/auth/register')
          .send(testUser);

        const response = await request(app)
          .post('/api/auth/register')
          .send(testUser)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for invalid email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            ...testUser,
            email: 'invalid-email'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for missing required fields', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com'
            // Missing password, firstName, lastName
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/auth/register')
          .send(testUser);
      });

      it('should login with correct credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
      });

      it('should return 401 for invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword123!'
          })
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });

      it('should return 401 for non-existent user', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: testUser.password
          })
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('POST /api/auth/refresh', () => {
      let refreshToken: string;

      beforeEach(async () => {
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send(testUser);

        refreshToken = registerResponse.body.refreshToken;
      });

      it('should refresh access token with valid refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
      });

      it('should return 401 for invalid refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken: 'invalid-token' })
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Proposal API', () => {
    let accessToken: string;
    let userId: string;
    let orgId: string;

    beforeEach(async () => {
      // Register and login
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'proposalapi@example.com',
          password: 'SecurePass123!',
          firstName: 'Proposal',
          lastName: 'API'
        });

      accessToken = registerResponse.body.accessToken;
      userId = registerResponse.body.user.id;

      // Create organization
      const org = await prisma.organization.create({
        data: {
          name: 'API Test Org',
          slug: 'api-test-org',
          members: {
            create: {
              userId: userId,
              role: 'ADMIN'
            }
          }
        }
      });
      orgId = org.id;
    });

    describe('POST /api/proposals', () => {
      it('should create a new proposal', async () => {
        const response = await request(app)
          .post('/api/proposals')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'API Test Proposal',
            description: 'Test description',
            content: '<p>Test content</p>',
            organizationId: orgId
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('API Test Proposal');
        expect(response.body.status).toBe('DRAFT');
      });

      it('should return 401 without authentication', async () => {
        const response = await request(app)
          .post('/api/proposals')
          .send({
            title: 'Unauthorized Proposal',
            description: 'Should fail',
            content: '<p>Content</p>',
            organizationId: orgId
          })
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });

      it('should return 400 for missing required fields', async () => {
        const response = await request(app)
          .post('/api/proposals')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Incomplete Proposal'
            // Missing description, content, organizationId
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/proposals', () => {
      beforeEach(async () => {
        // Create test proposals
        await request(app)
          .post('/api/proposals')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'First Proposal',
            description: 'First',
            content: '<p>First</p>',
            organizationId: orgId
          });

        await request(app)
          .post('/api/proposals')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Second Proposal',
            description: 'Second',
            content: '<p>Second</p>',
            organizationId: orgId
          });
      });

      it('should retrieve all user proposals', async () => {
        const response = await request(app)
          .get('/api/proposals')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
      });

      it('should return 401 without authentication', async () => {
        await request(app)
          .get('/api/proposals')
          .expect(401);
      });

      it('should support filtering by status', async () => {
        const response = await request(app)
          .get('/api/proposals')
          .query({ status: 'DRAFT' })
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((proposal: any) => {
          expect(proposal.status).toBe('DRAFT');
        });
      });

      it('should support filtering by organization', async () => {
        const response = await request(app)
          .get('/api/proposals')
          .query({ organizationId: orgId })
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((proposal: any) => {
          expect(proposal.organizationId).toBe(orgId);
        });
      });
    });

    describe('GET /api/proposals/:id', () => {
      let proposalId: string;

      beforeEach(async () => {
        const createResponse = await request(app)
          .post('/api/proposals')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Single Proposal',
            description: 'For retrieval',
            content: '<p>Content</p>',
            organizationId: orgId
          });

        proposalId = createResponse.body.id;
      });

      it('should retrieve a specific proposal', async () => {
        const response = await request(app)
          .get(`/api/proposals/${proposalId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.id).toBe(proposalId);
        expect(response.body.title).toBe('Single Proposal');
      });

      it('should return 404 for non-existent proposal', async () => {
        await request(app)
          .get('/api/proposals/non-existent-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });

      it('should return 401 without authentication', async () => {
        await request(app)
          .get(`/api/proposals/${proposalId}`)
          .expect(401);
      });
    });

    describe('PUT /api/proposals/:id', () => {
      let proposalId: string;

      beforeEach(async () => {
        const createResponse = await request(app)
          .post('/api/proposals')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Original Title',
            description: 'Original Description',
            content: '<p>Original</p>',
            organizationId: orgId
          });

        proposalId = createResponse.body.id;
      });

      it('should update proposal', async () => {
        const response = await request(app)
          .put(`/api/proposals/${proposalId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Updated Title',
            description: 'Updated Description'
          })
          .expect(200);

        expect(response.body.title).toBe('Updated Title');
        expect(response.body.description).toBe('Updated Description');
      });

      it('should return 401 without authentication', async () => {
        await request(app)
          .put(`/api/proposals/${proposalId}`)
          .send({
            title: 'Hacked Title'
          })
          .expect(401);
      });

      it('should return 404 for non-existent proposal', async () => {
        await request(app)
          .put('/api/proposals/non-existent-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Updated'
          })
          .expect(404);
      });
    });

    describe('DELETE /api/proposals/:id', () => {
      let proposalId: string;

      beforeEach(async () => {
        const createResponse = await request(app)
          .post('/api/proposals')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'To Delete',
            description: 'Will be deleted',
            content: '<p>Delete</p>',
            organizationId: orgId
          });

        proposalId = createResponse.body.id;
      });

      it('should delete proposal', async () => {
        await request(app)
          .delete(`/api/proposals/${proposalId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(204);

        // Verify deletion
        await request(app)
          .get(`/api/proposals/${proposalId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });

      it('should return 401 without authentication', async () => {
        await request(app)
          .delete(`/api/proposals/${proposalId}`)
          .expect(401);
      });

      it('should return 404 for non-existent proposal', async () => {
        await request(app)
          .delete('/api/proposals/non-existent-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });
    });
  });

  describe('Organization API', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'orgapi@example.com',
          password: 'SecurePass123!',
          firstName: 'Org',
          lastName: 'API'
        });

      accessToken = registerResponse.body.accessToken;
      userId = registerResponse.body.user.id;
    });

    describe('POST /api/organizations', () => {
      it('should create a new organization', async () => {
        const response = await request(app)
          .post('/api/organizations')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: 'Test Organization',
            slug: 'test-org',
            description: 'Test description'
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Test Organization');
        expect(response.body.slug).toBe('test-org');
      });

      it('should return 401 without authentication', async () => {
        await request(app)
          .post('/api/organizations')
          .send({
            name: 'Unauthorized Org',
            slug: 'unauthorized-org'
          })
          .expect(401);
      });

      it('should return 400 for duplicate slug', async () => {
        await request(app)
          .post('/api/organizations')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: 'First Org',
            slug: 'duplicate-slug'
          });

        const response = await request(app)
          .post('/api/organizations')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: 'Second Org',
            slug: 'duplicate-slug'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/organizations', () => {
      beforeEach(async () => {
        // Create test organizations
        await request(app)
          .post('/api/organizations')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: 'First Org',
            slug: 'first-org'
          });

        await request(app)
          .post('/api/organizations')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: 'Second Org',
            slug: 'second-org'
          });
      });

      it('should retrieve all user organizations', async () => {
        const response = await request(app)
          .get('/api/organizations')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
      });

      it('should return 401 without authentication', async () => {
        await request(app)
          .get('/api/organizations')
          .expect(401);
      });
    });

    describe('GET /api/organizations/:id', () => {
      let orgId: string;

      beforeEach(async () => {
        const createResponse = await request(app)
          .post('/api/organizations')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: 'Single Org',
            slug: 'single-org'
          });

        orgId = createResponse.body.id;
      });

      it('should retrieve a specific organization', async () => {
        const response = await request(app)
          .get(`/api/organizations/${orgId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.id).toBe(orgId);
        expect(response.body.name).toBe('Single Org');
      });

      it('should return 404 for non-existent organization', async () => {
        await request(app)
          .get('/api/organizations/non-existent-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      await request(app)
        .get('/api/unknown-route')
        .expect(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in response', async () => {
      const response = await request(app)
        .get('/api/organizations')
        .expect(401); // Will fail auth but headers should be present

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});
