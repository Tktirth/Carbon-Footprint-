# Use official lightweight Node.js 22 LTS image
FROM node:22-alpine

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Create and set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose the Cloud Run default port
EXPOSE 8080

# Run the server
CMD ["node", "server.js"]
