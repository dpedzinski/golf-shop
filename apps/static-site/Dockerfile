FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/gecx-sdk/package.json ./packages/gecx-sdk/package.json
COPY packages/gecx-components/package.json ./packages/gecx-components/package.json
COPY apps/static-site/package.json ./apps/static-site/package.json

RUN npm ci \
    && ROLLUP_VERSION="$(node -p 'require("./packages/gecx-components/node_modules/vite/node_modules/rollup/package.json").version')" \
    && ROLLDOWN_VERSION="$(node -p 'require("./node_modules/rolldown/package.json").version')" \
    && LIGHTNINGCSS_VERSION="$(node -p 'require("./node_modules/lightningcss/package.json").version')" \
    && TAILWIND_OXIDE_VERSION="$(node -p 'require("./node_modules/@tailwindcss/oxide/package.json").version')" \
    && NEXT_VERSION="$(node -p 'require("./node_modules/next/package.json").version')" \
    && REACT_SERVER_DOM_WEBPACK_VERSION="$(node -p 'require("./apps/static-site/package.json").dependencies["react-server-dom-webpack"]')" \
    && npm install --no-save --no-audit --no-fund \
        "@rollup/rollup-linux-x64-gnu@${ROLLUP_VERSION}" \
        "@rolldown/binding-linux-x64-gnu@${ROLLDOWN_VERSION}" \
        "lightningcss-linux-x64-gnu@${LIGHTNINGCSS_VERSION}" \
        "@tailwindcss/oxide-linux-x64-gnu@${TAILWIND_OXIDE_VERSION}" \
        "@next/swc-linux-x64-gnu@${NEXT_VERSION}" \
        "react-server-dom-webpack@${REACT_SERVER_DOM_WEBPACK_VERSION}"

COPY . .

RUN npm run site:build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app ./

EXPOSE 8080

CMD ["npm", "run", "start", "--workspace", "apps/static-site", "--", "--hostname", "0.0.0.0"]
