from node:20

WORKDIR /app
COPY . /app
RUN npm i

EXPOSE 3000
CMD [ "node", "dist/index.js" ]