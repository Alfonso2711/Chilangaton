# Multi-stage Dockerfile for CanastaLocal CDMX monolithic application

# -------------------------------------------------------------
# Stage 1: Build the Vite React application
# -------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies using legacy-peer-deps to handle peer dependency resolution cleanly
RUN npm install --legacy-peer-deps

# Build-time argument for optional Gemini API Key
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Copy all source files
COPY . .

# Build the production-ready bundle into /app/dist
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Serve with lightweight Nginx web server
# -------------------------------------------------------------
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check to ensure the web server is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/healthz || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
