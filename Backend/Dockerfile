# Railway-ready Dockerfile for NestJS Backend
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (including dev for build)
COPY package*.json ./
RUN npm ci

# Copy build configs and source
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Build the NestJS app
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Railway provides PORT; default to 3000 if unset
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
