/***************************************************************************
 * users-server.js (Users service with Winston CloudWatch logging)
 ***************************************************************************/

const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const bodyParser = require('koa-bodyparser');

// 1) Winston + CloudWatch
const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

const logger = winston.createLogger({
  transports: [
    // Local console for debugging
    new winston.transports.Console(),

    // CloudWatch transport
    new WinstonCloudWatch({
      logGroupName: '/ecs/user-service', // Use your own log group name
      logStreamName: 'users-service',            // Customize for this service
      awsRegion: 'us-west-2',                   // Match your AWS region
      jsonMessage: true                         // Logs as JSON
      // If running locally, ensure AWS credentials are set (env vars or ~/.aws/credentials).
    })
  ]
});

// 2) Load "Users" data from db.json
const DB_PATH = path.join(__dirname, 'db.json');
let db = { users: [] };

if (fs.existsSync(DB_PATH)) {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  db = JSON.parse(data);
}

// 3) Create Koa app and router
const app = new Koa();
const router = new Router();

// Helper function to send log data to CloudWatch
function logRequest(ctx) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: ctx.method,
    url: ctx.url,
    ip: ctx.ip,
    status: ctx.status
  };

  // Winston logs to CloudWatch
  logger.info('Request Log', logEntry);
}

// Logging middleware
app.use(async (ctx, next) => {
  await next();
  logRequest(ctx);
});

// 4) Define Users routes
router.get('/api/users', async (ctx) => {
  ctx.body = db.users;
});

router.get('/api/users/:id', async (ctx) => {
  const userId = parseInt(ctx.params.id, 10);
  const user = db.users.find((u) => u.id === userId);

  if (user) {
    ctx.body = user;
  } else {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
  }
});

router.get('/health', async (ctx) => {
  ctx.status = 200;
  ctx.body = { status: 'healthy' };
});

// Apply bodyParser and routes
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

// 5) Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
