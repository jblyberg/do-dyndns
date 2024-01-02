# To build and publish:
# docker build --platform linux/amd64 -t jblyberg/do-dyndns -t jblyberg/do-dyndns:1.0 .

# On M1/2 Mac:
# docker buildx build --platform linux/amd64 --output type=docker -t jblyberg/do-dyndns -t jblyberg/do-dyndns:1.0 .

# To Push:
# docker push jblyberg/do-dyndns; docker push jblyberg/do-dyndns:1.0

#
# 🏡 Build
#

FROM node:20-alpine as builder

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Re-create non-root user for Docker
RUN addgroup --system --gid 1001 dyndns
RUN adduser --system --uid 1001 dyndns

# Copy Source
COPY --chown=dyndns:dyndns package.json tsconfig.json tsconfig.build.json pnpm-lock.yaml ./
COPY --chown=dyndns:dyndns src/ src/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate the production build. The build script runs "nest build" to compile the application.
RUN pnpm build
RUN pnpm prune --prod

USER dyndns

#
# 🚀 Production
#

FROM node:20-alpine as production

WORKDIR /app

# Set to production environment
ENV NODE_ENV production

# Re-create non-root user for Docker
RUN addgroup --system --gid 1001 dyndns
RUN adduser --system --uid 1001 dyndns

# Copy only the necessary files
COPY --chown=dyndns:dyndns --from=builder /app/dist dist
COPY --chown=dyndns:dyndns --from=builder /app/node_modules node_modules
COPY --chown=dyndns:dyndns --from=builder /app/package.json package.json

# Set Docker as non-root user
USER dyndns

CMD ["npm", "run", "start:prod"]