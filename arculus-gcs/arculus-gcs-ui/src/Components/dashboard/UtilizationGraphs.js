import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { API_URL } from '../../config';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, TimeScale, Title, Tooltip, Legend } from 'chart.js';

// Register the components
ChartJS.register(LinearScale, PointElement, LineElement, TimeScale, Title, Tooltip, Legend);

const UtilizationCharts = () => {
  const [cpuData, setCpuData] = useState([]);
  const [ramData, setRamData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [firstIteration, setFirstIteration] = useState(true);
  const [cpuYMin, setCpuYMin] = useState(0);
  const [cpuYMax, setCpuYMax] = useState(100);
  const [ramYMin, setRamYMin] = useState(0);
  const [ramYMax, setRamYMax] = useState(100);

  useEffect(() => {
    const socket = new WebSocket(`ws://${API_URL.replace('3001', '3004').replace('http://', '')}/utilizationData`);

    socket.onmessage = (event) => {
      const newData = JSON.parse(event.data);

      if (Array.isArray(newData)) {
        if (firstIteration) {
          const newDataCpu = newData.map(item => parseFloat(item.cpu));
          const newDataRam = newData.map(item => parseFloat(item.ram));
          const newLabels = newData.map((_, index) => 1200 - index);
          const cpuMinValue = Math.min(...newDataCpu);
          const cpuMaxValue = Math.max(...newDataCpu);
          const ramMinValue = Math.min(...newDataRam);
          const ramMaxValue = Math.max(...newDataRam);
          
          setLabels(newLabels);
          setCpuData(newDataCpu);
          setRamData(newDataRam);
          setCpuYMin(cpuMinValue);
          setCpuYMax(cpuMaxValue);
          setRamYMin(ramMinValue);
          setRamYMax(ramMaxValue);
          
          setFirstIteration(false);
        } else {
          setLabels((prevLabels) => [...prevLabels, labels.length]);
          setCpuData((prevCpuData) => [...prevCpuData, parseFloat(newData.cpu)]);
          setRamData((prevRamData) => [...prevRamData, parseFloat(newData.ram)]);
        }
      } else {
        console.error('Received non-array data from WebSocket:', newData);
      }
    };

    return () => {
      socket.close();
    };
  }, [firstIteration]);

  const cpuChartConfig = {
    data: {
      labels: labels,
      datasets: [
        {
          label: 'CPU Utilization (%)',
          data: cpuData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          reverse: true,
          title: {
            display: true,
            text: 'Timestamps ago (Every 3 seconds)',
          },
        },
        y: {
          min: cpuYMin - cpuYMin/50,
          max: cpuYMax + cpuYMax/50,
          beginAtZero: true,
          title: {
            display: true,
          },
        },
      },
    },
  };

  const ramChartConfig = {
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Memory Utilization (%)',
          data: ramData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          reverse: true,
          title: {
            display: true,
            text: 'Timestamps ago (Every 3 seconds)',
          },
        },
        y: {
          min: ramYMin - ramYMin/50,
          max: ramYMax + ramYMax/50,
          beginAtZero: true,
          title: {
            display: true,
          },
        },
      },
    },
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
