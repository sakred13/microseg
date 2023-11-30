import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import IntelFeed from './IntelFeed';
import AttackerStats from './AttackerStats';
import './MetricsDashboard.css'; // Assuming you have a similar CSS file for styling
import MainDashboard from './MainDashboard';
import { useDashboardContext } from './DashboardContext';

function MetricsDashboard() {
    const { activeTab, setActiveTab, attackerIp } = useDashboardContext();

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
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
    </div>
  );
}

export default MetricsDashboard;
