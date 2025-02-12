# Base stage
FROM node:20 AS base
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Release stage
FROM node:20-alpine3.19 as release
WORKDIR /app

# Copy necessary files from base stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
