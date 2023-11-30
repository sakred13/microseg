const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { exec, execSync } = require('child_process');
const WebSocket = require('ws');
const http = require('http');

const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const taskRoutes = require('./routes/taskRoutes');
const honeyNetProxyRoutes = require('./routes/honeyNetProxyRoutes');
const honeyPotRoutes = require('./routes/honeyPotRoutes');

const { joinReqsWebSocket, joinStatusWebSocket } = require('./services/deviceService');

const hostIp = execSync("ifconfig eth0 | grep 'inet ' | awk '{print $2}'").toString().trim();
const publicIp = execSync("curl -s ifconfig.me").toString().trim();
console.log('Public IP: ', publicIp);

const allowCors = [
  `http://localhost:3000`,
  `http://127.0.0.1:3000`,
  `http://${hostIp}:3000`,
  `http://${publicIp}:3000`,
  `http://ec2-${publicIp.replace(/\./g, '-')}.compute-1.amazonaws.com:3000`,
];

const app = express();
const server = http.createServer(app);

const joinReqsServer = http.createServer();
const joinReqsWss = new WebSocket.Server({ server: joinReqsServer, path: '/joinRequests' });

const joinStatusServer = http.createServer();
const joinStatusWss = new WebSocket.Server({ server: joinStatusServer, path: '/getJoinStatus' });

app.use(cors({
  origin: allowCors,
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/', userRoutes);
app.use('/', deviceRoutes);
app.use('/', authRoutes);
app.use('/', roleRoutes);
app.use('/', taskRoutes);
app.use('/honeypot-proxy/', honeyNetProxyRoutes);
app.use('/honeypot-api/', honeyPotRoutes);

// Error handling middleware to catch any unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // You can choose to log the exception and continue here
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Log the exception and choose whether to continue
});

// WebSocket servers
joinReqsWss.on('connection', joinReqsWebSocket);
joinStatusWss.on('connection', joinStatusWebSocket);

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

joinStatusServer.listen(3002, () => {
  console.log('Join Status WebSocket server listening on port 3002');
});

joinReqsServer.listen(3003, () => {
  console.log('Join Requests WebSocket server listening on port 3003');
});
