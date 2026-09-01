FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json ./
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
RUN npm install --workspace apps/admin --include-workspace-root

FROM node:22-alpine AS build
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/admin/node_modules ./apps/admin/node_modules
COPY package.json ./
COPY apps/admin ./apps/admin
RUN npm --workspace apps/admin run build

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/admin ./apps/admin
EXPOSE 3000
CMD ["npm", "--workspace", "apps/admin", "run", "start"]
