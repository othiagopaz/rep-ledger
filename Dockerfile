# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY backend/ ./backend/
COPY schema.prisma ./

RUN cd backend && npx prisma generate --schema=../schema.prisma
RUN cd backend && npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/schema.prisma ./schema.prisma
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma

COPY startup.sh ./
RUN chmod +x startup.sh

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./startup.sh"]
