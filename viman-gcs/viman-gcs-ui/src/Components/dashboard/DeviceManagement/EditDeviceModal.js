import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Autocomplete, Chip } from '@mui/material';
import Cookies from 'js-cookie';

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

const EditDeviceModal = ({ isOpen, setIsOpen, deviceDetails, allowedTasks }) => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [ipAddress, setIPAddress] = useState('');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (deviceDetails) {
            setDeviceName(deviceDetails.device_name || '');
            setIPAddress(deviceDetails.ip_address || '');
            setSelectedTasks(deviceDetails.allowedTasks || []);
        }
    }, [deviceDetails]);

    const handleEditDevice = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        setIsLoading(true);

        const authToken = Cookies.get('jwtToken');

        try {
            const response = await fetch('http://localhost:3001/api/updateTrustedDevice', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    authToken,
                    deviceName,
                    ipAddress,
                    currentName: deviceDetails.device_name,
                    tasks: selectedTasks,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            setIsSuccess(true);

            setTimeout(() => {
                setIsSuccess(false);
                setIsOpen(false);
                // onEdit();
            }, 3000);
        } catch (error) {
            console.error('Error editing trusted device:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setDeviceName('');
        setIPAddress('');
        setSelectedTasks([]);
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
                            Edit Trusted Device
                        </Typography>
                        {!isSuccess && (
                            <Box component="form" noValidate onSubmit={handleEditDevice} sx={{ mt: 3 }}>
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
                                            error={!deviceName} // Set error prop based on whether deviceName is empty
                                            helperText={!deviceName ? 'Device Name is required' : ''}
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
                                            error={!ipAddress} // Set error prop based on whether ipAddress is empty
                                            helperText={!ipAddress ? 'IP Address is required' : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            multiple
                                            id="allowed-tasks"
                                            options={allowedTasks.taskNames}
                                            value={selectedTasks}
                                            onChange={(_, newValue) => setSelectedTasks(newValue)}
                                            isOptionEqualToValue={(option, value) => option === value}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip key={index} label={option} {...getTagProps({ index })} />
                                                ))
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    label="Allowed Tasks"
                                                    fullWidth
                                                    error={selectedTasks.length === 0} // Set error prop based on whether selectedTasks is empty
                                                    helperText={selectedTasks.length === 0 ? 'Allowed Tasks are required' : ''}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Updating...' : 'Update Trusted Device'}
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
                                    Device Updated!
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Container>
            </Box>
        </Modal>
    );
};

export default EditDeviceModal;
