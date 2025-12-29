#!/bin/sh

envsubst '\
    \${USER_SERVICE_NAME} \${USER_SERVICE_PORT}\
    \${THRESHOLD_SERVICE_NAME} \${THRESHOLD_SERVICE_PORT}\
    \${FORECAST_SERVICE_NAME} \${FORECAST_SERVICE_PORT}\'< /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/nginx.conf

# Start Nginx
exec "$@"
