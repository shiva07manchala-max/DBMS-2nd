# Production Dockerfile for DriveCare PRO Full-Stack System
FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Copy full application source
WORKDIR /app
COPY backend ./backend

# Expose server port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start server
WORKDIR /app/backend
CMD ["node", "src/server.js"]
