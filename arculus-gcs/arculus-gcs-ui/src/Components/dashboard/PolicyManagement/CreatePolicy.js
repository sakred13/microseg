import React, { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    IconButton,
    Snackbar,
    SnackbarContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { API_URL } from '../../../config';

const CreatePolicy = ({ authToken }) => {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [additionalIngressSets, setAdditionalIngressSets] = useState([]);
    const [additionalEgressSets, setAdditionalEgressSets] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarColor, setSnackbarColor] = useState('success');
    const [generateButtonDisabled, setGenerateButtonDisabled] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch(`${API_URL}/device/getTrustedDevices?authToken=${authToken}`);
                const data = await response.json();
                setDevices(data);
                setSelectedDevice(data[0]?.device_name || '');
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        };
        fetchDevices();
    }, [authToken]);

    const handleGeneratePolicy = async () => {
        try {
            // API call to generate policy
            const response = await fetch(`${API_URL}/policy/addNetworkPolicy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    authToken: authToken,
                    device: selectedDevice,
                    ingress: additionalIngressSets,
                    egress: additionalEgressSets,
                }),
            });
            if (response.ok) {
                setSnackbarMessage('Network Policy Generated Successfully');
                setSnackbarColor('success');
            } else {
                setSnackbarMessage('Network Policy Generation Failed');
                setSnackbarColor('error');
            }
        } catch (error) {
            console.error('Error generating network policy:', error);
            setSnackbarMessage('Network Policy Generation Failed');
            setSnackbarColor('error');
        } finally {
            setSnackbarOpen(true);
            setTimeout(() => setSnackbarOpen(false), 5000);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleAddIngressSet = () => {
        setAdditionalIngressSets([...additionalIngressSets, { device: '', port: '', protocol: 'TCP' }]);
    };

    const handleRemoveIngressSet = (index) => {
        const updatedSets = [...additionalIngressSets];
        updatedSets.splice(index, 1);
        setAdditionalIngressSets(updatedSets);
    };

    const handleAddEgressSet = () => {
        setAdditionalEgressSets([...additionalEgressSets, { device: '', port: '', protocol: 'TCP' }]);
    };

    const handleRemoveEgressSet = (index) => {
        const updatedSets = [...additionalEgressSets];
        updatedSets.splice(index, 1);
        setAdditionalEgressSets(updatedSets);
    };

    const handleDeviceChange = (value) => {
        setSelectedDevice(value);
    };

    useEffect(() => {
        setGenerateButtonDisabled(!(additionalIngressSets.length > 0 || additionalEgressSets.length > 0));
    }, [additionalIngressSets, additionalEgressSets]);

    return (
        <div style={{ maxWidth: "50%", margin: "0 auto" }}>
            <Typography variant="h4" component="div" gutterBottom>
                Create Network Policy
            </Typography>
            <Paper style={{ padding: '20px' }}>
                <FormControl variant="outlined" style={{ minWidth: '200px', margin: '10px' }}>
                    <InputLabel id="device-label">Device</InputLabel>
                    <Select
                        labelId="device-label"
                        id="device-select"
                        value={selectedDevice}
                        onChange={(e) => handleDeviceChange(e.target.value)}
                        label="Device"
                    >
                        {devices.map((device) => (
                            <MenuItem key={device.device_id} value={device.device_name}>
                                {device.device_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography variant="h6" component="div" gutterBottom style={{ marginTop: '20px' }}>
                    Ingress
                </Typography>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {additionalIngressSets.map((set, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <FormControl variant="outlined" style={{ minWidth: '120px', margin: '10px' }}>
                                <InputLabel id={`ingress-device-label-${index}`}>From Device</InputLabel>
                                <Select
                                    labelId={`ingress-device-label-${index}`}
                                    id={`ingress-device-select-${index}`}
                                    value={set.device}
                                    onChange={(e) => {
                                        const updatedSets = [...additionalIngressSets];
                                        updatedSets[index].device = e.target.value;
                                        setAdditionalIngressSets(updatedSets);
                                    }}
                                    label="From Device"
                                >
                                    {devices
                                        .filter((device) => device.device_name !== selectedDevice)
                                        .map((device) => (
                                            <MenuItem key={device.device_id} value={device.device_name}>
                                                {device.device_name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <TextField
                                id={`ingress-port-input-${index}`}
                                label="Port"
                                variant="outlined"
                                type="number"
                                value={set.port}
                                onChange={(e) => {
                                    const updatedSets = [...additionalIngressSets];
                                    updatedSets[index].port = e.target.value;
                                    setAdditionalIngressSets(updatedSets);
                                }}
                                style={{ margin: '10px' }}
                            />
                            <FormControl variant="outlined" style={{ minWidth: '120px', margin: '10px' }}>
                                <InputLabel id={`ingress-protocol-label-${index}`}>Protocol</InputLabel>
                                <Select
                                    labelId={`ingress-protocol-label-${index}`}
                                    id={`ingress-protocol-select-${index}`}
                                    value={set.protocol}
                                    onChange={(e) => {
                                        const updatedSets = [...additionalIngressSets];
                                        updatedSets[index].protocol = e.target.value;
                                        setAdditionalIngressSets(updatedSets);
                                    }}
                                    label="Protocol"
                                >
                                    <MenuItem value="TCP">TCP</MenuItem>
                                    <MenuItem value="UDP">UDP</MenuItem>
                                </Select>
                            </FormControl>
                            <IconButton aria-label="remove-set" onClick={() => handleRemoveIngressSet(index)}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                    ))}
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddIngressSet}
                    style={{ margin: '10px' }}
                >
                    Add Rule
                </Button>
                <Typography variant="h6" component="div" gutterBottom style={{ marginTop: '20px' }}>
                    Egress
                </Typography>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {additionalEgressSets.map((set, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <FormControl variant="outlined" style={{ minWidth: '120px', margin: '10px' }}>
                                <InputLabel id={`egress-device-label-${index}`}>To Device</InputLabel>
                                <Select
                                    labelId={`egress-device-label-${index}`}
                                    id={`egress-device-select-${index}`}
                                    value={set.device}
                                    onChange={(e) => {
                                        const updatedSets = [...additionalEgressSets];
                                        updatedSets[index].device = e.target.value;
                                        setAdditionalEgressSets(updatedSets);
                                    }}
                                    label="To Device"
                                >
                                    {devices
                                        .filter((device) => device.device_name !== selectedDevice)
                                        .map((device) => (
                                            <MenuItem key={device.device_id} value={device.device_name}>
                                                {device.device_name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <TextField
                                id={`egress-port-input-${index}`}
                                label="Port"
                                variant="outlined"
                                type="number"
                                value={set.port}
                                onChange={(e) => {
                                    const updatedSets = [...additionalEgressSets];
                                    updatedSets[index].port = e.target.value;
                                    setAdditionalEgressSets(updatedSets);
                                }}
                                style={{ margin: '10px' }}
                            />
                            <FormControl variant="outlined" style={{ minWidth: '120px', margin: '10px' }}>
                                <InputLabel id={`egress-protocol-label-${index}`}>Protocol</InputLabel>
                                <Select
                                    labelId={`egress-protocol-label-${index}`}
                                    id={`egress-protocol-select-${index}`}
                                    value={set.protocol}
                                    onChange={(e) => {
                                        const updatedSets = [...additionalEgressSets];
                                        updatedSets[index].protocol = e.target.value;
                                        setAdditionalEgressSets(updatedSets);
                                    }}
                                    label="Protocol"
                                >
                                    <MenuItem value="TCP">TCP</MenuItem>
                                    <MenuItem value="UDP">UDP</MenuItem>
                                </Select>
                            </FormControl>
                            <IconButton aria-label="remove-set" onClick={() => handleRemoveEgressSet(index)}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                    ))}
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddEgressSet}
                    style={{ margin: '10px' }}
                >
                    Add Rule
                </Button><br /><br /><br />
                <Button
                    variant="contained"
                    color="primary"
                    disabled={generateButtonDisabled}
                    onClick={handleGeneratePolicy}
                    style={{ margin: '10px' }}
                >
                    Generate Allow Policy
                </Button>
            </Paper>
            <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
                <SnackbarContent
                    style={{
                        backgroundColor: snackbarColor === 'success' ? '#4caf50' : '#f44336',
                        fontSize: '16px',
                        fontWeight: 'bold',
                    }}
                    message={
                        <span>
                            {snackbarColor === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                            &nbsp;{snackbarMessage}
                        </span>
                    }
                    action={
                        <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                />
            </Snackbar>
        </div>
    );
};

export default CreatePolicy;
