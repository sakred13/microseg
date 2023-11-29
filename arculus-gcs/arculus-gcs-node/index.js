const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { exec, execSync } = require('child_process');
const WebSocket = require('ws');
const http = require('http');
const axios = require('axios'); // Import Axios for making HTTP requests

const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const taskRoutes = require('./routes/taskRoutes');
const honeyNetProxyRoutes = require('./routes/honeyNetProxyRoutes');
const { joinReqsWebSocket, joinStatusWebSocket } = require('./services/deviceService');

const hostIp = execSync("ifconfig eth0 | grep 'inet ' | awk '{print $2}'").toString().trim();
const publicIp = execSync("curl -s ifconfig.me").toString().trim();
console.log('Public IP: ', publicIp);

const allowCors = [
  `http://localhost`,
  `http://127.0.0.1`,
  `http://${hostIp}`,
  `http://${publicIp}`,
  `http://ec2-${publicIp.replace(/\./g, '-')}.compute-1.amazonaws.com:3000`,
];

console.log(allowCors);

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
app.use('/honeypot-api/', honeyNetProxyRoutes);

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

// Proxy route for honeypot API
app.all('/honeypot-api/*', async (req, res) => {
    try {
      // Extract the path after '/honeypot-api/' to use in the proxy URL
      const apiPath = req.params[0];
  
      // Create the full URL to the honeypot service API
      const honeypotApiUrl = `https://honeypot-service-api-url.com/${apiPath}`;
  
      // Make a request to the honeypot API, forwarding the HTTP method
      const response = await axios({
        method: req.method,
        url: honeypotApiUrl,
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY', // Add any required headers here
          // Other headers as needed to mimic the dashboard request
        },
        data: req.body, // Include request body if present (for POST and PUT requests)
      });
  
      // Forward the honeypot service response to the client
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('Error calling honeypot API:', error);
      res.status(500).json({ error: 'Proxy error' });
    }
  });

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
