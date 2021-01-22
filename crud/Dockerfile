FROM node:15.5.1-alpine3.12

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package*.json /app/
RUN npm install

# Bundle app source
COPY . /app/

# Set the command when container start running
CMD ["npm", "start"]