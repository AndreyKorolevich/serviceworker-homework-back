const http = require('http');
const path = require('path');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const faker = require('faker');
const uuid = require('uuid');
const Router = require('koa-router');

const router = new Router();
const app = new Koa();

const public = path.join(__dirname, '/public')
app.use(koaStatic(public));

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({...headers});
    try {
      return await next();
    } catch (e) {
      e.headers = {...e.headers, ...headers};
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});

app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

const news = [
  {
    id: uuid.v4(),
    date: new Date().toLocaleString(),
    avatar: faker.internet.avatar(),
    text: faker.lorem.paragraph()
  },
  {
    id: uuid.v4(),
    date: new Date().toLocaleString(),
    avatar: faker.internet.avatar(),
    text: faker.lorem.paragraph()
  },
  {
    id: uuid.v4(),
    date: new Date().toLocaleString(),
    avatar: faker.internet.avatar(),
    text: faker.lorem.paragraph()
  },
];

router.get('/news', async (ctx) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      ctx.response.body = JSON.stringify({
        status: 'ok',
        news,
      });
      resolve();
    }, 10000);
  });
});

app.use(router.routes()).use(router.allowedMethods());
const server = http.createServer(app.callback());
const port = process.env.PORT || 7070;
server.listen(port);

