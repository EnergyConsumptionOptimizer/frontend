FROM node:22.13-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Install build dependencies first to leverage Docker layer caching
COPY package*.json ./

# Prefer npm ci when package-lock.json is present (faster, reproducible)
RUN npm ci || npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Serve the application with Nginx
FROM nginx:alpine AS prod-stage

# Remove the default config (for safety)
RUN rm -rf /etc/nginx/conf.d/*

# Copy the Vue build
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite the main file /etc/nginx/nginx.conf
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]