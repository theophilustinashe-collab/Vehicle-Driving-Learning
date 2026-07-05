# Use Node 20 as base
FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy necessary files for dependency installation
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY lib/db/package.json ./lib/db/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/api-zod/package.json ./artifacts/api-zod/

# Install dependencies without frozen lockfile to allow auto-fixes on build
RUN pnpm install

# Now copy the rest of the source code
COPY . .

# Build the API server
RUN pnpm --filter @workspace/api-server build

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the API server directly with node for efficiency
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
