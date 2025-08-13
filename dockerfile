# 多阶段构建：构建阶段（Node 22 解决 crypto.hash 报错）
FROM node:22-alpine AS build
WORKDIR /app

# 安装时忽略 peer 冲突
ENV npm_config_legacy_peer_deps=true

# 仅拷贝依赖清单以利用缓存
COPY package*.json ./

# 安装依赖；若有冲突按同事建议处理
RUN npm ci || npm install \
    && npm install tiptap-markdown --legacy-peer-deps || true

# 拷贝源码并构建
COPY . .
RUN npm run build

# 运行阶段：Nginx 提供静态资源 + 反向代理
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# 拷贝构建产物
COPY --from=build /app/dist/ ./

# 覆盖默认站点配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 正确位置设置上传大小（http 上下文）
RUN printf "client_max_body_size 50m;\n" > /etc/nginx/conf.d/00-client-max.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]