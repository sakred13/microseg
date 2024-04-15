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
import DroneRemote from './DroneRemote';
import LogConsole from './LogConsole';
import AlertButton from './AlertButton';
// import ListMissions from './ListMissions';

function CurrentMissions(props) {
  const [activeTab, setActiveTab] = useState('Missions');
  const [selectedMission, setSelectedMission] = useState(null);
  const [soldierPosition, setSoldierPosition] = useState(null);
  const [missionLocation, setMissionLocation] = useState('');
  const [videoAnalytic, setVideoAnalytic] = useState('');
  const [videoCollectionDrone, setVideoCollectionDrone] = useState('');
  const [supplyDeliveryDrone, setSupplyDeliveryDrone] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('/desert.png');
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
  const userType = props.userType;
  const userName = Cookies.get('user');

  useEffect(() => {
    // Fetch trusted devices from your API using fetch
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
        // Filter devices by device_type
        const videoCollectionSurveillanceDrones = devices.filter((device) => device.device_type === 'Video Capture Drone');
        const supplyDeliveryDrones = devices.filter((device) => device.device_type === 'Freight Drone');
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

    const anyRequiredPrivilegeAbsent = Object.keys(privileges).some((deviceType) => {
      return privileges[deviceType].required.some((privilege) => !privileges[deviceType].has.includes(privilege));
    });

    // Set insufficientPrivileges to true if any required privilege is absent
    setInsufficientPrivileges(anyRequiredPrivilegeAbsent);

  }, [videoAnalytic, videoCollectionDrone, supplyDeliveryDrone, videoAnalyticControllers, videoCollectionDrones, supplyDeliveryDrones]);


  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleMissionSelect = (missionType) => {
    setSelectedMission(missionType);
    setActiveTab('Missions');
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

  // Function to switch to the "Mission Execution" tab
  const switchToExecuteTab = () => {
    setActiveTab('Mission Execution');
  };

  const handleExecuteMissionClick = () => {
    if (isExecuteMissionDisabled) {
      setIsSelectionsIncompleteModalOpen(true); // Open the modal when the button is disabled
    } else if (insufficientPrivileges) {
      setInsufficientPrivilegesModalOpen(true);
    } else {
      // Find the drone objects based on their names
      const surveillanceDrone = videoCollectionDrones.find(drone => drone.device_name === videoCollectionDrone);
      const supplyDrone = supplyDeliveryDrones.find(drone => drone.device_name === supplyDeliveryDrone);

      if (!surveillanceDrone || !supplyDrone) {
        console.error('Could not find drones with the given names.');
        return;
      }

      // Make API call to start mission
      const payload = {
        gcX: gcX,
        gcY: gcY,
        destX: soldierPosition.x * 1792,
        destY: soldierPosition.y * 1024,
        survDroneName: surveillanceDrone.device_name,
        survDroneIp: surveillanceDrone.ip_address,
        supplyDroneName: supplyDrone.device_name,
        supplyDroneIp: supplyDrone.ip_address,
        authToken: encodeURIComponent(Cookies.get('jwtToken'))
      };

      fetch(`${API_URL}/mission/startMission`, {
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
        Mission Execution Dashboard
      </Typography>
      <div className="tabs">
        <button
          className={activeTab === 'Missions' ? 'tab-button active' : 'tab-button'}
          onClick={() => handleTabChange('Missions')}
        >
          {userType === "Mission Creator" && "Missions created by you"}
          {userType === "Mission Supervisor" && "Missions you supervise"}
          {userType === "Mission Viewer" && "Missions you monitor"}
        </button>
        <button
          className={activeTab === 'Mission Execution' ? 'tab-button active execute-button' : 'tab-button execute-button'}
          onClick={switchToExecuteTab}
        >
          Mission Execution
        </button>
      </div>

      <div className="tab-content">

        {activeTab === 'Missions' && (
          <div>
            {selectedMission && <p>Selected Mission Type: {selectedMission}</p>}
            {/* <ListMissions authToken={encodeURIComponent(Cookies.get('jwtToken'))} userType={userType}/> */}
            <br />
          </div>
        )}

        {activeTab === 'Mission Execution' && (
          <><br></br>
            <div className='container'>
              <div className='tabs mission-container' style={{ border: '2px solid black', padding: '10px' }}>
                {selectedLocation === '/desert.png' ? <DesertMission handleTabChange={handleTabChange} jwtToken={encodeURIComponent(Cookies.get('jwtToken'))} /> : <ForestMission handleTabChange={handleTabChange} />}
                <div className="log-container" style={{ width: '20%' }}>
                  <LogConsole />
                  <DroneRemote />
                  <AlertButton userType={userType} />
                </div>
              </div>
            </div>
          </>)}
      </div>
    </div>
  );
}

export default CurrentMissions;
