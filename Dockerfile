FROM node:24.9.0-alpine as BUILD

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

RUN npm prune --production

FROM node:24.9.0-alpine

WORKDIR /app

COPY --from=BUILD ./app/dist ./dist
COPY --from=BUILD ./app/node_modules ./node_modules

CMD [ "node", "dist/src/main" ]

#RUN: lệnh chạy trong lúc build image
#CMD: sẽ chạy khi container start
# -d: container chạy không chiếm dụng termnial
#-p: publish port
#khi dockerfile thay đổi -> cần phải build image lại
#2.8gb
