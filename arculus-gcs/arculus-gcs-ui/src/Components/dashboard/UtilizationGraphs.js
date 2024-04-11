import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import Paper from '@material-ui/core/Paper';
import { API_URL } from '../../config';

ChartJS.register(LinearScale, PointElement, LineElement, TimeScale, Title, Tooltip, Legend);

const UtilizationCharts = () => {
  const [cpuData, setCpuData] = useState([]);
  const [ramData, setRamData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [cpuYMin, setCpuYMin] = useState(0);
  const [cpuYMax, setCpuYMax] = useState(100);
  const [ramYMin, setRamYMin] = useState(0);
  const [ramYMax, setRamYMax] = useState(100);
  const [cpuAverage, setCpuAverage] = useState(0);
  const [ramAverage, setRamAverage] = useState(0);
  const [cpuOneMinAgo, setCpuOneMinAgo] = useState(0);
  const [ramOneMinAgo, setRamOneMinAgo] = useState(0);
  const [cpuImpactScore, setCpuImpactScore] = useState(0);
  const [ramImpactScore, setRamImpactScore] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/utilization/getUtilizationData`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const newData = await response.json();
        if (Array.isArray(newData)) {
          const newDataCpu = newData.map(item => parseFloat(item.cpu));
          const newDataRam = newData.map(item => parseFloat(item.ram));
          const newLabels = newData.map((_, index) => 1200 - index);
          const cpuMinValue = Math.min(...newDataCpu);
          const cpuMaxValue = Math.max(...newDataCpu);
          const ramMinValue = Math.min(...newDataRam);
          const ramMaxValue = Math.max(...newDataRam);
          const cpuAverageValue = newDataCpu.reduce((acc, curr) => acc + curr, 0) / newDataCpu.length;
          const ramAverageValue = newDataRam.reduce((acc, curr) => acc + curr, 0) / newDataRam.length;
          const cpuOneMinAgoValue = newDataCpu[newDataCpu.length - 20];
          const ramOneMinAgoValue = newDataRam[newDataRam.length - 20];

          setLabels(newLabels);
          setCpuData(newDataCpu);
          setRamData(newDataRam);
          setCpuYMin(cpuMinValue);
          setCpuYMax(cpuMaxValue);
          setRamYMin(ramMinValue);
          setRamYMax(ramMaxValue);
          setCpuAverage(cpuAverageValue);
          setRamAverage(ramAverageValue);
          setCpuOneMinAgo(cpuOneMinAgoValue);
          setRamOneMinAgo(ramOneMinAgoValue);

        } else {
          console.error('Received non-array data from API:', newData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCpuImpactScore(calculateImpact(cpuAverage, cpuOneMinAgo, cpuData));
    setRamImpactScore(calculateImpact(ramAverage, ramOneMinAgo, ramData));
  }, [cpuData, ramData]);

  const calculateImpact = (averageValue, pastValue, dataset) => {
    const currentValue = dataset[dataset.length - 1];
    const percentChangeInstantaneous = ((currentValue - pastValue) / pastValue) * 100;
    let score = 0;

    if (percentChangeInstantaneous <= -20) {
      score += 1;
    } else if (percentChangeInstantaneous <= -10) {
      score += 2;
    } else if (percentChangeInstantaneous >= -10 && percentChangeInstantaneous <= 10) {
      score += 3;
    } else if (percentChangeInstantaneous >= 10 && percentChangeInstantaneous <= 20) {
      score += 4;
    } else {
      score += 5;
    }

    const percentChangeAvg = ((currentValue - averageValue) / averageValue) * 100;
    console.log(percentChangeInstantaneous + '--' + percentChangeAvg);
    console.log('Dataset Length; ', dataset.length);
    if (percentChangeAvg <= -20) {
      score += 1;
    } else if (percentChangeAvg <= -10) {
      score += 2;
    } else if (percentChangeAvg >= -10 && percentChangeAvg <= 10) {
      score += 3;
    } else if (percentChangeAvg >= 10 && percentChangeAvg <= 20) {
      score += 4;
    } else {
      score += 5;
    }

    return score;
  };


  const getImpactImage = (impactScore) => {
    switch (impactScore) {
      case 1:
      case 2:
        return 'green.png';
      case 3:
      case 4:
        return 'green2.png';
      case 5:
      case 6:
        return 'yellow.png';
      case 7:
      case 8:
        return 'orange.png';
      case 9:
      case 10:
        return 'red.png';
      default:
        return 'green.png';
    }
  };

  const getImpactDesc = (impactScore) => {
    switch (impactScore) {
      case 1:
      case 2:
        return 'Huge Decrease in Utilization';
      case 3:
      case 4:
        return 'Decreased Utilization';
      case 5:
      case 6:
        return 'No Significant Impact on Utilization';
      case 7:
      case 8:
        return 'Increased Utilization';
      case 9:
      case 10:
        return 'Huge Increase in Utilization';
      default:
        return 'No Significant Impact on Utilization';
    }
  };

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
          min: cpuYMin - cpuYMin / 50,
          max: cpuYMax + cpuYMax / 50,
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
          min: ramYMin - ramYMin / 50,
          max: ramYMax + ramYMax / 50,
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
      <h1 style={{ textAlign: 'center' }}>Resource Utilization</h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ marginLeft: '20px', width: '30%', textAlign: 'center' }}>
          <Paper style={{ padding: '10px', marginBottom: '20px', marginLeft: '5%', textAlign: 'center' }}>
            <h4>CPU Impact Score</h4>
            <h1 style={{ fontSize: '4em' }}>{cpuImpactScore}</h1>
            <p>{getImpactDesc(cpuImpactScore)}</p>
            <img src={getImpactImage(cpuImpactScore)} style={{ maxWidth: '50%', height: 'auto', margin: '0 auto', display: 'block' }} alt="CPU Impact" />
          </Paper>
          <Paper style={{ padding: '10px', marginBottom: '20px', marginLeft: '5%', textAlign: 'center' }}>
            <h4>RAM Impact Score</h4>
            <h1 style={{ fontSize: '4em' }}>{ramImpactScore}</h1>
            <p>{getImpactDesc(ramImpactScore)}</p>
            <img src={getImpactImage(ramImpactScore)} style={{ maxWidth: '50%', height: 'auto', margin: '0 auto', display: 'block' }} alt="RAM Impact" />
          </Paper>
        </div>
        <div style={{ marginLeft: '20px', width: '60%', textAlign: 'center' }}>
          <Paper style={{ padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
            <h4>CPU Utilization</h4>
            <div style={{ display: 'inline-block', width: '100%' }}>
              <Line {...cpuChartConfig} />
            </div>
          </Paper>
          <Paper style={{ padding: '20px', textAlign: 'center' }}>
            <h4>RAM Utilization</h4>
            <div style={{ display: 'inline-block', width: '100%' }}>
              <Line {...ramChartConfig} />
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default UtilizationCharts;
