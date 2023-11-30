import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
import { Box, Typography, List, ListItem, Paper } from '@mui/material';

function AttackerStats(props) {
    const [attackerData, setAttackerData] = useState(null);
    const [hoursAgo, setHoursAgo] = useState(24); // You can pass this as a prop or manage it here

    useEffect(() => {
        const fetchAttackerStats = async () => {
            try {
                const response = await fetch(`${API_URL}/honeypot-proxy/api/attacker_stats/${props.attackerIp}?authToken=${encodeURIComponent(
                    Cookies.get('jwtToken')
                )}&hours_ago=${hoursAgo}`);

                if (response.ok) {
                    const data = await response.json();
                    setAttackerData(data.data);
                } else {
                    console.error('Failed to fetch attacker stats');
                }
            } catch (error) {
                console.error('Error fetching attacker stats:', error);
            }
        };

        fetchAttackerStats();
    }, [props.attackerIp, hoursAgo]);

    if (!attackerData) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ marginX: '10%', width: '80%' }}>

            <Paper sx={{ padding: 2, margin: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Attacker IP: {props.attackerIp}</Typography>

                <Typography variant="subtitle1" sx={{ marginTop: 2 }}><b>Honey Pots</b></Typography>
                <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {attackerData.honeypots.map((honeypot, index) => (
                        <ListItem key={index} sx={{ textAlign: 'center', width: 'auto', justifyContent: 'center' }}>
                            - {honeypot}
                        </ListItem>
                    ))}
                </List>


                <Typography><b>Total Attack Count: </b>{attackerData.count}</Typography>
                <br />
                <Typography><b>First Attack Timestamp: </b>{attackerData.first_seen}</Typography>
                <br />
                <Typography><b>Most Recent Attack Timestamp: </b>{attackerData.last_seen}</Typography>
                <br />
                <Typography variant="subtitle1" sx={{ marginTop: 2 }}><b>Ports</b></Typography>
                <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {attackerData.ports.map((port, index) => (
                        <ListItem key={index} sx={{ textAlign: 'center', width: 'auto', justifyContent: 'center' }}>
                            - {port}
                        </ListItem>
                    ))}
                </List>


                <Typography><b>Number of Honeypots Encountered: </b>{attackerData.num_sensors}</Typography>
            </Paper>
        </Box>
    );
}

export default AttackerStats;
