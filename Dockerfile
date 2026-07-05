# Use full Node 20 for maximum compatibility with native dependencies
FROM node:20

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Ensure pnpm version matches local environment
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /app

# Copy the entire workspace
# respect .dockerignore to avoid copying local node_modules
COPY . .

# Ensure a clean install environment
RUN rm -rf node_modules artifacts/*/node_modules lib/*/node_modules

# Install dependencies
# --no-frozen-lockfile allows pnpm to resolve differences between Windows and Linux
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
