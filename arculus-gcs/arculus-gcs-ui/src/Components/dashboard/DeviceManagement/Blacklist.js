import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import Cookies from 'js-cookie';
import { API_URL } from '../../../config';

const Blacklist = () => {
  const [blacklistedIPs, setBlacklistedIPs] = useState([]);
  const [selectedIPs, setSelectedIPs] = useState([]);
  const [recordsToShow, setRecordsToShow] = useState(10);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state

  const fetchBlacklist = async () => {
    try {
      const response = await fetch(
        `${API_URL}/blacklistapi/getBlacklist?records=${recordsToShow}&authToken=${encodeURIComponent(
          Cookies.get('jwtToken')
        )}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Check if the 'blacklistedIPs' property exists and is an array
      if (data && Array.isArray(data.blacklistedIPs)) {
        setBlacklistedIPs(data.blacklistedIPs);
      } else {
        console.error('Invalid data format:', data);
      }
      setLoading(false); // Update loading state
    } catch (error) {
      console.error('Error fetching blacklisted IPs:', error.message);
      setLoading(false); // Update loading state in case of error
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, [recordsToShow]);

  const handleRemoveFromBlacklist = () => {
    setShowConfirmationDialog(true);
  };

  const handleConfirmRemove = async () => {
    try {
      const ipAddresses = selectedIPs.join(',');

      const response = await fetch(
        `${API_URL}/blacklistapi/removeFromBlacklist?authToken=${encodeURIComponent(
          Cookies.get('jwtToken')
        )}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json', // Set the Content-Type header
          },
          body: JSON.stringify({ ipAddresses }), // Stringify the body as JSON
        }
      );

      if (response.ok) {
        // Successfully removed from blacklist

        // Clear the selectedIPs array after successful removal
        setSelectedIPs([]);

        // Close the confirmation dialog
        setShowConfirmationDialog(false);

        // Refetch the blacklist after removal
        fetchBlacklist();
      } else {
        // Handle unsuccessful removal here
        console.error('Error removing from blacklist:', response.statusText);
        // You might want to show an error message to the user
      }
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
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      {loading && <div>Loading...</div>}
      {!loading && blacklistedIPs.length === 0 && (
        <div style={{ width: '50%', height: '50%', margin: 'auto' }}>
          <img src='blacklist_none.png' alt="No Blacklisted IP Addresses" style={{ width: '100%', height: '100%' }} />
        </div>
      )}
      {!loading && blacklistedIPs.length > 0 && (
        <div>
          <h1>Blacklisted IP Addresses</h1>
          <label>
            Records to Show:{' '}
            <input
              type="number"
              value={recordsToShow}
              onChange={(e) => setRecordsToShow(e.target.value)}
            />
          </label>

          <div style={{ marginTop: '20px', display: 'table', margin: 'auto' }}>
            {blacklistedIPs.map((ip) => (
              <div key={ip} style={{ display: 'table-row' }}>
                <Checkbox
                  checked={selectedIPs.includes(ip)}
                  onChange={() => handleCheckboxChange(ip)}
                />
                <div style={{ display: 'table-cell', padding: '8px' }}>{ip}</div>
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
      )}
    </div>
  );
};

export default Blacklist;
