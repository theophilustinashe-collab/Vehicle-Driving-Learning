# Use Node 20 as base
FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy the entire workspace (filtered by .dockerignore)
# This includes all package.json files and the lockfile
COPY . .

# Install dependencies
# We use --no-frozen-lockfile because the lockfile might have been generated on a different platform (Windows)
RUN pnpm install --no-frozen-lockfile

# Build the API server and its local dependencies
RUN pnpm --filter @workspace/api-server... build

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the API server
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
