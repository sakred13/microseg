// utilizationService.js
const fs = require('fs');
const express = require('express');
const router = express.Router();

let utilizationData = [];

function getUtilizationData() {
  const os = require('os');
  const cpu = os.cpus()[0]; // Get information about the first CPU core

  const idle = cpu.times.idle;
  const total = Object.values(cpu.times).reduce((acc, val) => acc + val, 0);

  const cpuUsage = 100 - (idle / total) * 100;

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
  }, 1000); 
};

// This function will be called when the API endpoint is hit
const getUtilizationApi = (req, res) => {
  // Send the utilization data as a JSON response
  res.json(utilizationData);
};

const saveUtilizationDataToCSV = (req, res) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-'); // Replace colons with dashes for Windows compatibility
  const filePath = `utilization_data_${timestamp}.csv`;

  const csvData = utilizationData.map(({ cpu, ram }) => `${cpu},${ram}`).join('\n');
  fs.writeFile(filePath, 'CPU Utilization (%),RAM Utilization (%)\n' + csvData, err => {
    if (err) {
      console.error('Error saving utilization data to CSV:', err);
    } else {
      console.log(`Utilization data saved to ${filePath} successfully.`);
      res.json({message: "Success"});
    }
  });
}

// Start collecting utilization data
startUtilizationCollection();

// Export the function to start utilization collection and the API function
module.exports = {
  startUtilizationCollection,
  getUtilizationApi,
  saveUtilizationDataToCSV
};
