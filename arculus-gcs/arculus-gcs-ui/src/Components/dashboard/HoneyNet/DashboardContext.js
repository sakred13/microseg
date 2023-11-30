import React, { createContext, useState, useContext } from 'react';

const DashboardContext = createContext();

export const useDashboardContext = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [attackerIp, setAttackerIp] = useState(null);

  const switchToAttackerStats = (ip) => {
    setAttackerIp(ip);
    setActiveTab('Attacker Stats');
  };

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab, attackerIp, switchToAttackerStats }}>
      {children}
    </DashboardContext.Provider>
  );
};
