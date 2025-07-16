#!/bin/sh

echo "Starting entrypoint.sh"
echo "Current working directory: $(pwd)"
echo "Contents of /app: $(ls -la /app)"

echo "Installing dependencies..."
npm ci
echo "npm ci finished. Contents of node_modules: $(ls -la node_modules)"
echo "Contents of node_modules/.bin: $(ls -la node_modules/.bin)"

echo "Executing CMD: $@"
# Execute the CMD from the Dockerfile
exec "$@"