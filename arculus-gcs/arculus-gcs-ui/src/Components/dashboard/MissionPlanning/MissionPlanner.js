import React, { useState, useEffect } from 'react';
import './MissionPlanner.css';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import DesertMission from './DesertMission';
import ForestMission from './ForestMission';
import Typography from '@mui/material/Typography';

function MissionPlanner() {
  const [activeTab, setActiveTab] = useState('Select Mission Type');
  const [selectedMission, setSelectedMission] = useState(null);
  const [soldierPosition, setSoldierPosition] = useState(null);
  const [missionLocation, setMissionLocation] = useState('');
  const [videoAnalytic, setVideoAnalytic] = useState('controller');
  const [videoCollectionDrone, setVideoCollectionDrone] = useState('drone1');
  const [supplyDeliveryDrone, setSupplyDeliveryDrone] = useState('drone1');
  const [selectedLocation, setSelectedLocation] = useState('/forest.png');
  const [gcX, setGcX] = useState(693);
  const [gcY, setGcY] = useState(720);


  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleMissionSelect = (missionType) => {
    setSelectedMission(missionType);
    setActiveTab('Plan Mission');
  };

  const handleSvgClick = (e) => {
    const svg = e.target;
    const svgRect = svg.getBoundingClientRect();
    const x = (e.clientX - svgRect.left) / svgRect.width; // Calculate the relative position (0 to 1)
    const y = (e.clientY - svgRect.top) / svgRect.height; // Calculate the relative position (0 to 1)

    setSoldierPosition({ x, y });
  };

  // Define the handleChangeLocation function
  const handleChangeLocation = (location) => {
    if (location === 'Battlefield 1: Paleto Forest') {
      setSelectedLocation('/forest.png');
      // Calculate gcX and gcY based on the width and height ratio
      setGcX(0.3867); // Example: 202 / 1792
      setGcY(0.7031); // Example: 420 / 1024
    } else if (location === 'Battlefield 2: Grand Senora Desert') {
      setSelectedLocation('/desert.png');
      // Calculate gcX and gcY based on the width and height ratio
      setGcX(0.1129); // Example: 202 / 1792
      setGcY(0.4102); // Example: 420 / 1024
    }
  };

  // Use useEffect to listen for changes in missionLocation
  useEffect(() => {
    handleChangeLocation(missionLocation);
  }, [missionLocation]);

  // Function to switch to the "Execute Mission" tab
  const switchToExecuteTab = () => {
    setActiveTab('Execute Mission');
  };

  return (
    <div className="missionPlanner">
      <Typography variant="h4" component="div" gutterBottom>
        Mission Planning And Execution Dashboard
      </Typography>
      <div className="tabs">
        <button
          className={activeTab === 'Select Mission Type' ? 'tab-button active' : 'tab-button'}
          onClick={() => handleTabChange('Select Mission Type')}
        >
          Select Mission Type
        </button>
        <button
          className={activeTab === 'Plan Mission' ? 'tab-button active' : 'tab-button'}
        // onClick={() => handleTabChange('Plan Mission')}
        >
          Plan Mission
        </button>
        <button
          className={activeTab === 'Execute Mission' ? 'tab-button active execute-button' : 'tab-button execute-button'}
        // onClick={switchToExecuteTab}
        >
          Execute Mission
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'Select Mission Type' && (
          <div className="mission-type-container">
            <h2>Select Mission Type</h2>
            <button className="mission-button" onClick={() => handleMissionSelect('Mine-Aware Search and Rescue')}>
              Mine-Aware Search and Rescue
            </button>
            <button className="mission-button" onClick={() => handleMissionSelect('Stealthy Reconnaissance and Resupply')}>
              Stealthy Reconnaissance and Resupply
            </button>
          </div>
        )}

        {activeTab === 'Plan Mission' && (
          <div>
            <h2>Plan Mission</h2>
            {selectedMission && <p>Selected Mission Type: {selectedMission}</p>}

            <label htmlFor="missionLocation">Mission Location:</label>
            <select
              id="missionLocation"
              value={missionLocation}
              onChange={(e) => setMissionLocation(e.target.value)}
            >
              <option value="Battlefield 1: Paleto Forest">Battlefield 1: Paleto Forest</option>
              <option value="Battlefield 2: Grand Senora Desert">Battlefield 2: Grand Senora Desert</option>
            </select>

            {/* Video-Analytic Route Planner dropdown */}
            <label htmlFor="videoAnalytic">Video-Analytic Route Planner (Ground Control):</label>
            <select
              id="videoAnalytic"
              value={videoAnalytic}
              onChange={(e) => setVideoAnalytic(e.target.value)}
            >
              <option value="controller">controller</option>
            </select>

            {/* Video Collection Surveillance Drone dropdown */}
            <label htmlFor="videoCollectionDrone">Video Collection Surveillance Drone:</label>
            <select
              id="videoCollectionDrone"
              value={videoCollectionDrone}
              onChange={(e) => setVideoCollectionDrone(e.target.value)}
            >
              <option value="drone2">drone2</option>
              <option value="drone1">drone1</option>
            </select>

            {/* Supply Delivery Drone dropdown */}
            <label htmlFor="supplyDeliveryDrone">Supply Delivery Drone:</label>
            <select
              id="supplyDeliveryDrone"
              value={supplyDeliveryDrone}
              onChange={(e) => setSupplyDeliveryDrone(e.target.value)}
            >
              <option value="drone1">drone1</option>
              <option value="drone2">drone2</option>
            </select>
            <label htmlFor="mapsvg">Point the supply delivery destination on map.</label>
            <div className='tabs mission-container' style={{ border: '2px solid black', padding: '10px' }}>
              <svg
                id="mapsvg"
                className="mission-svg"
                viewBox="0 0 1792 1024"
                preserveAspectRatio="xMidYMid meet"
                onClick={handleSvgClick}
              >
                <image href={selectedLocation} x="0" y="0" width="1792" height="1024" />

                {/* Ground Control */}
                <image href="groundControl.png" x={gcX * 1792 - 35} y={gcY * 1024 - 35} width="70" height="70" />
                <rect x={gcX * 1792 - 75} y={gcY * 1024 + 45} width="150" height="30" fill="black" stroke="white" strokeWidth="2" rx="15" ry="15" />
                <text x={gcX * 1792} y={gcY * 1024 + 65} fill="white" fontSize="15" textAnchor="middle" fontWeight="bold">
                  Ground Station
                </text>

                {/* Soldier */}
                {soldierPosition && (
                  <image
                    href="soldier.png"
                    x={soldierPosition.x * 1792 - 35}
                    y={soldierPosition.y * 1024 - 35}
                    width="70"
                    height="70"
                  />
                )}
                {soldierPosition && (
                  <rect
                    x={soldierPosition.x * 1792 - 75} // Adjust the x-coordinate for the rect element
                    y={soldierPosition.y * 1024 + 50} // Adjust the y-coordinate for the rect element
                    width="150"
                    height="30"
                    fill="black"
                    stroke="white"
                    strokeWidth="2"
                    rx="15"
                    ry="15"
                  />
                )}
                {soldierPosition && (
                  <text
                    x={soldierPosition.x * 1792}
                    y={soldierPosition.y * 1024 + 70} // Adjust the y-coordinate for the text element
                    fill="white"
                    fontSize="15"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    Supply Destination
                  </text>
                )}
              </svg>
            </div>
            <br />
            <button
              onClick={switchToExecuteTab}
              style={{
                backgroundColor: 'green',
                padding: '10px 20px',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              <SettingsSuggestIcon /> Execute Mission
            </button>
            <br />

          </div>
        )}

        {activeTab === 'Execute Mission' && (
          <>             <h2>Mission in Execution...</h2>

            <div className='tabs mission-container' style={{ border: '2px solid black', padding: '10px' }}>
              {/* Add your content for executing the mission here */}
              {selectedLocation === '/desert.png' ? <DesertMission handleTabChange={handleTabChange} /> : <ForestMission handleTabChange={handleTabChange} />}
            </div>

          </>)}
      </div>
    </div>
  );
}

export default MissionPlanner;
