FROM apify/actor-node:20

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . ./

# Set environment variables
ENV APIFY_HEADLESS=1

# Run the actor
CMD ["node", "src/main.js"]