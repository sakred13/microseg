const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { exec, execSync } = require('child_process');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const taskRoutes = require('./routes/taskRoutes');
const honeyNetProxyRoutes = require('./routes/honeyNetProxyRoutes');
const honeyPotRoutes = require('./routes/honeyPotRoutes');
const blacklistRoutes = require('./routes/blacklistRoutes');
const missionRoutes = require('./routes/missionRoutes');
const policyRoutes = require('./routes/policyRoutes');
const utilizationService = require('./services/utilizationService');
const { joinReqsWebSocket, joinStatusWebSocket } = require('./services/deviceService');
const utilizationRoutes = require('./routes/utilizationRoutes');
const hostIp = execSync("ifconfig eth0 | grep 'inet ' | awk '{print $2}'").toString().trim();
const publicIp = execSync("curl -s ifconfig.me").toString().trim();
const fileUpload = require('express-fileupload');

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
app.use(express.static('tools'));
app.use(fileUpload());

const joinReqsServer = http.createServer();
const joinReqsWss = new WebSocket.Server({ server: joinReqsServer, path: '/joinRequests' });

const joinStatusServer = http.createServer();
const joinStatusWss = new WebSocket.Server({ server: joinStatusServer, path: '/getJoinStatus' });
utilizationService.startUtilizationCollection();

app.use(cors({
  origin: allowCors,
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/user/', userRoutes);
app.use('/device/', deviceRoutes);
app.use('/auth/', authRoutes);
app.use('/role/', roleRoutes);
app.use('/task/', taskRoutes);
app.use('/blacklistapi/', blacklistRoutes);
app.use('/honeypot-proxy/', honeyNetProxyRoutes);
app.use('/honeypot-api/', honeyPotRoutes);
app.use('/utilization/', utilizationRoutes);
app.use('/mission/', missionRoutes);
app.use('/policy/', policyRoutes);

app.get('/tools/downloadJoinWiz', (req, res) => {
  const filePath = path.join(__dirname, '/tools/joinClusterWizard.sh');
  res.download(filePath, 'joinClusterWizard.sh', (err) => {
    if (err) {
      console.error('Error while downloading joinClusterWizard.sh:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// API to download honeypotWiz.py
app.get('/tools/downloadHoneyWiz', (req, res) => {
  const filePath = path.join(__dirname, '/tools/honeypotWiz.py');
  res.download(filePath, 'honeypotWiz.py', (err) => {
    if (err) {
      console.error('Error while downloading honeypotWiz.py:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

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
