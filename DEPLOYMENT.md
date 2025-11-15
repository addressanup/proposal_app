# Production Deployment Guide

Complete guide for deploying the Proposal Platform to production.

## Deployment Options

### Option 1: Docker + Cloud Platform (Recommended)
### Option 2: Traditional VPS (AWS EC2, DigitalOcean, etc.)
### Option 3: Platform as a Service (Railway, Render, Heroku)

---

## Option 1: Docker Deployment

### Prerequisites

- Docker installed
- Docker Compose installed
- Domain name configured
- SSL certificate (Let's Encrypt recommended)

### Quick Deploy with Docker Compose

```bash
# Clone repository
git clone <repository-url>
cd proposa_app

# Create production environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment files with production values
nano backend/.env
nano frontend/.env

# Build and start containers
docker-compose up -d

# Run database migrations
docker-compose exec backend npm run migrate

# View logs
docker-compose logs -f
```

### Production Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://user:password@postgres:5432/proposal_platform"
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
FRONTEND_URL=https://yourdomain.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET_NAME=proposal-documents-prod
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASSWORD=<app-password>
```

**Frontend (.env):**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

## Option 2: AWS Deployment

### Architecture Overview

```
Internet
    ↓
CloudFront (CDN)
    ↓
Application Load Balancer
    ↓
┌─────────────────┬──────────────────┐
│   ECS/Fargate   │   ECS/Fargate    │
│   (Backend)     │   (Frontend)     │
└────────┬────────┴────────┬─────────┘
         ↓                 ↓
    RDS PostgreSQL    S3 Bucket
```

### Step-by-Step AWS Deployment

#### 1. Set Up RDS PostgreSQL

```bash
# Create RDS instance via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier proposal-platform-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <strong-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids <security-group-id>
```

#### 2. Create S3 Bucket

```bash
aws s3 mb s3://proposal-documents-prod
aws s3api put-bucket-encryption \
  --bucket proposal-documents-prod \
  --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
  }'
```

#### 3. Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name proposal-backend
aws ecr create-repository --repository-name proposal-frontend

# Build and push backend
cd backend
docker build -t proposal-backend .
docker tag proposal-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/proposal-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/proposal-backend:latest

# Build and push frontend
cd ../frontend
docker build -t proposal-frontend .
docker tag proposal-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/proposal-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/proposal-frontend:latest
```

#### 4. Create ECS Cluster and Services

```bash
# Create cluster
aws ecs create-cluster --cluster-name proposal-platform

# Create task definitions and services via AWS Console or CloudFormation
```

#### 5. Configure Application Load Balancer

- Create ALB with HTTPS listener
- Configure SSL certificate from ACM
- Add target groups for backend and frontend
- Set up health checks

#### 6. Set Up CloudFront (Optional)

- Create CloudFront distribution
- Point to ALB
- Configure caching rules
- Add custom domain

---

## Option 3: Platform as a Service

### Railway Deployment

#### Backend

1. **Create New Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Add PostgreSQL**
   - Click "New"
   - Select "Database" → "PostgreSQL"
   - Copy DATABASE_URL from variables

3. **Configure Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=<from-railway>
   JWT_SECRET=<generate-secret>
   JWT_REFRESH_SECRET=<generate-secret>
   FRONTEND_URL=<your-frontend-url>
   ```

4. **Deploy**
   - Railway auto-deploys on git push
   - Run migrations: `railway run npm run migrate`

#### Frontend

1. **Create New Service**
   - Add another service for frontend
   - Select frontend directory

2. **Configure Build**
   ```
   Build Command: npm run build
   Start Command: npx serve -s build
   ```

3. **Environment Variables**
   ```
   REACT_APP_API_URL=<backend-url>/api
   ```

### Render Deployment

#### Backend (Web Service)

```yaml
# render.yaml
services:
  - type: web
    name: proposal-backend
    env: node
    buildCommand: npm install && npx prisma generate
    startCommand: npm run migrate && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: proposal-db
          property: connectionString
```

#### Frontend (Static Site)

```yaml
  - type: web
    name: proposal-frontend
    env: static
    buildCommand: npm run build
    staticPublishPath: build
```

---

## Database Migration in Production

### Safe Migration Process

```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup.sql

# 2. Test migration locally
npx prisma migrate dev

# 3. Deploy migration to production
npx prisma migrate deploy

# 4. Verify migration
npx prisma studio
```

### Rollback Procedure

```bash
# Restore from backup
psql $DATABASE_URL < backup.sql

