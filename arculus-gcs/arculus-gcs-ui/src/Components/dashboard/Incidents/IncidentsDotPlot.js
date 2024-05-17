import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { Typography, Box } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, ChartTooltip, Legend);

const IncidentsDotPlot = () => {
    const xAxisRange = {
        min: 0,
        max: 60,  // Range for X-axis
    };

    const yAxisRange = {
        min: 0,
        max: 8,   // Range for Y-axis
    };

    const data = {
        datasets: [
            {
                label: 'Grade A',
                data: [{ x: 5, y: 1 }, { x: 10, y: 2 }],
                backgroundColor: 'red',
                radius: 6,
            },
            {
                label: 'Grade B',
                data: [{ x: 15, y: 1 }, { x: 20, y: 2 }, { x: 24, y: 1 }, { x: 32, y: 1 }],
                backgroundColor: 'orange',
                radius: 6,
            },
            {
                label: 'Grade C',
                data: [{ x: 10, y: 1 }, { x: 10, y: 1 }],
                backgroundColor: 'yellow',
                radius: 6,
            },
            {
                label: 'Grade D',
                data: [{ x: 15, y: 2 }, { x: 20, y: 1 }],
                backgroundColor: 'green',
                radius: 6,
            }
        ],
    };

    const options = {
        scales: {
            x: {
                ...xAxisRange,
                type: 'linear',
                position: 'bottom',
                reverse: true,  // Invert the X-axis
                title: {
                    display: true,
                    text: 'Time (minutes ago)'
                }
            },
            y: {
                ...yAxisRange,
                type: 'linear',
                title: {
                    display: true,
                    text: 'Incidents'
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.x !== null) {
                            label += `${context.parsed.x} minutes ago`;
                        }
                        return label;
                    }
                }
            },
            legend: {
                display: false
            }
        },
        maintainAspectRatio: false,  // This will allow you to set height and width
    };

    return (
        <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Incident History
            </Typography>
            <Box sx={{ display: 'inline-block', width: '100%', height: 200 }}>
                <Scatter data={data} options={options} />
            </Box>
        </Box>
    );
};

export default IncidentsDotPlot;
