import React, { useState, useEffect } from 'react';
import './MissionPlanner.css';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import DesertMission from './DesertMission';
import ForestMission from './ForestMission';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';

function MissionPlanner() {
  const [activeTab, setActiveTab] = useState('Select Mission Type');
  const [selectedMission, setSelectedMission] = useState(null);
  const [soldierPosition, setSoldierPosition] = useState(null);
  const [missionLocation, setMissionLocation] = useState('');
  const [videoAnalytic, setVideoAnalytic] = useState('');
  const [videoCollectionDrone, setVideoCollectionDrone] = useState('');
  const [supplyDeliveryDrone, setSupplyDeliveryDrone] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('/forest.png');
  const [gcX, setGcX] = useState(693);
  const [gcY, setGcY] = useState(720);
  const [videoCollectionDrones, setVideoCollectionDrones] = useState([]);
  const [supplyDeliveryDrones, setSupplyDeliveryDrones] = useState([]);
  const [videoAnalyticControllers, setVideoAnalyticControllers] = useState([]);
  const isExecuteMissionDisabled = !videoAnalytic || !videoCollectionDrone || !supplyDeliveryDrone;
  const [isSelectionsIncompleteModalOpen, setIsSelectionsIncompleteModalOpen] = useState(false);
  const [insufficientPrivileges, setInsufficientPrivileges] = useState(false);
  const [insufficientPrivilegesModalOpen, setInsufficientPrivilegesModalOpen] = useState(false);
  const [devicePrivileges, setDevicePrivileges] = useState({});

  useEffect(() => {
    // Fetch trusted devices from your API using fetch
    fetch(`${API_URL}/api/getTrustedDevices?authToken=${encodeURIComponent(
      Cookies.get('jwtToken')
    )}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((devices) => {
        // Filter devices by device_type
        const videoCollectionSurveillanceDrones = devices.filter((device) => device.device_type === 'Video Capture Device');
        const supplyDeliveryDrones = devices.filter((device) => device.device_type === 'Controlled Drone');
        const videoAnalyticControllers = devices.filter((device) => device.device_type === 'Video Analytic Controller');
        // Set initial values for videoAnalytic, supplyDeliveryDrone, and videoCollectionDrone
        if (videoAnalyticControllers.length > 0) {
          setVideoAnalytic(videoAnalyticControllers[0].device_name);
        }
        if (videoCollectionSurveillanceDrones.length > 0) {
          setVideoCollectionDrone(videoCollectionSurveillanceDrones[0].device_name);
        }
        if (supplyDeliveryDrones.length > 0) {
          setSupplyDeliveryDrone(supplyDeliveryDrones[0].device_name);
        }

        // Update state variables with filtered devices
        setVideoCollectionDrones(videoCollectionSurveillanceDrones);
        setSupplyDeliveryDrones(supplyDeliveryDrones);
        setVideoAnalyticControllers(videoAnalyticControllers);

        const privileges = {
          videoAnalytic: {
            "required": ["send_command", "receive_video", "receive_posdata"],
            "has": []
          },
          videoCollectionDrone: {
            "required": ["send_video", "receive_command", "send_posdata"],
            "has": []
          },
          supplyDeliveryDrone: {
            "required": ["receive_command", "send_posdata"],
            "has": []
          }
        };

        // Check if videoAnalyticControllers, videoCollectionDrones, and supplyDeliveryDrones have values
        if (videoAnalyticControllers.length > 0 && videoCollectionDrones.length > 0 && supplyDeliveryDrones.length > 0) {
          // Find the corresponding device and assign its allowedTasks to privileges
          const videoAnalyticDevice = videoAnalyticControllers.find(device => device.device_name === videoAnalytic);
          const videoCollectionDevice = videoCollectionDrones.find(device => device.device_name === videoCollectionDrone);
          const supplyDeliveryDevice = supplyDeliveryDrones.find(device => device.device_name === supplyDeliveryDrone);

          privileges.videoAnalytic.has = videoAnalyticDevice ? videoAnalyticDevice.allowedTasks : [];
          privileges.videoCollectionDrone.has = videoCollectionDevice ? videoCollectionDevice.allowedTasks : [];
          privileges.supplyDeliveryDrone.has = supplyDeliveryDevice ? supplyDeliveryDevice.allowedTasks : [];
        }

        // Update the devicePrivileges state with the privileges object
        setDevicePrivileges(privileges);

        const anyRequiredPrivilegeAbsent = Object.keys(privileges).some((deviceType) => {
          return privileges[deviceType].required.some((privilege) => !privileges[deviceType].has.includes(privilege));
        });

        // Set insufficientPrivileges to true if any required privilege is absent
        setInsufficientPrivileges(anyRequiredPrivilegeAbsent);

        // Log the updated devicePrivileges
        console.log("Device Privileges: ", privileges);
      })
      .catch((error) => {
        // Handle error if the API request fails
        console.error('Error fetching trusted devices:', error);
      });
  }, []);


  useEffect(() => {
    // Initialize an empty privileges object
    const privileges = {
      videoAnalytic: {
        "device": videoAnalytic,
        "required": ["send_command", "receive_video", "receive_posdata"],
        "has": []
      },
      videoCollectionDrone: {
        "device": videoCollectionDrone,
        "required": ["send_video", "receive_command", "send_posdata"],
        "has": []
      },
      supplyDeliveryDrone: {
        "device": supplyDeliveryDrone,
        "required": ["receive_command", "send_posdata"],
        "has": []
      }
    };

    // Check if videoAnalyticControllers, videoCollectionDrones, and supplyDeliveryDrones have values
    if (videoAnalyticControllers.length > 0 && videoCollectionDrones.length > 0 && supplyDeliveryDrones.length > 0) {
      // Find the corresponding device and assign its allowedTasks to privileges
      const videoAnalyticDevice = videoAnalyticControllers.find(device => device.device_name === videoAnalytic);
      const videoCollectionDevice = videoCollectionDrones.find(device => device.device_name === videoCollectionDrone);
      const supplyDeliveryDevice = supplyDeliveryDrones.find(device => device.device_name === supplyDeliveryDrone);

      privileges.videoAnalytic.has = videoAnalyticDevice ? videoAnalyticDevice.allowedTasks : [];
      privileges.videoCollectionDrone.has = videoCollectionDevice ? videoCollectionDevice.allowedTasks : [];
      privileges.supplyDeliveryDrone.has = supplyDeliveryDevice ? supplyDeliveryDevice.allowedTasks : [];
    }

    // Update the devicePrivileges state with the privileges object
    setDevicePrivileges(privileges);

    // Log the updated devicePrivileges
    console.log("Device Privileges: ", privileges);
  });


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

  const handleExecuteMissionClick = () => {
    if (isExecuteMissionDisabled) {
      setIsSelectionsIncompleteModalOpen(true); // Open the modal when the button is disabled
    }
    else if (insufficientPrivileges) {
      setInsufficientPrivilegesModalOpen(true);
    }
    else {
      switchToExecuteTab();
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setIsSelectionsIncompleteModalOpen(false);
  };

  const closeInsufficientPrivilegesModal = () => {
    setInsufficientPrivilegesModalOpen(false);
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
              {videoAnalyticControllers.length === 0 ? ( // Check if there are no suitable devices
                <option disabled>No suitable device available</option>
              ) : (
                videoAnalyticControllers.map((device) => (
                  <option key={device.id} value={device.device_name}>
                    {device.device_name}
                  </option>
                ))
              )}
            </select>

            {/* Video Collection Surveillance Drone dropdown */}
            <label htmlFor="videoCollectionDrone">Video Collection Surveillance Drone:</label>
            <select
              id="videoCollectionDrone"
              value={videoCollectionDrone}
              onChange={(e) => setVideoCollectionDrone(e.target.value)}
            >
              {videoCollectionDrones.length === 0 ? ( // Check if there are no suitable devices
                <option disabled>No suitable device available</option>
              ) : (
                videoCollectionDrones.map((device) => (
                  <option key={device.id} value={device.device_name}>
                    {device.device_name}
                  </option>
                ))
              )}
            </select>

            {/* Supply Delivery Drone dropdown */}
            <label htmlFor="supplyDeliveryDrone">Supply Delivery Drone:</label>
            <select
              id="supplyDeliveryDrone"
              value={supplyDeliveryDrone}
              onChange={(e) => setSupplyDeliveryDrone(e.target.value)}
            >
              {supplyDeliveryDrones.length === 0 ? ( // Check if there are no suitable devices
                <option disabled>No suitable device available</option>
              ) : (
                supplyDeliveryDrones.map((device) => (
                  <option key={device.id} value={device.device_name}>
                    {device.device_name}
                  </option>
                ))
              )}
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleExecuteMissionClick}
              // disabled={isExecuteMissionDisabled}
              style={{
                backgroundColor: 'green',
                padding: '10px 20px',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}// Disable the button if any dropdown is empty
            >
              <SettingsSuggestIcon /> Execute Mission
            </Button>

            <Modal
              open={isSelectionsIncompleteModalOpen}
              onClose={closeModal}
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '5px',
                outline: 'none',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              }}>
                <h2 id="modal-title">Configure all devices first!</h2>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={closeModal}
                  style={{
                    display: 'block',
                    margin: '0 auto', // Center the button horizontally
                    marginTop: '20px', // Add some top margin for spacing
                  }}
                >
                  OK
                </Button>
              </div>
            </Modal>
            <Modal
              open={insufficientPrivilegesModalOpen}
              onClose={closeInsufficientPrivilegesModal}
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '5px',
                outline: 'none',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                textAlign: 'center',
              }}>
                <h2 id="modal-title" style={{ fontWeight: 'bold' }}>Insufficient Privileges for Some Devices</h2>
                <p>Mission Execution might fail! Please provide sufficient capabilities for necessary ingress and egress.</p>

                <table style={{ margin: '0 auto', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Device</th>
                      <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Privileges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(devicePrivileges).map(deviceTypeKey => {
                      const deviceType = devicePrivileges[deviceTypeKey];
                      return (
                        <tr key={deviceType.device}>
                          <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{deviceType.device}</td>
                          <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                            {deviceType.required.map(privilege => (
                              <div key={privilege}>
                                {deviceType.has.includes(privilege) ? (
                                  <span style={{ color: 'green' }}>✅</span>
                                ) : (
                                  <span style={{ color: 'red' }}>❌</span>
                                )}
                                {privilege}
                              </div>
                            ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table><br/>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={closeInsufficientPrivilegesModal}
                  style={{
                    display: 'block',
                    margin: '0 auto',
                    marginTop: '20px',
                  }}
                >
                  OK
                </Button>
              </div>
            </Modal>

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
