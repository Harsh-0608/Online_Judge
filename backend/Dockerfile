FROM node:18-slim

# Install runtime compilers and utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python-is-python3 \
    g++ \
    default-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Create temp_runs folder
RUN mkdir -p temp_runs && chmod 777 temp_runs

# Expose port and start
EXPOSE 5000
CMD ["npm", "start"]
