import React, { useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography'; // Import Typography for headings
import Cookies from 'js-cookie';
import { API_URL } from '../../../config';

function DeployHoneypots(props) {
    const [deviceIP, setDeviceIP] = useState('');
    const [honeypotType, setHoneypotType] = useState('');
    const [portsMapping, setPortsMapping] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ipAddresses, setIpAddresses] = useState([]);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleDeviceIPChange = (event) => {
        setDeviceIP(event.target.value);
    };

    const handleHoneypotTypeChange = (event) => {
        setHoneypotType(event.target.value);

        // Set the port mapping based on the selected honeypot type
        switch (event.target.value) {
            case 'Cowrie':
                setPortsMapping('2222 : 2222, 23 : 2223');
                break;
            case 'Dionaea':
                setPortsMapping('21:21, 23:23, 42:42, 135:135, 445:445, 1433:1433, 1723:1723, 1883:1883, 3306:3306, 5060:5060, 11211:11211, 27017:27017');
                break;
            case 'Conpot':
                setPortsMapping('80:8800, 102:10201, 502:5020, 21:2121, 44818:44818');
                break;
            case 'Elasticpot':
                setPortsMapping('9200:9200');
                break;
            default:
                setPortsMapping('');
        }
    };

    const fetchIpAddresses = async () => {
        try {
            // Replace with your actual API endpoint
            const url = `${API_URL}/api/getMoreNodes?authToken=${encodeURIComponent(
                Cookies.get('jwtToken')
            )}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setIpAddresses(data);
        } catch (error) {
            console.error('Error fetching IP addresses:', error.message);
        }
    };

    useEffect(() => {
        // Fetch IP addresses when the component mounts
        fetchIpAddresses();
    }, []);

    const handleDeployHoneypot = async () => {
        // Perform validation
        if (!deviceIP || !honeypotType) {
            alert('Please select both Device IP Address and Honeypot Type.');
            return;
        }

        // Disable the button and show the loading spinner
        setIsLoading(true);

        // Define the API endpoint URL for your backend API
        const apiEndpoint = `${API_URL}/honeypot-api/deployHoneyPot?authToken=${encodeURIComponent(
            Cookies.get('jwtToken')
        )}&honeypotTarget=${encodeURIComponent(deviceIP)}&honeypotType=${encodeURIComponent(
            honeypotType
        )}`;

        try {
            // Make the API call to deploy the honeypot using fetch
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Check if the API call was successful
            if (response.ok) {
                // Set the success message
                // Inside the handleDeployHoneypot function, after setting the success message and opening the modal
                setSuccessMessage('Honeypot deployed successfully!');
                setIsSuccessModalOpen(true);

                // Close the success modal after 5 seconds and change the active tab to "Deployed HoneyPots"
                setTimeout(() => {
                    setIsSuccessModalOpen(false);
                    props.setActiveTab('Deployed HoneyPots'); // Change the active tab to "Deployed HoneyPots"
                }, 5000);

            } else if (response.status === 400) {
                // Handle the case where the honeypot already exists
                setErrorMessage('The honeypot already exists on the selected IP Address.');
                setIsErrorModalOpen(true);
            } else {
                // Handle other API errors
                alert('Failed to deploy honeypot. Please try again later.');
            }
        } catch (error) {
            // Handle network or API call error
            console.error('Error deploying honeypot:', error);
            alert('Failed to deploy honeypot. Please try again later.');
        } finally {
            // Re-enable the button and hide the loading spinner
            setIsLoading(false);
        }
    };

    return (
        <div className="deploy-honeypots-content">
            <Typography variant="h6" component="div" gutterBottom>
                Deploy New Honeypot
            </Typography>
            <Dialog open={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
                <DialogTitle>Success</DialogTitle>
                <DialogContent>{successMessage}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsSuccessModalOpen(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>{errorMessage}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsErrorModalOpen(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <FormControl fullWidth>
                <InputLabel htmlFor="deviceIP">Device IP Address</InputLabel>
                <Select
                    value={deviceIP}
                    onChange={handleDeviceIPChange}
                    label="Device IP Address"
                    id="deviceIP"
                >
                    {ipAddresses.map((address) => (
                        <MenuItem key={address.nodeIP} value={address.nodeIP}>
                            {address.nodeIP} ({address.nodeName})
                        </MenuItem>
                    ))}
                </Select>
                <br />
            </FormControl>
            <br />
            <FormControl fullWidth>
                <InputLabel htmlFor="honeypotType">Honeypot Type</InputLabel>
                <Select
                    value={honeypotType}
                    onChange={handleHoneypotTypeChange}
                    label="Honeypot Type"
                    id="honeypotType"
                >
                    <MenuItem value="Cowrie">Cowrie</MenuItem>
                    <MenuItem value="Dionaea">Dionaea</MenuItem>
                    <MenuItem value="Conpot">Conpot</MenuItem>
                    <MenuItem value="Elasticpot">Elasticpot</MenuItem>
                </Select>
                <br />
            </FormControl>
            <br />
            <TextField
                id="portsMapping"
                label="Trap Port Mapping"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={portsMapping}
                disabled
            />
            <br />
            <br />
            <Button
                variant="contained"
                color="primary"
                onClick={handleDeployHoneypot}
                disabled={isLoading}
            >
                {isLoading ? <CircularProgress color="inherit" size={20} /> : 'Deploy Honeypot'}
            </Button>
        </div>
    );
}

export default DeployHoneypots;
