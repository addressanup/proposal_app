# Multi-stage build for production

# Stage 1: Build Backend and Frontend
FROM node:18-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy backend package files
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci && npm cache clean --force

# Copy backend source code
COPY backend ./

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Build Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci && npm cache clean --force

COPY frontend ./
RUN npm run build

# Stage 2: Production
FROM node:18-slim

WORKDIR /app

# Install OpenSSL for Prisma and dumb-init for proper signal handling
RUN apt-get update && apt-get install -y openssl dumb-init && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/backend/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/backend/start.sh ./start.sh
COPY --from=builder --chown=nodejs:nodejs /app/frontend/dist ./public

# Make start script executable
RUN chmod +x start.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application (runs migrations first, then starts server)
CMD ["./start.sh"]
