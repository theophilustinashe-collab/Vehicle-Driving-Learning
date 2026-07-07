# Use a multi-stage build to keep the final image small
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# --- Build Stage ---
FROM base AS build
WORKDIR /app
COPY . .
# Only install what's needed for the workspace and the api-server
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @workspace/api-server... build

# --- Production Stage ---
FROM base AS runner
WORKDIR /app

# Copy only the necessary files from the build stage
# We need the workspace package.json and the built api-server
COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-workspace.yaml .
COPY --from=build /app/pnpm-lock.yaml .
COPY --from=build /app/artifacts/api-server/package.json ./artifacts/api-server/
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/lib ./lib

# Install only production dependencies
# This is much faster and uses less memory
RUN pnpm install --prod --no-frozen-lockfile

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
