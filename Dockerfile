# Use full Node 20 as base
FROM node:20

# Set pnpm home and path
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack and install specific pnpm version
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /app

# Copy configuration files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy all package.json files for workspace resolution
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/vid-master/package.json ./artifacts/vid-master/
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY scripts/package.json ./scripts/

# Install dependencies (this layer is cached if package.jsons don't change)
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the API server and its local dependencies
RUN pnpm --filter @workspace/api-server... build

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the API server
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
