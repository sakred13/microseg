import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { API_URL } from '../../config';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Title, Tooltip, Legend } from 'chart.js';

// Register the components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Title, Tooltip, Legend);

const UtilizationCharts = () => {
  const [cpuData, setCpuData] = useState([]);
  const [ramData, setRamData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [firstIteration, setFirstIteration] = useState(true);

  // Define the options object
  const options = {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  useEffect(() => {
    const socket = new WebSocket(`ws://${API_URL.replace('3001', '3004').replace('http://', '')}/utilizationData`);
    
    socket.onmessage = (event) => {
      const newData = JSON.parse(event.data);

      if (Array.isArray(newData)) { // Check if newData is an array
        if (firstIteration) {
          // For the first iteration, set the whole response to the data arrays
          setLabels(newData.map((_, index) => index));
          setCpuData(newData.map(item => parseFloat(item.cpu)));
          setRamData(newData.map(item => parseFloat(item.ram)));
          setFirstIteration(false); // Update the flag
        } else {
          // For subsequent iterations, append new data to the arrays
          setLabels((prevLabels) => [...prevLabels, labels.length]);
          setCpuData((prevCpuData) => [...prevCpuData, parseFloat(newData.cpu)]);
          setRamData((prevRamData) => [...prevRamData, parseFloat(newData.ram)]);
        }
      } else {
        // Handle the case where newData is not an array (e.g., handle the error or update state accordingly)
        console.error('Received non-array data from WebSocket:', newData);
      }
    };

    // Close the WebSocket connection when the component is unmounted
    return () => {
      socket.close();
    };
  }, [firstIteration]);

  const cpuChartConfig = {
    data: {
      labels: labels,
      datasets: [
        {
          label: 'CPU Utilization',
          data: cpuData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: options, // Pass the options here
  };

  const ramChartConfig = {
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Memory Utilization',
          data: ramData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: options, // Pass the options here
  };

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Resource Utilization</h3>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '60%' }}>
          <div>
            <Line {...cpuChartConfig} />
          </div>
          <div>
            <Line {...ramChartConfig} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilizationCharts;
