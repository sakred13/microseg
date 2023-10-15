import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Box, Divider } from '@mui/material';

const NoAccess = () => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            bgcolor="white"
            color="grey"
        >
            <Paper
                elevation={3}
                style={{
                    width: '50vw', // 70% of viewport width
                    height: '50vh', // 50% of viewport height
                    padding: '10%',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="h2" className="animate-top">
                    <code>Access Denied</code>
                </Typography>
                <Divider className="animate-left" style={{ margin: 'auto', width: '50%' }} />
                <Typography variant="h5" className="animate-right">
                    You are not authorized to view this page.
                </Typography>
                <Typography variant="h5" className="animate-zoom">
                    🚫🚫🚫🚫
                </Typography>
                <Typography variant="h6" className="animate-zoom">
                    <strong>Error Code</strong>: 403 Forbidden
                </Typography>
            </Paper>
        </Box>
    );
};

export default NoAccess;
