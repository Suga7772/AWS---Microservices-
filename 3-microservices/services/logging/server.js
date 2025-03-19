const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const fs = require('fs');

const app = new Koa();
const router = new Router();
const db = require('./db.json');

// Middleware to parse request body
app.use(bodyParser());

// Middleware to log requests
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// GET: Retrieve all log entries
router.get('/api/logs', async (ctx) => {
  ctx.body = db.logs || [];
});

// POST: Create a new log entry
router.post('/api/logs', async (ctx) => {
  const { level, message } = ctx.request.body;

  if (!level || !message) {
    ctx.status = 400;
    ctx.body = { error: 'Level and message are required' };
    return;
  }

  const newLog = {
    id: db.logs.length + 1,
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  db.logs.push(newLog);

  // Save to db.json
  fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));

  ctx.status = 201;
  ctx.body = newLog;
});

// Default API endpoints
router.get('/api/', async (ctx) => {
  ctx.body = 'API ready to receive requests';
});

router.get('/', async (ctx) => {
  ctx.body = 'Ready to receive requests';
});

// Apply routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
