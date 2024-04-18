FROM node:20-alpine3.18 AS BUILDER

WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile --silent --non-interactive
RUN yarn build 

FROM node:20-alpine3.18 AS FINAL

WORKDIR /app
COPY --from=BUILDER ./app/dist ./dist
COPY package.json .
COPY yarn.lock .
COPY ./data ./data
RUN yarn install --production --frozen-lockfile --silent --non-interactive

EXPOSE 9876

CMD ["yarn", "prod"]
