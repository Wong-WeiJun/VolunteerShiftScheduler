FROM node:22-alpine

WORKDIR /app

# Install dependencies (package-lock.json speeds this up)
COPY package*.json ./
RUN npm ci

# Source code is mounted at runtime for dev; this copies it for the image
COPY . .

# No EXPOSE or CMD here — docker-compose sets the command
