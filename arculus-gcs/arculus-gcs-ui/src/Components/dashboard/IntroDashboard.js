import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function IntroDashboard() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 2 }}>
            <Paper sx={{ maxWidth: '70%', marginBottom: 4, padding: 2 }}>
                <img src="/arculus.png" alt="Arculus" style={{ width: '100%', height: 'auto', display: 'block', margin: 'auto' }} />
            </Paper>
            <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 2 }}>
                <b>About Arculus</b>
            </Typography>
            <Typography sx={{ textAlign: 'justify', maxWidth: '70%' }}>
                <b>Arculus</b> is a cutting-edge project being developed by the <b>Cyber Education, Research and Infrastructure (CERI) Center at the University of Missouri - Columbia</b>. It represents a significant advancement in cyber security solutions, focusing on a <b>Low Overhead Zero Trust Solution in a Tactical Edge Network setting</b>. Key features of Arculus include <b>Microsegmentation and Active Defense using Honeypots</b>. The Microsegmentation approach effectively prevents lateral movement of threat agents across network segments. Moreover, the solution employs <b>Dynamic Policy Enforcement coupled with Just In Time Access</b> controls to safeguard against unauthorized privilege escalation. At its core, Arculus utilizes a robust, multi-layered authentication mechanism, ensuring precise and granular allocation of privileges to fortify network defenses.
            </Typography>
        </Box>
    );
}

export default IntroDashboard;