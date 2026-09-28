FROM node:22-alpine

WORKDIR /app

# The demo manager creates and runs project containers through the host
# Docker daemon. The CLI and socket access are therefore part of runtime.
RUN apk add --no-cache docker-cli

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

ENV PORT=5000
ENV UPLOAD_MAX_BYTES=524288000

EXPOSE 5000

# Access to /var/run/docker.sock is intentionally required by the demo
# runtime. The deployment must mount the host Docker socket.
USER root

CMD ["npm", "start"]
