FROM node:22.13-alpine AS builder

WORKDIR /app

# Copy dependency definitions first
COPY package*.json ./

# Install dependencies 
RUN npm ci || npm install

COPY . .

RUN npm run build


FROM nginx:alpine AS production

# Clear the default Nginx wpage
RUN rm -rf /usr/share/nginx/html/*

# Transfer the compiled assets from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration template
COPY ./nginx.conf /etc/nginx/conf.d/nginx.conf.template

# Setup the entrypoint script for environment variable handling
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]