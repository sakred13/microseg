import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import IntelFeed from './IntelFeed';
import AttackerStats from './AttackerStats';
import './MetricsDashboard.css'; // Assuming you have a similar CSS file for styling
import MainDashboard from './MainDashboard';
import { useDashboardContext } from './DashboardContext';
import OpenInNewIcon from '@mui/icons-material/OpenInNew'; // Icon for external site
import { CHN_URL } from '../../../config';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

function MetricsDashboard() {
  const { activeTab, setActiveTab, attackerIp } = useDashboardContext();

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleNavigate = () => {
    window.open(CHN_URL, '_blank');
  };

  return (
    <div className="metricsDashboard">
      <Typography variant="h4" component="div" gutterBottom>
        Metrics Dashboard
      </Typography>
      <br />
      <div className="tabs">
        <button
          className={activeTab === 'Overview' ? 'tab-button active' : 'tab-button'}
          onClick={() => handleTabChange('Overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'Intel Feed' ? 'tab-button active' : 'tab-button'}
          onClick={() => handleTabChange('Intel Feed')}
        >
          Intel Feed
        </button>
        <button
          className={activeTab === 'Attacker Stats' ? 'tab-button active' : 'tab-button'}
        //   onClick={() => handleTabChange('Attacker Stats')}
        >
          Attacker Stats
        </button>
      </div>

      <br />

      <div className="tab-content">
        {activeTab === 'Overview' && <MainDashboard />}
        {activeTab === 'Intel Feed' && <IntelFeed />}
        {activeTab === 'Attacker Stats' && <AttackerStats attackerIp={attackerIp} />}
      </div>

      <div className="footer-text">
        <Typography variant="body1" component="div" gutterBottom>
          For more detailed insights, visit our <Button color="primary" onClick={handleNavigate}>Complete CHN Server Dashboard<OpenInNewIcon fontSize="small" /></Button>
        </Typography>
      </div>
      <br />
      <Box mt={8}>
        <Typography variant="body2" color="text.secondary" align="center">
          {/* {'Copyright © '} */}
          Powered by&nbsp;
          <Link color="inherit" href="https://communityhoneynetwork.readthedocs.io/en/stable/">
            CommunityHoneyNetwork (CHN)
          </Link>{' '}
          {'.'}
        </Typography>
      </Box>
    </div>
  );
}

export default MetricsDashboard;
