# ============================================================================
# Generic Dockerfile for any FEMS Node service or the gateway.
# The target service is selected at build time via the SERVICE build arg, e.g.
#   docker build --build-arg SERVICE=services/auth-service .
# The monorepo is installed once so the @fems/shared workspace resolves.
# ============================================================================
FROM node:20-alpine
WORKDIR /app

# Which workspace to run (path to the folder containing src/server.js).
ARG SERVICE=gateway
ENV SERVICE_DIR=${SERVICE}

# Install dependencies (whole workspace; dev deps omitted for a lean image).
COPY package.json package-lock.json* ./
COPY packages ./packages
COPY services ./services
COPY gateway ./gateway
COPY database ./database
RUN npm install --omit=dev

ENV NODE_ENV=production

# Run the selected service. SERVICE_DIR is resolved at container start so the
# same image definition serves every service.
CMD ["sh", "-c", "node ${SERVICE_DIR}/src/server.js"]
