# Stage 1: Use the specified Node.js version on a minimal 'alpine' base
FROM node:23-alpine AS development

# Set the working directory in the container
WORKDIR /app

# Create a non-root user and group for security
# Running as a non-root user is a security best practice
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy package definition files
# By copying these first and separately, we leverage Docker's layer caching.
# The 'npm install' step below will only re-run if these files change.
COPY package*.json ./

# Install dependencies
RUN npm install

# Change ownership of the node_modules directory to the non-root user
RUN chown -R nextjs:nextjs /app/node_modules

# Switch to the non-root user
USER nextjs

# Copy the rest of the application code
# Since this is the code that changes most frequently, we copy it last.
# This ensures the steps above remain cached for as long as possible.
COPY . .

# Expose the Next.js port
EXPOSE 3000

# Command to run the development server
CMD ["npm", "run", "dev"]