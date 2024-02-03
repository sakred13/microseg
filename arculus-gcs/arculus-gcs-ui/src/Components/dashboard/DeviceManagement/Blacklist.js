import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import { API_URL } from '../../../config';

const Blacklist = () => {
  const [blacklistedIPs, setBlacklistedIPs] = useState([]);
  const [selectedIPs, setSelectedIPs] = useState([]);
  const [recordsToShow, setRecordsToShow] = useState(10);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  useEffect(() => {
    const fetchBlacklist = async () => {
      try {
        const response = await fetch(
          `${API_URL}/getBlacklist?records=${recordsToShow}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setBlacklistedIPs(data);
      } catch (error) {
        console.error('Error fetching blacklisted IPs:', error.message);
      }
    };

    fetchBlacklist();
  }, [recordsToShow]);

  const handleRemoveFromBlacklist = () => {
    setShowConfirmationDialog(true);
  };

  const handleConfirmRemove = async () => {
    try {
      const ipAddresses = selectedIPs.join(',');
      const response = await fetch(
        `${API_URL}/removeFromBlacklist?ipAddresses=${encodeURIComponent(
          ipAddresses
        )}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Update the UI or perform additional actions as needed
      console.log('Successfully removed from blacklist');

      // Clear the selectedIPs array after successful removal
      setSelectedIPs([]);

      // Close the confirmation dialog
      setShowConfirmationDialog(false);
    } catch (error) {
      console.error('Error removing from blacklist:', error.message);
      // Handle errors or show an error message to the user
    }
  };

  const handleCancelRemove = () => {
    // Close the confirmation dialog
    setShowConfirmationDialog(false);
  };

  const handleCheckboxChange = (ip) => {
    const updatedSelectedIPs = selectedIPs.includes(ip)
      ? selectedIPs.filter((selectedIP) => selectedIP !== ip)
      : [...selectedIPs, ip];
    setSelectedIPs(updatedSelectedIPs);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div>
        <h2>Blacklisted IP Addresses</h2>
        <label>
          Records to Show:{' '}
          <input
            type="number"
            value={recordsToShow}
            onChange={(e) => setRecordsToShow(e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginTop: '20px' }}>
        {blacklistedIPs.map((ip) => (
          <div key={ip}>
            <Checkbox
              checked={selectedIPs.includes(ip)}
              onChange={() => handleCheckboxChange(ip)}
            />
            {ip}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleRemoveFromBlacklist}
          disabled={selectedIPs.length === 0}
        >
          Remove from Blacklist
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmationDialog}
        onClose={handleCancelRemove}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Removal from Blacklist
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove the selected IP addresses from the
            blacklist?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemove} color="secondary" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Blacklist;
