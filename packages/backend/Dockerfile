# Production Dockerfile for Motia Backend
# NOTE: Some cloud providers will require you to specify the platform to match your target architecture
# i.e.: AWS Lightsail requires arm64, therefore you update your FROM statement to: FROM --platform=linux/arm64 motiadev/motia:latest
FROM motiadev/motia:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Copy configuration and source code
COPY motia.config.ts ./
COPY src/ ./src/

# Generate types and build for production
RUN npm run generate-types && npm run build

# Create non-root user for security
RUN addgroup --system --gid 1001 motia && \
    adduser --system --uid 1001 --gid 1001 motia

# Change ownership of the app directory
RUN chown -R motia:motia /app
USER motia

# Expose port
EXPOSE 3000

# Health check for production monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run your application in production mode
CMD ["npm", "run", "start"]