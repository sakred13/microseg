import React, { useState, useEffect } from 'react';
import './MissionPlanner.css';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
import missionSettings from './missionSettings.json';

function MissionPlanner() {
  const [activeTab, setActiveTab] = useState('Select Mission Type');
  const [selectedMission, setSelectedMission] = useState(null);
  const [soldierPosition, setSoldierPosition] = useState(null);
  const [missionLocation, setMissionLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('/forest.png');
  const [gcX, setGcX] = useState(693);
  const [gcY, setGcY] = useState(720);
  const [isSelectionsIncompleteModalOpen, setIsSelectionsIncompleteModalOpen] = useState(false);
  const [insufficientPrivileges, setInsufficientPrivileges] = useState(false);
  const [insufficientPrivilegesModalOpen, setInsufficientPrivilegesModalOpen] = useState(false);
  const [devicePrivileges, setDevicePrivileges] = useState({});
  const [requiredDeviceTypes, setRequiredDeviceTypes] = useState({});
  const [requiredPrivileges, setRequiredPrivileges] = useState({});
  const [dropDownOptions, setDropDownOptions] = useState({});
  const [selections, setSelections] = useState({});
  const [allPrivileges, setAllPrivileges] = useState({});
  const [assetCriticality, setAssetCriticality] = useState('Low');
  const [lifeThreat, setLifeThreat] = useState('Low');
  const [dataSensitivity, setDataSensitivity] = useState('Low');
  const [strategicImportance, setStrategicImportance] = useState('Low');

  // Update selections state when dropDownOptions changes
  useEffect(() => {
    // Set default selections based on dropDownOptions
    const defaultSelections = {};
    Object.keys(dropDownOptions).forEach(deviceType => {
      if (dropDownOptions[deviceType].length > 0) {
        defaultSelections[deviceType] = dropDownOptions[deviceType][0]; // Select the first option by default
      }
    });
    setSelections(defaultSelections);
  }, [dropDownOptions]);

  useEffect(() => {
    if (selectedMission) {
      const selectedMissionSettings = missionSettings.settings.find((mission) => mission.mission === selectedMission).devices;
      var deviceTypes = {};
      var devicePrivileges = {};
      selectedMissionSettings.forEach(device => {
        Object.entries(device).forEach(([key, value]) => {
          const [deviceName, deviceType] = key.split('::');
          deviceTypes[deviceName] = deviceType;
          devicePrivileges[deviceName] = value;
        });
      });
      setRequiredDeviceTypes(deviceTypes);
      setRequiredPrivileges(devicePrivileges);
    }
  }, [selectedMission]);

  useEffect(() => {
    if (selectedMission && Object.keys(requiredDeviceTypes).length > 0) {
      fetch(`${API_URL}/device/getTrustedDevices?authToken=${encodeURIComponent(
        Cookies.get('jwtToken')
      )}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((devices) => {
          const dropdownOptions = {};
          const allPrivileges = {}; // Initialize allPrivileges dictionary

          for (const deviceType of Object.keys(requiredDeviceTypes)) {
            dropdownOptions[deviceType] = devices
              .filter((device) => device.device_type === requiredDeviceTypes[deviceType])
              .map((device) => device.device_name);

            // Iterate through the fetched devices and populate allPrivileges
            devices.forEach(device => {
              if (requiredDeviceTypes[deviceType] === device.device_type) {
                allPrivileges[device.device_name] = device.allowedTasks;
              }
            });
          }

          setDropDownOptions(dropdownOptions);
          setAllPrivileges(allPrivileges); // Set allPrivileges state
        })
        .catch((error) => {
          // Handle error if the API request fails
          console.error('Error fetching trusted devices:', error);
        });
    }
  }, [selectedMission, requiredDeviceTypes]);

  useEffect(() => {
    const privileges = {};
    let anyRequiredPrivilegeAbsent = false;

    for (const [deviceType, deviceName] of Object.entries(selections)) {
      const required = requiredPrivileges[deviceType];
      const has = allPrivileges[deviceName] || [];

      privileges[deviceType] = {
        device: deviceName,
        required: required,
        has: has
      };

      if (required.some(privilege => !has.includes(privilege))) {
        anyRequiredPrivilegeAbsent = true;
      }
    }

    setDevicePrivileges(privileges);
    setInsufficientPrivileges(anyRequiredPrivilegeAbsent);
  }, [selections, requiredPrivileges, allPrivileges]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleMissionSelect = (missionType) => {
    setSelectedMission(missionType);
    setActiveTab('Plan Mission');
    setRequiredDeviceTypes({});
    setRequiredPrivileges({});
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

  useEffect(() => {
    const privileges = {};
    let anyRequiredPrivilegeAbsent = false;

    // Iterate through selections
    for (const [deviceType, deviceName] of Object.entries(selections)) {
      const required = requiredPrivileges[deviceType];
      const has = allPrivileges[deviceName] || [];

      // Update availablePrivileges for the deviceType
      privileges[deviceType] = {
        device: deviceName,
        required: required,
        has: has
      };

      // Check if any required privilege is absent
      if (required.some(privilege => !has.includes(privilege))) {
        anyRequiredPrivilegeAbsent = true;
      }
    }

    // Update the devicePrivileges state with the privileges object
    setDevicePrivileges(privileges);

    // Set insufficientPrivileges to true if any required privilege is absent
    setInsufficientPrivileges(anyRequiredPrivilegeAbsent);
  }, [selections, requiredPrivileges, allPrivileges]);


  const handleCreateMissionClick = () => {
    console.log(selections);

    if (Object.keys(requiredPrivileges).length != Object.keys(selections).length) {
      setIsSelectionsIncompleteModalOpen(true); // Open the modal when the button is disabled
    } else if (insufficientPrivileges) {
      setInsufficientPrivilegesModalOpen(true);
    } else {
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      // Make API call to start mission
      const payload = {
        authToken: encodeURIComponent(Cookies.get('jwtToken')),
        missionData: {
          mission_type: selectedMission,
          mission_config: JSON.stringify({
            gcX: gcX,
            gcY: gcY,
            destX: soldierPosition.x * 1792,
            destY: soldierPosition.y * 1024,
            selections: selections,
          }),
          create_time: timestamp,
          duration_sec: 120,
          criticality: 1
        },
        supervisors: [5],
        viewers: [11]
      };

      fetch(`${API_URL}/mission/createMission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to start mission');
          }
          // Continue with existing functionality
          switchToExecuteTab();
        })
        .catch((error) => {
          console.error('Error starting mission:', error);
        });
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
      </div>

      <div className="tab-content">
        {activeTab === 'Select Mission Type' && (
          <div className="mission-type-container" style={{ maxWidth: "60%", margin: "0 auto" }}>
            <h1>Select Mission Type</h1>
            <div className="mission-images">
              <div className="mission-image" onClick={() => handleMissionSelect('Mine-Aware Search and Rescue')}>
                <img src="mineAwareSearchRescue.png" alt="Mine-Aware Search and Rescue" />
                <p>Mine-Aware Search and Rescue</p>
              </div>
              <div className="mission-image" onClick={() => handleMissionSelect('Stealthy Reconnaissance and Resupply')}>
                <img src="stealthyReconResupply.png" alt="Stealthy Reconnaissance and Resupply" />
                <p>Stealthy Reconnaissance and Resupply</p>
              </div>
              <div className="mission-image" onClick={() => handleMissionSelect('Infrastructure Inspection')}>
                <img src="infraInspection.png" alt="Infrastructure Inspection" />
                <p>Infrastructure Inspection</p>
              </div>
              <div className="mission-image" onClick={() => handleMissionSelect('Disaster Assessment and Recovery')}>
                <img src="disasterAssessRecover.png" alt="Disaster Assessment and Recovery" />
                <p>Disaster Assessment and Recovery</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Plan Mission' && (
          <div>
            <h1>Plan Mission</h1>

            {selectedMission && <p>Selected Mission Type: {selectedMission}</p>}

            <div className="dropdown-container">
              <div className="dropdown-wrapper">
                <label htmlFor="missionLocation">Mission Location:</label>
                <select
                  id="missionLocation"
                  value={missionLocation}
                  onChange={(e) => setMissionLocation(e.target.value)}
                >
                  <option value="Battlefield 1: Paleto Forest">Battlefield 1: Paleto Forest</option>
                  <option value="Battlefield 2: Grand Senora Desert">Battlefield 2: Grand Senora Desert</option>
                </select>
              </div>
              {Object.keys(dropDownOptions).map((deviceType) => (
                <div key={deviceType} className="dropdown-wrapper">
                  <label htmlFor={deviceType}>{deviceType}:</label>
                  <select
                    id={deviceType}
                    value={selections[deviceType] || ''}
                    onChange={(e) => {
                      const selectedDevice = e.target.value;
                      setSelections(prevState => ({
                        ...prevState,
                        [deviceType]: selectedDevice
                      }));
                    }}
                  >
                    {dropDownOptions[deviceType].length === 0 ? (
                      <option disabled>No suitable device available</option>
                    ) : (
                      dropDownOptions[deviceType].map((device) => (
                        <option key={device} value={device}>
                          {device}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              ))}
              <div className="dropdown-wrapper">
                <label htmlFor="assetCrit">Asset Criticality:</label>
                <select
                  id="assetCrit"
                  value={missionLocation}
                  onChange={(e) => setAssetCriticality(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="dropdown-wrapper">
                <label htmlFor="lifeThreat">Life Threat:</label>
                <select
                  id="lifeThreat"
                  value={missionLocation}
                  onChange={(e) => setLifeThreat(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="dropdown-wrapper">
                <label htmlFor="dataSens">Data Sensitivity:</label>
                <select
                  id="dataSens"
                  value={missionLocation}
                  onChange={(e) => setDataSensitivity(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="dropdown-wrapper">
                <label htmlFor="stratImp">Strategic Importance:</label>
                <select
                  id="stratImp"
                  value={missionLocation}
                  onChange={(e) => setStrategicImportance(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
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
              onClick={handleCreateMissionClick}
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
              <SettingsSuggestIcon /> Create Mission
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
                <h1 id="modal-title">Configure all devices first!</h1>
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
                <h1 id="modal-title" style={{ fontWeight: 'bold' }}>Insufficient Privileges for Some Devices</h1>
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
                </table><br />

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
      </div>
    </div>
  );
}

export default MissionPlanner;
