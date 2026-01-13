FROM node:22.13-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS production

# Clear the default Nginx wpage
RUN rm -rf /usr/share/nginx/html/*

# Transfer the compiled assets from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]