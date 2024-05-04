import React, { useState } from 'react';
import { Button, Typography, Box, Paper, Grid } from '@mui/material';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const ExecuteFromManifest = (props) => {
    const { handleTabChange, setDeviceName, setSelectedLocation } = props;
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [missionData, setMissionData] = useState(null);
    const [error, setError] = useState('');
    const [dataFromManifest, setDataFromManifest] = useState(null);
    const [loading, setLoading] = useState(false);  // State to handle loading

    const handleFileChange = (event) => {
        if (event.target.files[0]) {
            setFile(event.target.files[0]);
            setFileName(event.target.files[0].name);
            setMissionData(null);
            setError('');
        } else {
            // Reset if the file input is cleared
            setFile(null);
            setFileName('');
            setMissionData(null);
        }
    };

    const handleUploadFile = () => {
        const formData = new FormData();
        formData.append('uploadedFile', file);

        fetch(`${API_URL}/mission/uploadMissionManifest?authToken=${encodeURIComponent(Cookies.get('jwtToken'))}`, {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Bad File! Please choose an actual .mconf file.');
                }
            })
            .then(data => {
                try {
                    // Use data directly from the fetch response
                    let objectFromString = JSON.parse(data.mission_config);
                    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    objectFromString = JSON.stringify({ ...objectFromString, create_time: timestamp });
                    setDataFromManifest({ ...data, authToken: encodeURIComponent(Cookies.get('jwtToken')), mission_config: objectFromString });
                    data.mission_config = JSON.parse(data.mission_config);
                    setMissionData(data);
                } catch (e) {
                    console.error('Error parsing mission configuration:', e);
                    setError('Bad File! Please choose an actual .mconf file.');
                    setMissionData(null);
                }
            })
            .catch(error => {
                setError(error.message);
                setMissionData(null);
            });
    };

    const displayData = (obj) => {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                {Object.entries(obj).map(([key, value], index) => {
                    if (typeof value === 'object' && value !== null) {
                        return (
                            <div key={index}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>{key}:&nbsp;</Typography>
                                {displayData(value)} {/* Recursive call */}
                            </div>
                        );
                    } else {
                        return (
                            <Box key={index} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '140px', fontFamily: 'monospace' }}>{key}:&nbsp;</Typography>
                                    <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left' }}>
                                        {typeof value === 'string' && value.includes('.png') ? value.replace(/\//g, '').replace(/\.png/g, '') : String(value)}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    }
                })}
            </Box>
        );
    };


    const handleRemoveFile = () => {
        setFile(null);
        setFileName('');
        setMissionData(null);
        setError('');
    };

    const handleExecuteMissionClick = () => {
        setLoading(true); // Start loading indication
        const payload = dataFromManifest;
    
        fetch(`${API_URL}/mission/createMission`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to start mission');
            }
            return response.json();  // Parse JSON response to extract missionId
        })
        .then((data) => {
            if (data.missionId) {
                let config = missionData.mission_config;
                const { gcX, gcY, destX, destY, selections } = config;
                const controller = selections['Video-Analytic Route Planner (Ground Control)'];
                const supplyDrone = selections['Supply Delivery Drone'];
                const surveillanceDrone = selections['Video Collection Surveillance Drone'];
                const relayDrone = selections['Communication Relay Drone'];
    
                const secondaryPayload = {
                    gcX,
                    gcY,
                    destX,
                    destY,
                    controller,
                    supplyDrone,
                    surveillanceDrone,
                    relayDrone,
                    missionId: data.missionId
                };
    
                return fetch(`${API_URL}/mission/executeStealthyReconAndResupply`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(secondaryPayload),
                });
            } else {
                throw new Error('No mission ID returned');
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to execute stealthy recon and resupply mission');
            }
            return response.json();  // Optionally handle the response from the second API call
        })
        .then((finalData) => {
            // Assuming finalData contains necessary data or using values from earlier fetch
            const controller = missionData.mission_config.selections['Video-Analytic Route Planner (Ground Control)'];
            const location = missionData.mission_config.location;
    
            setDeviceName(controller);
            setSelectedLocation(location);
    
            // Delay the tab switch by 3 seconds
            setTimeout(() => {
                handleTabChange('Mission Execution');  // Switch to the desired tab
                setLoading(false); // Stop loading indication
            }, 3000);
        })
        .catch((error) => {
            console.error('Error in mission process:', error);
            setLoading(false); // Stop loading indication on error
        });
    };
    
    return (
        <Box sx={{ width: '100%', padding: 4 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>Upload Manifest File for Mission Execution</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', marginTop: 2 }}>
                    <input
                        accept=".mconf"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="raised-button-file">
                        <Button variant="contained" component="span">
                            {fileName ? 'Select a different manifest file' : 'Select Manifest File'}
                        </Button>
                    </label>
                    {fileName && (
                        <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, width: 'fit-content', maxWidth: '100%' }}>
                            {fileName}
                            <CloseIcon sx={{ cursor: 'pointer' }} onClick={handleRemoveFile} />
                        </Paper>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUploadFile}
                        disabled={!file}
                    >
                        Upload File
                    </Button>
                    {error && <Typography color="error" sx={{ marginTop: 1 }}>{error}</Typography>}
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 3 }}>
                <Paper elevation={3} sx={{ padding: 2, paddingX: '10%', width: 'auto' }}>
                    <Typography variant="h6">Mission Configuration:</Typography>
                    {missionData ? (
                        <Grid item xs={6}>
                            {missionData.mission_config ? displayData(missionData.mission_config) : <Typography>No mission data.</Typography>}
                            <Typography><b>Supervisor IDs:</b> {missionData.supervisors.join(', ')}</Typography>
                            <Typography><b>Viewer IDs:</b> {missionData.viewers.join(', ')}</Typography>
                        </Grid>
                    ) : (
                        <Typography>Waiting for file upload...</Typography>
                    )}
                </Paper>
            </Box>
            <Button
                variant="contained"
                color="success"
                sx={{ marginTop: 2 }}
                disabled={!missionData || loading}
                onClick={handleExecuteMissionClick}
            >
                {loading ? <HourglassEmptyIcon /> : null} Execute Mission
            </Button>
        </Box>
    );
};

export default ExecuteFromManifest;
