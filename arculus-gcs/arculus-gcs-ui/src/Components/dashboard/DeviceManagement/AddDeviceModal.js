import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Autocomplete, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Cookies from 'js-cookie';
import { API_URL } from '../../../config';

const customStyles = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '80%',
    maxHeight: '80%',
    width: 'auto',
    height: 'auto',
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto',
};

const successStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'green',
};

const deviceTypes = [
    "Video Capture Drone",
    "Video Analytic Controller",
    "Video Capture Rover",
    "Freight Drone",
    "Freight UGV",
    "Sensor-Integrated Drone",
    "Communication Relay Drone",
    "Communication Relay Rover"
];

const AddDeviceModal = ({ isOpen, setIsOpen, nodeName, nodeIP, allowedTasks: allowedFunctions }) => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [deviceName, setDeviceName] = useState(nodeName || '');
    const [ipAddress, setIPAddress] = useState(nodeIP || '');
    const [selectedDeviceType, setSelectedDeviceType] = useState('');
    const [selectedFunctions, setSelectedFunctions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasValueSelected, setHasValueSelected] = useState(false);
    const [ingressRules, setIngressRules] = useState('');
    const [egressRules, setEgressRules] = useState('');

    useEffect(() => {
        // Function to generate ingress and egress rules based on selected tasks
        const generateRules = () => {
        
            const sendFunctions = selectedFunctions.filter(task => task.startsWith('send_'));
            const receiveFunctions = selectedFunctions.filter(task => task.startsWith('receive_'));
            
            const ingressRulesArr = [];
            const egressRulesArr = [];
        
            if (sendFunctions.includes('send_video')) {
                egressRulesArr.push('5005/UDP');
            }
            if (sendFunctions.includes('send_posdata')) {
                egressRulesArr.push('5015/TCP');
            }
            if (sendFunctions.includes('send_command')) {
                egressRulesArr.push('5025/TCP');
            }
            if (sendFunctions.includes('send_sensordata')) {
                egressRulesArr.push('5035/TCP');
            }
        
            if (receiveFunctions.includes('receive_video')) {
                ingressRulesArr.push('5005/UDP');
            }
            if (receiveFunctions.includes('receive_posdata')) {
                ingressRulesArr.push('5015/TCP');
            }
            if (receiveFunctions.includes('receive_command')) {
                ingressRulesArr.push('5025/TCP');
            }
            if (receiveFunctions.includes('receive_sensordata')) {
                ingressRulesArr.push('5035/TCP');
            }
        
            setIngressRules(ingressRulesArr.join('\n'));
            setEgressRules(egressRulesArr.join('\n'));
        };
          

        generateRules();
    }, [selectedFunctions]);

    const handleAddDevice = async (e) => {
        e.preventDefault();

        if (!hasValueSelected) {
            return;
        }

        setIsLoading(true);

        const authToken = Cookies.get('jwtToken');

        try {
            const response = await fetch(`${API_URL}/device/addTrustedDevice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    authToken,
                    deviceName,
                    ipAddress,
                    deviceType: selectedDeviceType, // Include selected device type
                    tasks: selectedFunctions,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            setIsSuccess(true);

            setTimeout(() => {
                setIsSuccess(false);
                window.location.reload();
            }, 3000);
        } catch (error) {
            console.error('Error adding trusted device:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setDeviceName('');
        setIPAddress('');
        setSelectedDeviceType('');
        setSelectedFunctions([]);
        setIsOpen(false);
    };

    return (
        <Modal
            open={isOpen}
            onClose={() => {
                setIsSuccess(false);
                setIsOpen(false);
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={customStyles}>
                <Container component="main" maxWidth="xs">
                    <Box
                        sx={{
                            marginTop: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography component="h1" variant="h5">
                            Add Trusted Device
                        </Typography>
                        {!isSuccess && (
                            <Box component="form" noValidate onSubmit={handleAddDevice} sx={{ mt: 3 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            autoComplete="given-name"
                                            name="deviceName"
                                            required
                                            fullWidth
                                            id="deviceName"
                                            label="Device Name"
                                            autoFocus
                                            value={deviceName}
                                            onChange={(e) => setDeviceName(e.target.value)}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="ipAddress"
                                            label="IP Address"
                                            name="ipAddress"
                                            autoComplete="ip-address"
                                            value={ipAddress}
                                            onChange={(e) => setIPAddress(e.target.value)}
                                            disabled
                                        />
                                        <Typography variant="caption" color="textSecondary" gutterBottom>
                                            The device will be assigned a local IP address after setup and will no longer be referenced by the public IP address.
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth variant="outlined" required>
                                            <InputLabel htmlFor="deviceType">Device Type</InputLabel>
                                            <Select
                                                fullWidth
                                                value={selectedDeviceType}
                                                onChange={(e) => setSelectedDeviceType(e.target.value)}
                                                label="Device Type"
                                                inputProps={{
                                                    name: 'deviceType',
                                                    id: 'deviceType',
                                                }}
                                            >
                                                {deviceTypes.map((type, index) => (
                                                    <MenuItem key={index} value={type}>
                                                        {type}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            multiple
                                            id="allowed-tasks"
                                            options={allowedFunctions.taskNames}
                                            required
                                            value={selectedFunctions}
                                            onChange={(_, newValue) => {
                                                setHasValueSelected(newValue.length > 0);
                                                setSelectedFunctions(newValue);
                                            }}
                                            isOptionEqualToValue={(option, value) => option === value}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip key={index} label={option} {...getTagProps({ index })} />
                                                ))
                                            }
                                            renderInput={(params) => (
                                                <TextField {...params} variant="outlined" label="Allowed Operations" fullWidth />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="ingressRules"
                                            label="Possible Ingress Rules"
                                            name="ingressRules"
                                            multiline
                                            rows={4} // Adjust the number of rows as needed
                                            value={ingressRules}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="egressRules"
                                            label="Egress Rules"
                                            name="egressRules"
                                            multiline
                                            rows={4} // Adjust the number of rows as needed
                                            value={egressRules}
                                            disabled
                                        />
                                    </Grid>
                                </Grid>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    disabled={isLoading || !hasValueSelected}
                                >
                                    {isLoading ? 'Adding...' : 'Add Trusted Device'}
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="error"
                                    onClick={handleCancel}
                                    sx={{ mt: 1, mb: 2 }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        )}
                        {isSuccess && (
                            <Box sx={successStyles}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 120 }} />
                                <Typography variant="h4" color="inherit">
                                    Device Added!
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Container>
            </Box>
        </Modal>
    );
};

export default AddDeviceModal;
