import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { API_URL } from '../../../config';

const AuthenticationModal = ({ open, email, onClose, onVerified, authToken }) => {
    const [step, setStep] = useState('sendEmail');
    const [otp, setOtp] = useState('');

    const sendVerificationEmail = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authToken: authToken }) // Make sure to use the correct authToken
        };

        fetch(`${API_URL}/auth/sendEmailForAuth`, requestOptions)
            .then(response => {
                if (response.ok) {
                    setStep('verifyOtp');
                } else {
                    // Handle errors if the request was not successful
                    console.error('Failed to send verification email');
                }
            })
            .catch(error => {
                // Handle errors from the fetch operation itself
                console.error('Error sending verification email:', error);
            });
    };

    const verifyOtp = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authToken: authToken, // Ensure this is dynamically retrieved and securely handled
                otp: otp
            })
        };

        fetch(`${API_URL}/auth/verifyOtp`, requestOptions)
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        onVerified();
                        onClose();
                    });
                } else {
                    response.json().then(data => {
                        // Handle non-200 HTTP responses
                        alert('Authentication Failed: ' + data.message);
                    });
                }
            })
            .catch(error => {
                // Handle network errors or other fetch errors
                console.error('Error verifying OTP:', error);
                alert('Failed to verify OTP due to an error.');
            });
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400, // Set a fixed width or use maxWidth for responsive design
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2, // Optional: adds rounded corners
            }}>
                {step === 'sendEmail' && (
                    <Box textAlign="center">
                        <Typography id="modal-title" sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Verify that it is you!
                        </Typography>
                        <Button onClick={sendVerificationEmail} sx={{ mt: 2 }}>
                            Send a verification email to {email}
                        </Button>
                    </Box>
                )}
                {step === 'verifyOtp' && (
                    <Box textAlign="center">
                        <Typography id="modal-description">Enter OTP to verify</Typography>
                        <TextField
                            fullWidth
                            label="OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                        <Button onClick={verifyOtp} sx={{ mt: 2 }}>Verify</Button>
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default AuthenticationModal;
