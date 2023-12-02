import React, { useState, useEffect } from 'react';
import './HoneypotDashboard.css'; // Import the CSS file for HoneypotDashboard
import Typography from '@mui/material/Typography'; // Import Typography for headings
import DeployedHoneypots from './DeployedHoneypots';
import DeployHoneypots from './DeployHoneypots';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

function HoneypotDashboard() {
  const [activeTab, setActiveTab] = useState('Deployed HoneyPots');

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="honeypotDashboard"> {/* Use the class name 'honeypotDashboard' */}
      <Typography variant="h4" component="div" gutterBottom>
        Honeypot Dashboard
      </Typography>
      <br />
      <div className="tabs">
        <button
          className={activeTab === 'Deployed HoneyPots' ? 'tab-button active' : 'tab-button'}
          onClick={() => handleTabChange('Deployed HoneyPots')}
        >
          Deployed HoneyPots
        </button>
        <button
          className={activeTab === 'Deploy HoneyPots' ? 'tab-button active' : 'tab-button'}
          onClick={() => handleTabChange('Deploy HoneyPots')}
        >
          Deploy HoneyPots
        </button>
      </div>

      <br />

      <div className="tab-content">
        {activeTab === 'Deploy HoneyPots' && (
          <DeployHoneypots setActiveTab={setActiveTab} />
        )}

        {activeTab === 'Deployed HoneyPots' && (
          <DeployedHoneypots />
        )}
      </div>
      <Box mt={8}>
        <Typography variant="body2" color="text.secondary" align="center">
          {/* {'Copyright © '} */}
          Powered by&nbsp;
          <Link color="inherit" href="https://communityhoneynetwork.readthedocs.io/en/stable/">
            CommunityHoneyNet (CHN)
          </Link>{' '}
          {'.'}
        </Typography>
      </Box>
    </div>
  );
}

export default HoneypotDashboard;
