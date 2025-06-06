# Use Node Alpine as base image
FROM node:18-alpine

# Install build dependencies and gcc for code compilation
RUN apk add --no-cache \
    python3 \
    build-base \
    g++ \
    openjdk11 \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create necessary directories for compiler and set permissions
RUN mkdir -p Compiler/codes Compiler/inputs Compiler/outputs && \
    chmod 777 Compiler/codes Compiler/inputs Compiler/outputs && \
    chown -R node:node .

# Switch to non-root user
USER node

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5000) + '/health').then(r => process.exit(r.ok ? 0 : 1))"

# Start the application
CMD ["npm", "start"]
