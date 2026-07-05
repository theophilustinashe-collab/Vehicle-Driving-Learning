# Use Node 20 as base
FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install system dependencies that might be needed for native builds
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

# Copy the entire workspace (filtered by .dockerignore)
COPY . .

# Install dependencies with verbose logging to catch the exact error
# --no-frozen-lockfile is used because the lockfile was generated on Windows
RUN pnpm install --no-frozen-lockfile --reporter=silent || pnpm install --no-frozen-lockfile

# Build the API server and its local dependencies
RUN pnpm --filter @workspace/api-server... build

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the API server
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
