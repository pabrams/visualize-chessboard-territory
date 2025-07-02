#!/bin/sh

echo "PATH is: $PATH"
which docker || echo "docker not found"

DEV_IMAGE_TAG=my-app-dev

echo "Building Docker image on host..."
docker build -t $DEV_IMAGE_TAG -f- . <<EOF
FROM node:22.14.0-alpine3.21
WORKDIR /app
COPY package*.json ./
RUN npm install
EOF

echo "Running container with volume mount and port forwarding..."
docker run -it --rm \
  -v "$(pwd)":/app \
  -w /app \
  -p 5173:5173 \
  $DEV_IMAGE_TAG \
  sh -c "npm install && npm run copy-assets && vite"