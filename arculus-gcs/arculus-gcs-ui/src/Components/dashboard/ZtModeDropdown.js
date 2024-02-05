import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import Cookies from 'js-cookie';

const ZtModeDropdown = ({ currentMode }) => {
    const [mode, setMode] = useState(currentMode);
    const authToken = Cookies.get('jwtToken');

    const handleChange = (newMode) => {
        setMode(newMode);
        currentMode = newMode;
        // Update the mode on the server with a PUT request
        fetch(`${API_URL}/api/setZtMode?mode=${newMode}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ authToken: authToken }), // Update with the actual API endpoint and payload
        })
            .then((response) => {
                if (!response.ok) {
                    console.error('Error updating mode on the server');
                }
            })
            .catch((error) => {
                console.error('Error updating mode on the server:', error);
            });
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <label htmlFor="ztMode" style={{ marginRight: '10px', marginBottom: '16px' }}>Zero Trust Mode:</label>
            <select
                id="ztMode"
                value={mode}
                onChange={(e) => handleChange(e.target.value)}
            >
                <option value="no_zt">Do not enforce Zero Trust Security</option>
                <option value="full_zt">Enforce Full Zero Trust Security</option>
                <option value="risk_based_zt">Enforce Risk-based Zero Trust Security</option>
            </select>
        </div>
    );

};

export default ZtModeDropdown;
