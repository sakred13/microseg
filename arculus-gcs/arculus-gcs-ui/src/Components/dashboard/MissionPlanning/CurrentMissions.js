import React, { useState, useEffect, useCallback } from 'react';
import './MissionPlanner.css';
import MissionExecution from './MissionExecution';
import Typography from '@mui/material/Typography';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
import DroneRemote from './DroneRemote';
import LogConsole from './LogConsole';
import AlertButton from './AlertButton';
import ListMissions from './ListMissions';
import ExecuteFromManifest from './ExecuteFromManifest';

function CurrentMissions(props) {
  const [activeTab, setActiveTab] = useState('Missions');
  const [selectedMission, setSelectedMission] = useState(null);
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
  const [insufficientPrivileges, setInsufficientPrivileges] = useState(false);
  const [devicePrivileges, setDevicePrivileges] = useState({});
  const [deviceName, setDeviceName] = useState('');
  const [survCommEstablished, setSurvCommEstablished] = useState(false);
  const [showSupplyDrone, setShowSupplyDrone] = useState(false);
  const [survCommLost, setSurvCommLost] = useState(false);
  const [showLowBattery, setShowLowBattery] = useState(false);
  const [blinkLowBattery, setBlinkLowBattery] = useState(true);
  const [missionAborted, setMissionAborted] = useState(false);
  const userType = props.userType;
  const userName = Cookies.get('user');
  const [logs, setLogs] = useState([]);

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
    console.log("Mission aborted status:", missionAborted);
  }, [missionAborted]);

  useEffect(() => {
    // Check if communication with the surveillance drone has been established
    if (survCommEstablished) {
      setLogs(prevLogs => [...prevLogs, {
        message: "Communication with Surveillance Drone Established",
        color: "green"
      }]);
    }
  }, [survCommEstablished]); // This effect runs only when survCommEstablished changes

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

  const handleAbortMission = () => {
    setMissionAborted(true);  // This sets the missionAborted state to true
    console.log('Setting missionAborted to: ', !missionAborted)
  };

  const handleSimulatePhysicalCapture = () => {
    const payload = {
      device: deviceName
    }
    fetch(`${API_URL}/mission/simulatePhysicalCapture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        console.log('Simulation success:', data);
        setTimeout(() => {
          setLogs(prevLogs => [...prevLogs, {
            message: "Drone movement has unexpectedly stalled. Potential Physical Capture.",
            color: "red"
          }]);
          setTimeout(() => {
            setLogs(prevLogs => [...prevLogs, {
              message: "Shutting down on-board container for data protection.",
              color: "green"
            }]);
          }, 1500);
        }, 2000);
      });
  };

  const handleSimulateCommunicationLoss = () => {
    const payload = {
      authToken: encodeURIComponent(Cookies.get('jwtToken')),
      controller: deviceName,
      type: showSupplyDrone ? 'sup' : 'surv'
    };

    fetch(`${API_URL}/mission/simulateBadNetwork`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        console.log('Simulation success:', data);
        setTimeout(() => {
          setLogs(prevLogs => [...prevLogs, {
            message: "Communication failure with the drone.",
            color: "red"
          }]);
          setTimeout(() => {
            setLogs(prevLogs => [...prevLogs, {
              message: showSupplyDrone ? "Drone will take pre-planned flight path autonomously." : "Sending out Relay Drone.",
              color: "green"
            }]);
          }, 1500);
        }, 2000);
      })
      .catch(error => {
        console.error('Error simulating network communication loss:', error);
      });
  };

  const handleSimulateGpsSpoofing = () => {
    const payload = {
      controller: deviceName,
      device: showSupplyDrone ? 'sup' : 'surv',
      slope: -9,
      distance: 30,
    };

    fetch(`${API_URL}/mission/simulateGpsSpoofing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        console.log('GPS spoofing simulation success:', data);
        setTimeout(() => {
          setLogs(prevLogs => [...prevLogs, {
            message: "Unknown move commands received. Authentication Failed. Potential GPS Spoofing.",
            color: "red"
          }]);
          setTimeout(() => {
            setLogs(prevLogs => [...prevLogs, {
              message: "Closing Drone Ingress and taking pre-planned flight path.",
              color: "green"
            }]);
          }, 1500);
        }, 2000);
      })
      .catch(error => {
        console.error('Error simulating GPS spoofing:', error);
      });
  };

  const handleSimulateDenialOfService = () => {
    // Simulation API call can be made here, similar to other handlers
    setTimeout(() => {
      setLogs(prevLogs => [...prevLogs, {
        message: "Unexpected flow of traffic from Controller IP. Authentication failed for some traffic.",
        color: "red"
      }]);
      setTimeout(() => {
        setLogs(prevLogs => [...prevLogs, {
          message: "Closing Drone Ingress and taking pre-planned flight path.",
          color: "green"
        }]);
      }, 1500);
    }, 2000);
  };

  const handleSimulateLowBattery = () => {
    setShowLowBattery(!showLowBattery);
    // This can also trigger an API call to simulate the scenario
    setTimeout(() => {
      setLogs(prevLogs => [...prevLogs, {
        message: "Battery draining faster than anticipated.",
        color: "red"
      }]);
      setTimeout(() => {
        setLogs(prevLogs => [...prevLogs, {
          message: "Shifting to low power alternative for pre-planned flight path.",
          color: "green"
        }]);
      }, 1500);
    }, 2000);
  };

  const handleSimulateBruteForceSSH = () => {
    // API call to simulate SSH brute force attack
    setTimeout(() => {
      setLogs(prevLogs => [...prevLogs, {
        message: "Unauthorized SSH Connection Attempts detected. Authentication failed.",
        color: "red"
      }]);
      setTimeout(() => {
        setLogs(prevLogs => [...prevLogs, {
          message: "Enforcing Defense By Pretense protocols. Diverting traffic to Cowrie Honeypot.",
          color: "green"
        }]);
      }, 1500);
    }, 2000);
  };

  const handleTabChange = useCallback((tabName) => {
    setActiveTab(tabName);
  }, [setActiveTab]);

  const handleChangeLocation = (location) => {
    if (location === 'Battlefield 1: Paleto Forest') {
      setSelectedLocation('/forest.png');
      setGcX(0.3867);
      setGcY(0.7031);
    } else if (location === 'Battlefield 2: Grand Senora Desert') {
      setSelectedLocation('/desert.png');
      setGcX(0.1129);
      setGcY(0.4102);
    }
  };

  useEffect(() => {
    handleChangeLocation(missionLocation);
  }, [missionLocation]);

  useEffect(() => {
    let blinkInterval;
    if (showLowBattery) {
      blinkInterval = setInterval(() => {
        setBlinkLowBattery(prev => !prev);
      }, 500);
    } else {
      setBlinkLowBattery(true);
    }
    return () => clearInterval(blinkInterval);
  }, [showLowBattery]);

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
        {
          userType === "Mission Creator" && (
            <button
              className={activeTab === 'manifest' ? 'tab-button active' : 'tab-button'}
              onClick={() => handleTabChange('manifest')}
            >
              Execute using Mission Manifest File
            </button>
          )
        }
        <button
          className={activeTab === 'Mission Execution' ? 'tab-button active execute-button' : 'tab-button execute-button'}
        // onClick={switchToExecuteTab}
        >
          Mission Execution
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'Missions' && (
          <div>
            {selectedMission && <p>Selected Mission Type: {selectedMission}</p>}
            <ListMissions authToken={encodeURIComponent(Cookies.get('jwtToken'))} setVideoCollectionDrone={setVideoCollectionDrone} setSupplyDeliveryDrone={setSupplyDeliveryDrone} setDeviceName={setDeviceName} setSelectedLocation={setSelectedLocation} setActiveTab={setActiveTab} userType={userType} />
            <br />
          </div>
        )}

        {activeTab === 'manifest' && (
          <ExecuteFromManifest handleTabChange={handleTabChange} setDeviceName={setDeviceName} setSelectedLocation={setSelectedLocation} />
        )}

        {activeTab === 'Mission Execution' && (
          <>
            <button onClick={handleSimulateCommunicationLoss} style={{ marginTop: '10px' }}>
              <b>Simulate Communication Loss</b>
            </button>&nbsp;&nbsp;
            <button onClick={handleSimulateGpsSpoofing} style={{ marginTop: '10px' }}>
              <b>Simulate GPS Spoofing</b>
            </button>
            &nbsp;&nbsp;
            <button onClick={handleSimulatePhysicalCapture} style={{ marginTop: '10px' }}>
              <b>Simulate Physical Capture</b>
            </button>&nbsp;&nbsp;
            <button onClick={handleSimulateDenialOfService} style={{ marginTop: '10px' }}>
              <b>Simulate Denial of Service</b>
            </button>&nbsp;&nbsp;
            <button onClick={handleSimulateLowBattery} style={{ marginTop: '10px' }}>
              <b>Simulate Low Battery</b>
            </button>&nbsp;&nbsp;
            <button onClick={handleSimulateBruteForceSSH} style={{ marginTop: '10px' }}>
              <b>Simulate Brute Force SSH</b>
            </button>
            <br />
            <div className='container'>
              <div className='tabs mission-container' style={{ border: '2px solid black', padding: '10px', display: 'flex' }}>
                <div style={{ width: '85%' }}>
                  <MissionExecution handleTabChange={handleTabChange} deviceName={deviceName} selectedLocation={selectedLocation} jwtToken={encodeURIComponent(Cookies.get('jwtToken'))} showSupplyDrone={showSupplyDrone} setShowSupplyDrone={setShowSupplyDrone} setSurvCommEstablished={setSurvCommEstablished} showLowBattery={showLowBattery} blinkLowBattery={blinkLowBattery} missionAborted={missionAborted} setSurvCommLost={setSurvCommLost} survCommEstablished={survCommEstablished} setLogs={setLogs} />
                </div>
                <div className="log-container" style={{ width: '15%' }}>
                  <LogConsole logs={logs} />
                  <DroneRemote />
                  <AlertButton userType={userType} handleAbortMission={handleAbortMission} />
                </div>
              </div>
            </div>
            <br />
          </>
        )}
      </div>
    </div>
  );
}

export default CurrentMissions;
