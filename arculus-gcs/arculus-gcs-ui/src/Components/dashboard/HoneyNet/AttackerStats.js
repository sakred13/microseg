import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
import { Box, Typography, List, ListItem, Paper, Grid, Avatar } from '@mui/material';

function AttackerStats(props) {
    const [attackerData, setAttackerData] = useState(null);
    const [ipLocationData, setIpLocationData] = useState(null);
    const [hoursAgo, setHoursAgo] = useState(24);

    useEffect(() => {
        const fetchAttackerStats = async () => {
            try {
                const response = await fetch(`${API_URL}/honeypot-proxy/api/attacker_stats/${props.attackerIp}?authToken=${encodeURIComponent(
                    Cookies.get('jwtToken')
                )}&hours_ago=${hoursAgo}`);

                if (response.ok) {
                    const data = await response.json();
                    setAttackerData(data.data);

                    // Fetch attacker location data
                    const locationResponse = await fetch(`https://api.iplocation.net/?ip=${props.attackerIp}`);
                    if (locationResponse.ok) {
                        const locationData = await locationResponse.json();
                        setIpLocationData(locationData);
                    }
                } else {
                    console.error('Failed to fetch attacker stats');
                }
            } catch (error) {
                console.error('Error fetching attacker stats:', error);
            }
        };

        fetchAttackerStats();
    }, [props.attackerIp, hoursAgo]);

    if (!attackerData || !ipLocationData) {
        return <Typography>Loading...</Typography>;
    }

    const flagImagePath = `/flags/${ipLocationData.country_code2.toLowerCase()}.png`;

    return (
        <Box sx={{ marginX: '10%', width: '80%' }}>
            <Paper sx={{ padding: 2, margin: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Attacker IP: {props.attackerIp}</Typography>
                        <Typography variant="body1"><b>Attacker Location:</b> {ipLocationData.country_name}                                                         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src={flagImagePath} alt="Flag" width="24" height="16" />
                        </div></Typography>
                        <Typography variant="body1"><b>IP Number:</b> {ipLocationData.ip_number}</Typography>
                        <Typography variant="body1"><b>ISP:</b> {ipLocationData.isp}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}> 
                        <Typography variant="subtitle1"><b>Honey Pots</b></Typography>
                        <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {attackerData.honeypots.map((honeypot, index) => (
                                <ListItem key={index} sx={{ textAlign: 'center', width: 'auto', justifyContent: 'center' }}>
                                    - {honeypot}
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1"><b>Total Attack Count:</b> {attackerData.count}</Typography>
                        <Typography variant="body1"><b>First Attack Timestamp:</b> {attackerData.first_seen}</Typography>
                        <Typography variant="body1"><b>Most Recent Attack Timestamp:</b> {attackerData.last_seen}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1"><b>Ports</b></Typography>
                        <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {attackerData.ports.map((port, index) => (
                                <ListItem key={index} sx={{ textAlign: 'center', width: 'auto', justifyContent: 'center' }}>
                                    - {port}
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1"><b>Number of Honeypots Encountered:</b> {attackerData.num_sensors}</Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

export default AttackerStats;
