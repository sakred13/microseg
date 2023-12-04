import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, TextField } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    PieController
} from 'chart.js';
import { useDashboardContext } from './DashboardContext';

ChartJS.register(ArcElement, Tooltip, Legend, PieController);

function MainDashboard() {
    const [hoursAgo, setHoursAgo] = useState(24);
    const [attackData, setAttackData] = useState([]);
    const [topHoneypots, setTopHoneypots] = useState([]);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
    });
    const [attackerLocations, setAttackerLocations] = useState({});
    const { switchToAttackerStats } = useDashboardContext();

    useEffect(() => {
        const fetchAttackData = async () => {
            try {
                const response = await fetch(`${API_URL}/honeypot-proxy/api/top_attackers/?authToken=${encodeURIComponent(
                    Cookies.get('jwtToken')
                )}&hours_ago=${hoursAgo}`);
                if (response.ok) {
                    const data = await response.json();
                    setAttackData(data.data);

                    // Process data for top 5 honeypots
                    const honeypotCounts = data.data.reduce((acc, attack) => {
                        acc[attack.honeypot] = (acc[attack.honeypot] || 0) + attack.count;
                        return acc;
                    }, {});
                    const sortedHoneypots = Object.entries(honeypotCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);
                    setTopHoneypots(sortedHoneypots);

                    // Prepare data for the pie chart
                    const pieChartData = {
                        labels: data.data.map(attack => attack.source_ip).slice(0, 5),
                        datasets: [{
                            data: data.data.map(attack => attack.count).slice(0, 5),
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                        }]
                    };
                    setChartData(pieChartData);

                    // Fetch attacker locations
                    const attackerIps = data.data.map(attack => attack.source_ip).slice(0, 5);
                    const locations = await fetchAttackerLocations(attackerIps);
                    setAttackerLocations(locations);
                } else {
                    console.error('Failed to fetch attack data');
                }
            } catch (error) {
                console.error('Error fetching attack data:', error);
            }
        };

        // Function to fetch attacker locations
        const fetchAttackerLocations = async (ipAddresses) => {
            const locations = {};
            for (const ipAddress of ipAddresses) {
                try {
                    const response = await fetch(`https://api.iplocation.net/?ip=${ipAddress}`);
                    if (response.ok) {
                        const locationData = await response.json();
                        locations[ipAddress] = locationData.country_code2.toLowerCase();
                    }
                } catch (error) {
                    console.error(`Error fetching location for IP ${ipAddress}:`, error);
                }
            }
            return locations;
        };

        fetchAttackData();
    }, [hoursAgo]);

    const handleHoursChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setHoursAgo(value);
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            {attackData.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <img src="/noAttackBee.png" alt="Bee" width="400" height="400" />
                    <Typography variant="h4" color="textSecondary">
                        No Attacks Yet!
                    </Typography>
                </div>
            ) : (
                <Grid container spacing={3}>
                    {/* Top Attacker IPs Table */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                            View Attack Details in the last
                            <TextField
                                type="number"
                                value={hoursAgo}
                                onChange={handleHoursChange}
                                inputProps={{ min: "1", step: "1" }}
                                sx={{
                                    width: '80px', // Adjust the width as desired
                                    marginLeft: 1,
                                    '& input': {
                                        padding: '5px', // Decrease padding to reduce height
                                        fontSize: '0.875rem' // Adjust font size if necessary
                                    }
                                }}
                            />

                            <span> hours</span><br />
                        </Typography>
                    </Grid>

                    {/* Conditional rendering based on attackData length */}
                    <React.Fragment>
                        {/* Rest of your content */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                                Top Attacker IPs
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table aria-label="Top 5 Attacker IPs">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>Honeypot</b></TableCell>
                                            <TableCell align="center"><b>Source IP</b></TableCell>
                                            <TableCell align="center"><b>Attacks</b></TableCell>
                                            <TableCell align="center"><b>Location</b></TableCell> {/* New column for location */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {attackData.slice(0, 5).map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell component="th" scope="row">
                                                    {row.honeypot}
                                                </TableCell>
                                                <TableCell align="center" onClick={() => switchToAttackerStats(row.source_ip)} style={{ cursor: 'pointer' }}>
                                                    {row.source_ip}
                                                </TableCell>
                                                <TableCell align="center">{row.count}</TableCell>
                                                <TableCell align="center">
                                                    {attackerLocations[row.source_ip] && (
                                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                            <img src={`flags/${attackerLocations[row.source_ip]}.png`} alt="Flag" width="24" height="16" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item xs={8} md={4}>
                            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                                Attack Shares
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Pie data={chartData} />
                            </Box>
                        </Grid>
                        <Grid item xs={16} md={6}>
                            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                                Top Honeypots Attacked
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table aria-label="Top 5 Honeypots">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>Honeypot</b></TableCell>
                                            <TableCell align="right"><b>Total Attacks</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {topHoneypots.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell component="th" scope="row">
                                                    {row[0]}
                                                </TableCell>
                                                <TableCell align="right">{row[1]}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </React.Fragment>

                </Grid>)}
        </Box>
    );
}

export default MainDashboard;
