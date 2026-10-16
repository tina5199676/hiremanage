# --------------------------------------------------
# Stage 1: build
# --------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# 目前沒有真正的後端，正式建置也啟用 MSW，讓容器可獨立展示
ARG VITE_ENABLE_MOCK=true
ENV VITE_ENABLE_MOCK=$VITE_ENABLE_MOCK

RUN npm run build

# --------------------------------------------------
# Stage 2: serve
# --------------------------------------------------
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
