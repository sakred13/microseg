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
    const [sourceDevice, setSourceDevice] = useState('');
    const [destinationDevice, setDestinationDevice] = useState('');
    const [additionalIngressSets, setAdditionalIngressSets] = useState([]);
    const [additionalEgressSets, setAdditionalEgressSets] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarColor, setSnackbarColor] = useState('success');
    const [generateButtonDisabled, setGenerateButtonDisabled] = useState(false);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch(`${API_URL}/device/getTrustedDevices?authToken=${authToken}`);
                const data = await response.json();
                setDevices(data);
                setSourceDevice(data[0]?.device_name || '');
                setDestinationDevice(data[1]?.device_name || '');
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        };
        fetchDevices();
    }, [authToken]);

    const handleGeneratePolicy = async () => {
        try {
            setGenerateButtonDisabled(true);
            // API call to generate policy
            const response = await fetch(`${API_URL}/policy/addNetworkPolicy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    authToken: authToken,
                    srcPod: sourceDevice,
                    destPod: destinationDevice,
                    ingress: additionalIngressSets.map((set) => `${set.port}/${set.protocol}`),
                    egress: additionalEgressSets.map((set) => `${set.port}/${set.protocol}`),
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
            setTimeout(() => window.location.reload(), 5000);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleAddIngressSet = () => {
        setAdditionalIngressSets([...additionalIngressSets, { protocol: 'TCP', port: '' }]);
    };

    const handleRemoveIngressSet = (index) => {
        const updatedSets = additionalIngressSets.filter((_, i) => i !== index);
        setAdditionalIngressSets(updatedSets);
    };

    const handleAddEgressSet = () => {
        setAdditionalEgressSets([...additionalEgressSets, { protocol: 'TCP', port: '' }]);
    };

    const handleRemoveEgressSet = (index) => {
        const updatedSets = additionalEgressSets.filter((_, i) => i !== index);
        setAdditionalEgressSets(updatedSets);
    };

    const handleProtocolChange = (index, value, type) => {
        const updatedSets = type === 'ingress' ? [...additionalIngressSets] : [...additionalEgressSets];
        updatedSets[index].protocol = value;
        type === 'ingress' ? setAdditionalIngressSets(updatedSets) : setAdditionalEgressSets(updatedSets);
    };

    const handlePortChange = (index, value, type) => {
        const updatedSets = type === 'ingress' ? [...additionalIngressSets] : [...additionalEgressSets];
        updatedSets[index].port = value;
        type === 'ingress' ? setAdditionalIngressSets(updatedSets) : setAdditionalEgressSets(updatedSets);
    };

    const handleSetValidation = () => {
        const isValidIngress = additionalIngressSets.length > 0 ? additionalIngressSets.every((set) => set.protocol && set.port) : false;
        const isValidEgress = additionalEgressSets.length > 0 ? additionalEgressSets.every((set) => set.protocol && set.port) : false;
        setGenerateButtonDisabled(!(isValidIngress && isValidEgress));
    };    

    useEffect(() => {
        handleSetValidation();
    }, [additionalIngressSets, additionalEgressSets]);

    return (
        <div style={{ maxWidth: "50%", margin: "0 auto" }}>
            <Typography variant="h4" component="div" gutterBottom>
                Create Network Policy
            </Typography>
            <Paper style={{ padding: '20px' }}>
                <FormControl variant="outlined" style={{ minWidth: '200px', margin: '10px' }}>
                    <InputLabel id="source-device-label">Source Device</InputLabel>
                    <Select
                        labelId="source-device-label"
                        id="source-device-select"
                        value={sourceDevice}
                        onChange={(e) => setSourceDevice(e.target.value)}
                        label="Source Device"
                    >
                        {devices.map((device) => (
                            <MenuItem key={device.device_id} value={device.device_name}>
                                {device.device_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl variant="outlined" style={{ minWidth: '200px', margin: '10px' }}>
                    <InputLabel id="destination-device-label">Destination Device</InputLabel>
                    <Select
                        labelId="destination-device-label"
                        id="destination-device-select"
                        value={destinationDevice}
                        onChange={(e) => setDestinationDevice(e.target.value)}
                        label="Destination Device"
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
                                <InputLabel id={`protocol-label-${index}`}>Protocol</InputLabel>
                                <Select
                                    labelId={`protocol-label-${index}`}
                                    id={`protocol-select-${index}`}
                                    value={set.protocol}
                                    onChange={(e) => handleProtocolChange(index, e.target.value, 'ingress')}
                                    label="Protocol"
                                >
                                    <MenuItem value="TCP">TCP</MenuItem>
                                    <MenuItem value="UDP">UDP</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                id={`port-input-${index}`}
                                label="Port"
                                variant="outlined"
                                type="number"
                                value={set.port}
                                onChange={(e) => handlePortChange(index, e.target.value, 'ingress')}
                                style={{ margin: '10px' }}
                            />
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
                                <InputLabel id={`egress-protocol-label-${index}`}>Protocol</InputLabel>
                                <Select
                                    labelId={`egress-protocol-label-${index}`}
                                    id={`egress-protocol-select-${index}`}
                                    value={set.protocol}
                                    onChange={(e) => handleProtocolChange(index, e.target.value, 'egress')}
                                    label="Protocol"
                                >
                                    <MenuItem value="TCP">TCP</MenuItem>
                                    <MenuItem value="UDP">UDP</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                id={`egress-port-input-${index}`}
                                label="Port"
                                variant="outlined"
                                type="number"
                                value={set.port}
                                onChange={(e) => handlePortChange(index, e.target.value, 'egress')}
                                style={{ margin: '10px' }}
                            />
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
