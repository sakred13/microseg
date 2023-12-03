import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Cookies from 'js-cookie';
import Button from '@mui/material/Button';
import { API_URL } from '../../../config';

function DeployedHoneypots() {
  const [deployedHoneypots, setDeployedHoneypots] = useState([]);
  const [isDeployedHoneypotsLoading, setIsDeployedHoneypotsLoading] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedHoneypot, setSelectedHoneypot] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isUndeploying, setIsUndeploying] = useState(false);

  const fetchDeployedHoneypots = async () => {
    setIsDeployedHoneypotsLoading(true);

    try {
      const apiEndpoint = `${API_URL}/honeypot-api/getDeployedHoneypots?authToken=${encodeURIComponent(
        Cookies.get('jwtToken')
      )}`;

      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDeployedHoneypots(data.deployedHoneypots);
      } else {
        console.error('Failed to fetch deployed honeypots.');
      }
    } catch (error) {
      console.error('Error fetching deployed honeypots:', error);
    } finally {
      setIsDeployedHoneypotsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployedHoneypots();
  }, []);

  const handleUndeploy = async () => {
    setIsUndeploying(true);

    try {
      const apiEndpoint = `${API_URL}/honeypot-api/undeployHoneypot?honeypotType=${selectedHoneypot.honeypotType}&honeypotTarget=${selectedHoneypot.honeypotTarget}&authToken=${Cookies.get('jwtToken')}`;
      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccessMessage('Honeypot undeployed successfully.');
        setConfirmationOpen(false);
        fetchDeployedHoneypots();
      } else {
        console.error('Failed to undeploy honeypot.');
      }
    } catch (error) {
      console.error('Error undeploying honeypot:', error);
    }
    finally {
      setIsUndeploying(false); // Set the flag back to false when done
    }
  };

  return (
    <div className="deployed-honeypots-content">
      <Typography variant="h6" component="div" gutterBottom>
        Deployed Honeypots
      </Typography>
      {isDeployedHoneypotsLoading ? (
        <CircularProgress />
      ) : (
        <>
          {deployedHoneypots.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <img src="/bee.png" alt="Bee" width="200" height="200" />
              <Typography variant="h4" color="textSecondary">
                No Honeypots Deployed Yet!
              </Typography>
            </div>
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
                        <IconButton
                          color="error"
                          aria-label="Destroy Honeypot"
                          onClick={() => {
                            setSelectedHoneypot(honeypot);
                            setConfirmationOpen(true);
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      <Dialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Undeploy</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to undeploy the honeypot '{selectedHoneypot?.honeypotType}' on IP '{selectedHoneypot?.honeypotTarget}'?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmationOpen(false)}
            color="primary"
            disabled={isUndeploying} // Disable the "No" button while undeploying
          >
            No
          </Button>
          <Button
            onClick={handleUndeploy}
            color="primary"
            autoFocus
            disabled={isUndeploying} // Disable the "Yes" button while undeploying
          >
            Yes
          </Button>
          {isUndeploying && <CircularProgress size={24} />} {/* Show spinner while undeploying */}
        </DialogActions>
      </Dialog>

      {successMessage && (
        <div className="success-message">
          <Typography variant="body1" color="primary">
            {successMessage}
          </Typography>
        </div>
      )}
    </div>
  );
}

export default DeployedHoneypots;
