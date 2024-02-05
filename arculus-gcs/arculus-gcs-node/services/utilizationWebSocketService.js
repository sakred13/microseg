const WebSocket = require('ws');
const os = require('os');
const http = require('http');

let utilizationData = [];

function getUtilizationData() {
  const cpus = os.cpus();
  const totalCores = cpus.length;

  const cpuTotalUsage = cpus.reduce((total, cpu) => {
    return total + (1 - (cpu.times.idle / (cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle)));
  }, 0);

  const cpuUsage = (cpuTotalUsage / totalCores) * 100;

  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const ramUsage = (usedMemory / totalMemory) * 100;

  return {
    cpu: cpuUsage.toFixed(2),
    ram: ramUsage.toFixed(2),
  };
}

const startUtilizationCollection = () => {
  setInterval(() => {
    const latestUtilization = getUtilizationData();
    utilizationData.push(latestUtilization);
    utilizationData = utilizationData.slice(-1200); // Keep only the last 10 hours (120 data points)
  }, 3000); // Collect data every 3 seconds
};

const utilizationServer = http.createServer();
const utilizationWss = new WebSocket.Server({ server: utilizationServer, path: '/utilizationData' });

utilizationWss.on('connection', (ws) => {
  console.log('Utilization WebSocket client connected');

  ws.send(JSON.stringify(utilizationData));

  const sendUtilizationData = () => {
    const latestUtilization = getUtilizationData();
    ws.send(JSON.stringify(latestUtilization));
  };

  sendUtilizationData();
  const updateInterval = setInterval(sendUtilizationData, 3000);

  ws.on('close', () => {
    console.log('Utilization WebSocket client disconnected');
    clearInterval(updateInterval);
  });
});

module.exports = {
  startUtilizationCollection,
  utilizationServer,
};
