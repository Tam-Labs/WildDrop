FROM oven/bun:latest AS BUILDER

WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile --silent
RUN bun run build 

FROM oven/bun:latest AS FINAL

WORKDIR /app
COPY --from=BUILDER ./app/dist ./dist
COPY package.json .
COPY bun.lockb .
COPY ./data ./data
RUN bun install --production --frozen-lockfile --silent

EXPOSE 9876

CMD ["bun", "run", "prod"]
