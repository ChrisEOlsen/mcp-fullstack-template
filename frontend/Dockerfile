# Stage 1: Use the specified Node.js version on a minimal 'alpine' base
FROM node:23-alpine AS development

# Set the working directory in the container
WORKDIR /app

# Copy package definition files
# By copying these first, we leverage Docker's layer caching.
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the Next.js port
EXPOSE 3000

# Command to run the development server as root
CMD ["npm", "run", "dev"]