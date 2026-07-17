# Use Node 20
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# --- Build Stage ---
FROM base AS build
WORKDIR /app
COPY . .
# Use pnpm 9.15.0 to match your local environment
RUN corepack prepare pnpm@9.15.0 --activate
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @roadify/api-server... build

# --- Production Stage ---
FROM base AS runner
WORKDIR /app

# Copy built artifacts and necessary workspace files
COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-workspace.yaml .
COPY --from=build /app/pnpm-lock.yaml .
COPY --from=build /app/artifacts/api-server/package.json ./artifacts/api-server/
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
# Copy libs (sources are needed because they are linked)
COPY --from=build /app/lib ./lib

# Install only production dependencies
RUN corepack prepare pnpm@9.15.0 --activate
RUN pnpm install --prod --no-frozen-lockfile

# Default production port
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Run the server
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
