/***************************************************************************
 * threads-server.js (Threads service with Winston CloudWatch logging)
 ***************************************************************************/
 
const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const bodyParser = require('koa-bodyparser');

// ─────────────────────────────────────────────────────────────
// 1) Winston + CloudWatch Setup
// ─────────────────────────────────────────────────────────────
const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

// Create Winston logger with Console + CloudWatch transports
const logger = winston.createLogger({
  transports: [
    // Console for local debug (optional)
    new winston.transports.Console(),

    // CloudWatch transport (use WinstonCloudWatch, not winston.transports.Cloudwatch)
    new WinstonCloudWatch({
      logGroupName: '/ecs/logging-service-task',  // Your CloudWatch log group
      logStreamName: 'threads-service',          // Name the log stream anything
      awsRegion: 'us-west-2',                   // Match your region
      jsonMessage: true                         // Log as JSON
      // If running locally, ensure AWS creds are set (env vars or ~/.aws/credentials).
    })
  ]
});

// ─────────────────────────────────────────────────────────────
// 2) Load "Threads" Data from db.json
// ─────────────────────────────────────────────────────────────
const DB_FILE_PATH = path.join(__dirname, 'db.json');
let db = { threads: [] };

// If db.json exists, parse it
if (fs.existsSync(DB_FILE_PATH)) {
  const fileData = fs.readFileSync(DB_FILE_PATH, 'utf8');
  db = JSON.parse(fileData);
}

// ─────────────────────────────────────────────────────────────
// 3) Koa App + Router
// ─────────────────────────────────────────────────────────────
const app = new Koa();
const router = new Router();

// Helper function to log each request to CloudWatch
function logRequest(ctx) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: ctx.method,
    url: ctx.url,
    ip: ctx.ip,
    status: ctx.status
  };

  // Send the log entry to CloudWatch
  logger.info('Request Log', logEntry);
}

// Logging Middleware: runs after each route
app.use(async (ctx, next) => {
  await next();
  logRequest(ctx);
});

// ─────────────────────────────────────────────────────────────
// 4) Define Threads Routes
// ─────────────────────────────────────────────────────────────
router.get('/api/threads', async (ctx) => {
  ctx.body = db.threads;
});

router.get('/api/threads/:id', async (ctx) => {
  const threadId = parseInt(ctx.params.id);
  const thread = db.threads.find((t) => t.id === threadId);

  if (thread) {
    ctx.body = thread;
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Thread not found' };
  }
});

// Apply Routes & BodyParser
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

// ─────────────────────────────────────────────────────────────
// 5) Start Server
// ─────────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Threads service running on port ${PORT}`);
});
