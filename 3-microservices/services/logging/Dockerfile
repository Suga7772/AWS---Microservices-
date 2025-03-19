FROM node:18-alpine

WORKDIR /srv

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy all files (including server.js)
COPY . . 

# Start the application
CMD ["node", "server.js"]
