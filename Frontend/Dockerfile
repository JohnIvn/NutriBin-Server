# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (dev included for build)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy project files
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY jsconfig.json ./
COPY index.html ./
COPY src ./src
COPY public ./public

# Build the React/Vite app to ./dist with Railway backend URL
RUN VITE_API_URL=http://nutribin-server.railway.internal:8080 npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install a simple HTTP server to serve static files
RUN npm install -g serve

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Railway provides PORT; default to 8080
ENV PORT=8080
EXPOSE 8080

# Serve the static files
CMD ["serve", "-s", "dist", "-l", "8080"]
