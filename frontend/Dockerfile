FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile || yarn install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Set environment to development for hot reload
ENV NODE_ENV=development

# Start the application
CMD ["yarn", "start"]