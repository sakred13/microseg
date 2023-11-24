import React, { useState, useEffect } from 'react';
import './MissionPlanner.css';

function MissionPlanner() {
  const [activeTab, setActiveTab] = useState('Select Mission Type');
  const [selectedMission, setSelectedMission] = useState(null);
  const [soldierPosition, setSoldierPosition] = useState(null);
  const [missionLocation, setMissionLocation] = useState('');
  const [videoAnalytic, setVideoAnalytic] = useState('controller');
  const [videoCollectionDrone, setVideoCollectionDrone] = useState('drone1');
  const [supplyDeliveryDrone, setSupplyDeliveryDrone] = useState('drone1');
  const [selectedLocation, setSelectedLocation] = useState('/forest.png')

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
    } else if (location === 'Battlefield 2: Grand Senora Desert') {
      setSelectedLocation('/desert.png');
    }
  };

  // Use useEffect to listen for changes in missionLocation
  useEffect(() => {
    handleChangeLocation(missionLocation);
  }, [missionLocation]);

  return (
    <div className="missionPlanner">
      <div className="tabs">
        <button
          className={activeTab === 'Select Mission Type' ? 'tab-button active' : 'tab-button'}
          onClick={() => handleTabChange('Select Mission Type')}
        >
          Select Mission Type
        </button>
        <button
          className={activeTab === 'Plan Mission' ? 'tab-button active' : 'tab-button'}
          onClick={() => handleTabChange('Plan Mission')}
        >
          Plan Mission
        </button>
        <button
          className={activeTab === 'Execute Mission' ? 'tab-button active' : 'tab-button'}
          onClick={() => handleTabChange('Execute Mission')}
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
              <option value="">Select Location</option>
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
              <option value="controller">Controller</option>
            </select>

            {/* Video Collection Surveillance Drone dropdown */}
            <label htmlFor="videoCollectionDrone">Video Collection Surveillance Drone:</label>
            <select
              id="videoCollectionDrone"
              value={videoCollectionDrone}
              onChange={(e) => setVideoCollectionDrone(e.target.value)}
            >
              <option value="drone1">Drone 1</option>
              <option value="drone2">Drone 2</option>
            </select>

            {/* Supply Delivery Drone dropdown */}
            <label htmlFor="supplyDeliveryDrone">Supply Delivery Drone:</label>
            <select
              id="supplyDeliveryDrone"
              value={supplyDeliveryDrone}
              onChange={(e) => setSupplyDeliveryDrone(e.target.value)}
            >
              <option value="drone1">Drone 1</option>
              <option value="drone2">Drone 2</option>
            </select>
            <label htmlFor="mapsvg">Point the supply delivery destination on map.</label>

            <svg
              id="mapsvg"
              className="mission-svg"
              viewBox="0 0 1792 1024" // Set the viewBox to match the aspect ratio of your background image
              preserveAspectRatio="xMidYMid meet" // Maintain aspect ratio and scale to fit the container width
              onClick={handleSvgClick}
            >
              <image href={selectedLocation} x="0" y="0" width="1792" height="1024" />
              <image
                href="/groundControl.png"
                x={202} // Offset to center the soldier image (35 is half of 70)
                y={420} // Offset to center the soldier image (35 is half of 70)
                width="70"
                height="70"
              />
              {soldierPosition && (
                <image
                  href="/soldier.png"
                  x={soldierPosition.x * 1792 - 35} // Offset to center the soldier image (35 is half of 70)
                  y={soldierPosition.y * 1024 - 35} // Offset to center the soldier image (35 is half of 70)
                  width="70"
                  height="70"
                />
              )}
            </svg>
          </div>
        )}

        {activeTab === 'Execute Mission' && (
          <div>
            <h2>Execute Mission</h2>
            {/* Add your content for executing the mission here */}
          </div>
        )}
      </div>
    </div>
  );
}

export default MissionPlanner;
