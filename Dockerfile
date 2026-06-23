FROM node:18-alpine
WORKDIR /app

# Copy root package.json and package-lock.json
COPY package*.json ./

# Install dependencies (backend + frontend build triggered by root scripts)
RUN npm install

# Copy everything (backend + frontend)
COPY . .

# Expose backend port
EXPOSE 5000

# Start backend (frontend is served from build folder)
CMD ["npm", "start"]
