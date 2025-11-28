#FROM node:20-alpine
FROM public.ecr.aws/docker/library/node:20.11.1-alpine3.19 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 動態計算hash轉成base64並寫入index.html
RUN for JS_FILE in /app/dist/assets/index-*.js; do \
  HASH=$(sha256sum "$JS_FILE" | awk '{print $1}'); \
  HASH_B64=$(echo -n "$HASH" | xxd -r -p | base64); \
  JS_BASENAME=$(basename "$JS_FILE"); \
  echo "$JS_FILE=sha256-$HASH_B64"; \
  sed -i "s|<script[^>]*src=\"/assets/$JS_BASENAME\"|<script type=\"module\" crossorigin integrity=\"sha256-$HASH_B64\" src=\"/assets/$JS_BASENAME\"|g" /app/dist/index.html; \
done

EXPOSE 3000

# Use Nginx as the production server
FROM public.ecr.aws/docker/library/nginx:1.27-alpine3.21-slim
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf.template
COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY nginx/prepare.sh /nginx/prepare.sh
RUN chmod +x /nginx/prepare.sh
CMD ["/nginx/prepare.sh"]