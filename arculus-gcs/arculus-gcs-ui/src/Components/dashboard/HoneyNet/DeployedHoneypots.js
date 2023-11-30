import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography'; // Import Typography for headings
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import Cookies from 'js-cookie';
import { API_URL } from '../../../config';


function DeployedHoneypots() {
  const [deployedHoneypots, setDeployedHoneypots] = useState([]); // Store deployed honeypots data
  const [isDeployedHoneypotsLoading, setIsDeployedHoneypotsLoading] = useState(false);

  const fetchDeployedHoneypots = async () => {
    setIsDeployedHoneypotsLoading(true);

    try {
      // Define the API endpoint URL for deployed honeypots
      const apiEndpoint = `${API_URL}/honeypot-api/getDeployedHoneypots?authToken=${encodeURIComponent(
        Cookies.get('jwtToken')
      )}`;
      
      // Make the API call to get deployed honeypots using fetch
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if the API call was successful
      if (response.ok) {
        const data = await response.json();
        setDeployedHoneypots(data.deployedHoneypots);
      } else {
        // Handle API error
        console.error('Failed to fetch deployed honeypots.');
      }
    } catch (error) {
      // Handle network or API call error
      console.error('Error fetching deployed honeypots:', error);
    } finally {
      setIsDeployedHoneypotsLoading(false);
    }
  };


  useEffect(() => {
    // Fetch deployed honeypots when the component mounts
    fetchDeployedHoneypots();
  }, []);

  return (
    <div className="deployed-honeypots-content">
    <Typography variant="h6" component="div" gutterBottom>
      Deployed Honeypots
    </Typography>
    {isDeployedHoneypotsLoading ? (
      <CircularProgress />
    ) : (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>IP Address</b></TableCell>
              <TableCell><b>Honeypot Type</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deployedHoneypots.map((honeypot) => (
              <TableRow key={honeypot.honeypotTarget}>
                <TableCell>{honeypot.honeypotTarget}</TableCell>
                <TableCell>{honeypot.honeypotType}</TableCell>
                <TableCell>
                  <IconButton color="primary" aria-label="View Activity">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton color="error" aria-label="Destroy Honeypot">
                    <CloseIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </div>
  );
}

export default DeployedHoneypots;
