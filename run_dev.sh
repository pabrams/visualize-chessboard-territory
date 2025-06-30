#!/bin/sh

# Optional: Use a unique tag for your dev container image
DEV_IMAGE_TAG=my-app-dev

# Build the dev image (only needs Node + deps, no build step)
docker build -t $DEV_IMAGE_TAG -f- . <<EOF
FROM node:22.14.0-alpine3.21
WORKDIR /app
COPY package*.json ./
RUN npm install
EOF

# Run the container with volume mount for live code and open port
docker run -it --rm \
  -v "$(pwd)":/app \
  -w /app \
  -p 5173:5173 \
  $DEV_IMAGE_TAG \
  sh -c "npm install && npm run dev"
