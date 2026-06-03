# ============================================================================
# Frontend image: build the Vite SPA, then serve the static bundle with nginx.
# Build from the repo root: docker build -f frontend/Dockerfile .
# ============================================================================
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json ./frontend/
COPY package.json package-lock.json* ./
RUN npm install --workspace @fems/frontend --include-workspace-root || (cd frontend && npm install)
COPY frontend ./frontend
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN cd frontend && npm run build

FROM nginx:alpine AS serve
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
