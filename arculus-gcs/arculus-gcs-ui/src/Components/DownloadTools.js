import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Updated import for MUI v5
import { API_URL, PRIVATE_IP } from '../config';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';


function DownloadTools() {
    const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');
    const [nodeName, setNodeName] = useState('');

    const handleNodeNameChange = (event) => {
        const updatedNodeName = event.target.value || '';
        setNodeName(updatedNodeName);
        setTextToCopy(generateDownloadScript(updatedNodeName));
    };

    const generateDownloadScript = (nodeName) => {
        return `curl -o joinClusterWizard.sh ${API_URL}/tools/downloadJoinWiz & \
    curl -o honeypotWiz.py ${API_URL}/tools/downloadHoneyWiz &
    wait
    chmod +x joinClusterWizard.sh
    chmod +x honeypotWiz.py
    ./joinClusterWizard.sh ${API_URL.replace('http://', '').replace(':3001', '')} ${PRIVATE_IP} ${nodeName}`;
    };

    const [textToCopy, setTextToCopy] = useState(generateDownloadScript(''));

    const handleCopyToClipboard = () => {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;

        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        setCopyButtonText('Copied to Clipboard');

        setTimeout(() => {
            setCopyButtonText('Copy to Clipboard');
        }, 3000);
    };

    const handleDownloadFile = (file, endpoint) => {
        // Fetch the file from the API
        fetch(`${API_URL}/tools/${endpoint}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then((blob) => {
                // Create a URL for the blob
                const url = window.URL.createObjectURL(blob);

                // Create a temporary <a> element to trigger the download
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = file;
                document.body.appendChild(a);

                // Trigger the click event to start the download
                a.click();

                // Clean up
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch((error) => {
                console.error('Error downloading file:', error);
            });
    };

    return (
        <ThemeProvider theme={createTheme()}>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                margin: '16px',
            }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    }}
                >
                    <img src="titled-logo.png" alt="Logo" style={{ width: '100px', height: '100px' }} />
                    <img src="CERI-Logo.png" alt="Logo" style={{ width: '317px', height: '100px', marginLeft: '16px' }} />
                </Box>

                <h1>Download both the Arculus Join Request Wizard and the Honeypot Wizard here.</h1>

                <Button
                    variant="contained"
                    color="primary"
                    style={{ margin: '16px' }}
                    startIcon={<FileDownloadIcon />}
                    onClick={() => {
                        handleDownloadFile('joinClusterWizard.sh', 'downloadJoinWiz');
                    }}
                >
                    Arculus Join Request Wizard
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ margin: '16px' }}
                    startIcon={<FileDownloadIcon />}
                    onClick={() => {
                        handleDownloadFile('honeypotWiz.py', 'downloadHoneyWiz');
                    }}
                >
                    Arculus Honeypot Wizard
                </Button>
                <p>Or pull the scripts through CLI to install.</p>
                <br />
                <TextField
                    style={{ width: '65%' }}
                    label="Enter the node name you want to join to the cluster with (Would not work without this):"
                    value={nodeName}
                    onChange={handleNodeNameChange}
                    variant="outlined"
                />
                <br />
                <TextField
                    style={{ width: '65%', overflowX: 'auto' }} // Added overflowX property
                    label="Join through CLI"
                    value={textToCopy}
                    variant="outlined"
                    disabled
                    multiline  // Enable multiline
                    rows={4}   // Set the number of rows
                    rowsMax={10} // Set the maximum number of rows before scrolling
                />

                <IconButton
                    style={{ marginTop: '16px' }}
                    onClick={handleCopyToClipboard}
                    color="primary"
                >
                    <FileCopyIcon />
                </IconButton>
                <p>{copyButtonText}</p>
            </div>
            <Box mt={8}>
                <Typography variant="body2" color="text.secondary" align="center">
                    {/* {'Copyright © '} */}
                    <Link color="inherit" href="https://engineering.missouri.edu/departments/eecs/">
                        EECS Dept., University of Missouri
                    </Link>{' '}
                    {new Date().getFullYear()}
                    {'.'}
                </Typography>
            </Box>
        </ThemeProvider>
    );
}

export default DownloadTools;
