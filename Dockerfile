# Use full Node 20 as base for maximum compatibility
FROM node:20

# Install pnpm directly
RUN npm install -g pnpm@11.9.0

WORKDIR /app

# Copy the entire project first to ensure all workspace dependencies are visible
# .dockerignore will still filter out node_modules, .git, etc.
COPY . .

# Ensure clean state
RUN rm -rf node_modules artifacts/*/node_modules lib/*/node_modules

# Run install with more info
RUN pnpm install --no-frozen-lockfile

# Build the API server
RUN pnpm --filter @workspace/api-server... build

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start command
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