# Or use Prisma
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## SSL/TLS Configuration

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
sudo certbot renew --dry-run
```

### Using AWS Certificate Manager

1. Request certificate in ACM
2. Verify domain ownership
3. Attach to Load Balancer
4. Configure ALB listener for HTTPS

---

## Environment Variables Management

### Using AWS Secrets Manager

```javascript
// backend/src/config/secrets.js
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return JSON.parse(data.SecretString);
}
```

### Using HashiCorp Vault

```bash
# Store secrets
vault kv put secret/proposal-platform \
  jwt_secret=<secret> \
  database_url=<url>

# Retrieve in app
vault kv get -field=jwt_secret secret/proposal-platform
```

---

## Monitoring and Logging

### Application Monitoring

**Sentry Setup:**

```bash
npm install @sentry/node @sentry/tracing
```

```javascript
// backend/src/server.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**DataDog Setup:**

```bash
npm install dd-trace
```

```javascript
// backend/src/server.ts
const tracer = require('dd-trace').init({
  logInjection: true,
  runtimeMetrics: true,
});
```

### Log Aggregation

**CloudWatch Logs (AWS):**
- Auto-configured with ECS
- View logs in CloudWatch console

**Papertrail:**
```bash
# Add to docker-compose.yml
logging:
  driver: syslog
  options:
    syslog-address: "udp://logs.papertrailapp.com:12345"
```

---

## Backup Strategy

### Database Backups

**Automated PostgreSQL Backups:**

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

**AWS RDS Automated Backups:**
- Enable in RDS console
- Set retention period (7-35 days)
- Configure backup window

### File Storage Backups

**S3 Versioning:**
```bash
aws s3api put-bucket-versioning \
  --bucket proposal-documents-prod \
  --versioning-configuration Status=Enabled
```

**S3 Cross-Region Replication:**
```bash
aws s3api put-bucket-replication \
  --bucket proposal-documents-prod \
  --replication-configuration file://replication.json
```

---

## Performance Optimization

### Backend Optimization

**Enable Compression:**
```javascript
import compression from 'compression';
app.use(compression());
```

**Database Connection Pooling:**
```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_timeout = 20
  connection_limit = 20
}
```

**Redis Caching:**
```bash
npm install redis
```

```javascript
import Redis from 'redis';
const redis = Redis.createClient();

// Cache frequently accessed data
app.get('/api/proposals', async (req, res) => {
  const cached = await redis.get('proposals');
  if (cached) return res.json(JSON.parse(cached));

  const proposals = await getProposals();
  await redis.setex('proposals', 300, JSON.stringify(proposals));
  res.json(proposals);
});
```

### Frontend Optimization

**Code Splitting:**
```javascript
// Use React.lazy for route-based splitting
const Proposals = React.lazy(() => import('./pages/Proposals'));
```

**Build Optimization:**
```bash
# Production build with optimizations
npm run build

# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
```

**CDN for Static Assets:**
- Host build folder on S3
- Serve via CloudFront
- Enable gzip/brotli compression

---

## Security Hardening

### Security Headers

```javascript
// backend/src/server.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### Rate Limiting (Production)

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ client: redis }),
});

app.use('/api/', limiter);
```

### Database Security

- Enable SSL for database connections
- Use least-privilege database user
- Enable connection encryption
- Regular security updates

---

## Health Checks and Monitoring

### Health Check Endpoint

```javascript
// Already implemented at /health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected', // Check DB connection
  });
});
```

### Uptime Monitoring

**UptimeRobot:**
- Free tier: 50 monitors
- Check every 5 minutes
- Email/SMS alerts

**Pingdom:**
- More detailed monitoring
- Performance tracking

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] CORS configured for production domain
- [ ] Email sending configured and tested
- [ ] File storage (S3) configured
- [ ] Backup strategy implemented
- [ ] Monitoring and logging set up
- [ ] Error tracking (Sentry) configured
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Rate limiting enabled
- [ ] CDN configured (optional)
- [ ] Documentation updated
- [ ] Team access configured

---

## Rollback Procedure

### Quick Rollback

**Docker:**
```bash
# Revert to previous image
docker-compose down
docker-compose up -d <previous-image-tag>
```

**AWS ECS:**
```bash
# Update service to previous task definition
aws ecs update-service \
  --cluster proposal-platform \
  --service backend \
  --task-definition backend:previous-revision
```

**Railway/Render:**
- Use web console to rollback to previous deployment

---

## Post-Deployment

1. **Verify all services are running**
2. **Test critical user flows**
3. **Monitor logs for errors**
4. **Check performance metrics**
5. **Verify email notifications**
6. **Test file uploads**
7. **Confirm database backups**
8. **Document deployment notes**

---

## Support and Maintenance

### Regular Maintenance Tasks

- Weekly: Review logs and errors
- Weekly: Check disk space and database size
- Monthly: Update dependencies
- Monthly: Review security advisories
- Quarterly: Performance optimization review
- Quarterly: Backup restoration test

---

**Need help?** Refer to [SETUP.md](./SETUP.md) for development setup or create an issue in the repository.
