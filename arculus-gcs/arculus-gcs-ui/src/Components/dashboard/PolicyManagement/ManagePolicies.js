import React, { useState, useEffect } from 'react';
import './../MissionPlanning/MissionPlanner.css';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
import ListPolicies from './ListPolicies';
import CreatePolicy from './CreatePolicy';

function ManagePolicies(props) {
    const [activeTab, setActiveTab] = useState('Policies');
    const authToken = encodeURIComponent(Cookies.get('jwtToken'));
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <div className="missionPlanner">
            <Typography variant="h4" component="div" gutterBottom>
                Network Policy Management Dashboard
            </Typography>
            <div className="tabs">
                <button
                    className={activeTab === 'Policies' ? 'tab-button active' : 'tab-button'}
                    onClick={() => handleTabChange('Policies')} // Fix: pass a callback function
                >
                    Active Network Policies
                </button>
                <button
                    className={activeTab === 'Create New Policy' ? 'tab-button active execute-button' : 'tab-button execute-button'}
                    onClick={() => setActiveTab('Create New Policy')} // Fix: pass a callback function
                >
                    New Network Policy
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'Policies' && (
                    <div>
                        <ListPolicies authToken={authToken}/>
                        <br />
                    </div>
                )}

                {activeTab === 'Create New Policy' && (
                    <><br></br>
                        <div>
                            <CreatePolicy authToken={authToken}/>
                        </div>
                    </>)}
            </div>
        </div>
    );
}

export default ManagePolicies;
