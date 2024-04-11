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
    const [honeypotDescription, setHoneypotDescription] = useState('');

    const handleDeviceIPChange = (event) => {
        setDeviceIP(event.target.value);
    };

    const handleHoneypotTypeChange = (event) => {
        setHoneypotType(event.target.value);

        // Set the port mapping and honeypot description based on the selected honeypot type
        switch (event.target.value) {
            case 'Cowrie':
                setPortsMapping('2222 : 2222, 23 : 2223');
                setHoneypotDescription('Attacker Intensity: Moderate\nCowrie primarily attracts and analyzes brute force attacks and shell interactions targeting SSH and Telnet services. It captures login attempts, executed commands, and file uploads. Attacks are focused on gaining unauthorized access and performing malicious actions on the emulated services.\nBehavior Strategy: Passive\nCowrie logs attacker interactions without actively deceiving them. It emulates vulnerable SSH and Telnet services to entice attackers. \nDeception Level: Low\nCowrie\'s deception level is relatively low as it relies on the attractiveness of the emulated services without actively misleading attackers.');
                break;
            case 'Dionaea':
                setPortsMapping('21:21, 23:23, 42:42, 135:135, 445:445, 1433:1433, 1723:1723, 1883:1883, 3306:3306, 5060:5060, 11211:11211, 27017:27017');
                setHoneypotDescription('Attacker Intensity: High\nDionaea emulates vulnerable Windows environments and captures malware used for exploitation. It records various types of attacks, including malware samples and exploitation attempts. Attacks focus on compromising the system\'s security and exploiting vulnerabilities.\nBehavior Strategy: Active\nDionaea actively emulates vulnerable services to attract and capture attackers. It engages attackers by presenting opportunities for exploitation.\nDeception Level: Moderate\nDionaea\'s deception level is moderate as it actively presents enticing targets but does not actively interact with attackers beyond capturing data.');
                break;
            case 'Conpot':
                setPortsMapping('80:8800, 102:10201, 502:5020, 21:2121, 44818:44818');
                setHoneypotDescription('Attacker Intensity: High\nConpot emulates industrial control systems (ICS) and attracts attacks against critical infrastructure components. It logs interactions and attacks targeting ICS/SCADA services like Modbus and DNP3. Attacks can potentially disrupt critical infrastructure and affect functionality.\nBehavior Strategy: Active\nConpot actively emulates ICS/SCADA services to lure and capture attackers. It presents an enticing environment for attackers interested in critical infrastructure targets.\nDeception Level: High\nConpot\'s deception level is high as it actively simulates critical infrastructure components, effectively deceiving attackers into engaging with the emulated services.');
                break;
            case 'Elasticpot':
                setPortsMapping('9200:9200');
                setHoneypotDescription('Attacker Intensity: Low\nElasticPot emulates Elasticsearch instances to attract attacks. It captures activities such as queries and requests made to the emulated Elasticsearch service. Attacks are primarily focused on studying potential vulnerabilities in Elasticsearch.\nBehavior Strategy: Passive\nElasticPot passively emulates Elasticsearch to observe potential attacks. It does not actively engage attackers but monitors interactions.\nDeception Level: Low\nElasticPot\'s deception level is low as it relies on the attractiveness of the emulated Elasticsearch service without active interaction.');
                break;
            case 'ssh-auth-logger':
                setPortsMapping('2222:2222');
                setHoneypotDescription('Attacker Intensity: Low\nSSH-auth-logger is a low/zero interaction SSH authentication logging honeypot. It uses HMAC to hash destination IP addresses with unique keys for monitoring. Captured data includes service name, destination port and IP, attempted usernames, message level, and passwords used.\nBehavior Strategy: Passive\nSSH-auth-logger passively logs authentication attempts without active engagement.It monitors SSH authentication activities for analysis.\nDeception Level: Low\nSSH-auth-logger\'s deception level is low as it does not actively interact with attackers but rather logs authentication data.')
                break;
            default:
                setPortsMapping('');
                setHoneypotDescription('');
        }
    };

    const fetchIpAddresses = async () => {
        try {
            // Replace with your actual API endpoint
            const url = `${API_URL}/device/getMoreNodes?authToken=${encodeURIComponent(
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
                setSuccessMessage('Honeypot deployed successfully!');
                setIsSuccessModalOpen(true);

                // Close the success modal after 5 seconds and change the active tab to "Deployed HoneyPots"
                setTimeout(() => {
                    setIsSuccessModalOpen(false);
                    props.setActiveTab('Deployed HoneyPots');
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
                    <MenuItem value="ssh-auth-logger">ssh-auth-logger</MenuItem>
                </Select>
                <br />
            </FormControl>
            <br />
            <TextField
                id="honeypotDescription"
                label="Honeypot Description"
                variant="outlined"
                fullWidth
                multiline
                rows={6}
                value={honeypotDescription}
                InputProps={{
                    readOnly: true,
                    style: { color: 'black' },
                }}
            />
            <br />
            <br />
            <TextField
                id="portsMapping"
                label="Trap Port Mapping"
                variant="outlined"
                fullWidth
                multiline
                rows={2} // Reduce the height to two-thirds
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
