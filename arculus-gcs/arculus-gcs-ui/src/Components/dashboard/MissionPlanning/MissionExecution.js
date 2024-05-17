import React, { useState, useEffect } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import './MissionPlanner.css';
import { API_URL } from '../../../config';

const MissionExecution = (props) => {
    // State for surveillance drone
    let intervalId;
    const [position, setPosition] = useState({ x: 202, y: 420 });
    const [path, setPath] = useState([]); //Done
    const [showSurveillanceDrone, setShowSurveillanceDrone] = useState(true);

    // State for supply drone
    const [supplyDronePosition, setSupplyDronePosition] = useState({ x: 202, y: 420 });
    const [supplyPath, setSupplyPath] = useState([]);

    const [relayPosition, setRelayPosition] = useState({ x: 202, y: 420 });
    const [relayPath, setRelayPath] = useState([]);
    const [showRelayDrone, setShowRelayDrone] = useState(false);
    const [supCommEstablished, setSupCommEstablished] = useState(false);
    const [supCommLost, setSupCommLost] = useState(false);
    // State for air defense
    const [showAirDefense, setShowAirDefense] = useState(false);
    const [showThreatText, setShowThreatText] = useState(true);

    // Constants for positions
    const [groundStation, setGroundStation] = useState({ x: 202, y: 420 });
    const [endPosition, setEndPosition] = useState({ x: 1340, y: 356 });
    const [airDefensePosition, setAirDefensePosition] = useState({ x: 915, y: 422 });
    const [airDefenseRadius, setAirDefenseRadius] = useState(180);

    const [showMissionAccomplished, setShowMissionAccomplished] = useState(false);

    const { handleTabChange, setSurvCommEstablished, setSurvCommLost, showSupplyDrone, setShowSupplyDrone, showLowBattery, blinkLowBattery, missionAborted, survCommEstablished, setLogs } = props;

    useEffect(() => {
        const threatTextInterval = setInterval(() => {
            setShowThreatText(prev => !prev);
        }, 500);

        return () => clearInterval(threatTextInterval);
    }, []);
    
    useEffect(() => {
        if (survCommEstablished) {
          setLogs(logs => [...logs, { message: "Communication with Surveillance Drone Established", color: "green" }]);
        }
      }, [survCommEstablished, setLogs]);

    useEffect(() => {
        setShowMissionAccomplished(missionAborted);
    }, [missionAborted]);
    
    const fetchMissionState = () => {
        fetch(`${API_URL}/mission/getMissionState?deviceName=${props.deviceName}`)
            .then(response => {
                if (!response.ok) {
                    // If the response is not okay, throw an error that will skip the following then block
                    throw new Error(`HTTP status ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Update all your state variables only if the response was successful
                setShowAirDefense(data.enemyFound);
                setAirDefensePosition({ x: data.enemyX, y: data.enemyY });
                setPath(data.survPath);
                setSupplyPath(data.supPath);
                setSupplyDronePosition({ x: data.supX, y: data.supY });
                setAirDefenseRadius(data.enemyRadius);
                setShowSurveillanceDrone(!data.survHome);
                setPosition({ x: data.survX, y: data.survY });
                setEndPosition({ x: data.destX, y: data.destY });
                setShowSupplyDrone(data.survHome);
                setShowMissionAccomplished(data.missionSuccess);
                setRelayPosition({ x: data.relayX, y: data.relayY });
                setRelayPath(data.relayPath);
                setShowRelayDrone(data.survCommLost || data.supCommLost);
                setSurvCommLost(data.survCommLost);
                setSupCommLost(data.supCommLost);
                setSurvCommEstablished(data.survCommEst);
                setSupCommEstablished(data.supCommEst);

                if (data.missionSuccess) {
                    // If mission is successful, stop the interval and reload the page after 10 seconds
                    clearInterval(intervalId);
                    setTimeout(() => {
                        window.location.reload();
                    }, 10000);
                }
            })
            .catch(error => {
                console.error('Error fetching mission state:', error);
                // Do not set any state, just log the error. The interval will keep running.
            });
    };

    // Initially call and set up interval in useEffect
    useEffect(() => {
        intervalId = setInterval(fetchMissionState, 1000); // adjust the interval as needed
        fetchMissionState(); // also call immediately to start the cycle

        // Clear the interval on cleanup
        return () => clearInterval(intervalId);
    }, []); // Make sure this effect does not have dependencies that might cause it to re-run unnecessarily



    const missionAccomplishedStyle = {
        display: showMissionAccomplished ? 'block' : 'none',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: missionAborted ? 'red' : 'green',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        fontSize: '60px',
        zIndex: 1000,
        animation: 'fadeIn 2s forwards',
    };

    const pathString = path.map(p => `${p.x},${p.y}`).join(' ');
    const supplyPathString = supplyPath.map(p => `${p.x},${p.y}`).join(' ');
    const relayPathString = relayPath.map(p => `${p.x},${p.y}`).join(' ');
    const searchlightPosition = {
        x: position.x + 30,
        y: position.y - 20
    };

    return (
        <><svg className="mission-svg"
            viewBox="0 0 1792 1024"
            preserveAspectRatio="xMidYMid meet">
            <image href={props.selectedLocation} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
            <image href="groundControl.png" x={groundStation.x} y={groundStation.y} width="70" height="70" />
            <rect x={groundStation.x - 25} y={groundStation.y + 80} width="150" height="30" fill="black" stroke="white" strokeWidth="2" rx="15" ry="15" />
            <text x={groundStation.x + 50} y={groundStation.y + 100} fontSize="15" fill="white" textAnchor="middle" fontWeight="bold">Ground Station</text>
            <image href="soldier.png" x={endPosition.x} y={endPosition.y} width="70" height="70" />
            <rect x={endPosition.x - 25} y={endPosition.y + 80} width="150" height="30" fill="black" stroke="white" strokeWidth="2" rx="15" ry="15" />
            <text x={endPosition.x + 50} y={endPosition.y + 100} fill="white" fontSize="15" textAnchor="middle" fontWeight="bold">Supply Destination</text>

            {showSurveillanceDrone && (
                <>
                    <polyline points={pathString} fill="none" stroke="green" strokeWidth="2" strokeDasharray="5,5" />
                    <image href="drone.png" x={position.x} y={position.y} width="70" height="70" />
                    <image href="searchlight.png" x={searchlightPosition.x + 20} y={searchlightPosition.y} width="90" height="90" />
                    <rect x={position.x - 25} y={position.y + 60} width="150" height="30" fill="black" stroke="white" strokeWidth="2" rx="15" ry="15" />
                    <text x={position.x + 50} y={position.y + 80} fill="white" fontSize="15" textAnchor="middle" fontWeight="bold">Surveillance Drone</text>
                </>
            )}

            {showRelayDrone && (
                <>
                    <polyline points={relayPathString} fill="none" stroke="cyan" strokeWidth="2" strokeDasharray="5,5" />
                    <image href="signalsLeft.png" x={relayPosition.x - 60} y={relayPosition.y - 20} width="90" height="90" />
                    <image href="relayDrone.png" x={relayPosition.x} y={relayPosition.y} width="70" height="70" />
                    <image href="signalsRight.png" x={relayPosition.x + 40} y={relayPosition.y - 20} width="90" height="90" />
                    <rect x={relayPosition.x - 25} y={relayPosition.y + 60} width="150" height="30" fill="black" stroke="white" strokeWidth="2" rx="15" ry="15" />
                    <text x={relayPosition.x + 50} y={relayPosition.y + 80} fill="white" fontSize="15" textAnchor="middle" fontWeight="bold">Comm Relay Drone</text>
                </>
            )}

            {showSupplyDrone && (
                <>
                    <polyline points={supplyPathString} fill="none" stroke="blue" strokeWidth="2" strokeDasharray="5,5" />
                    {showLowBattery && blinkLowBattery && (
                        <image href="lowBattery.png" x={supplyDronePosition.x + 15} y={supplyDronePosition.y - 20} width="40" height="40" />
                    )}
                    <image href="supplydrone.png" x={supplyDronePosition.x} y={supplyDronePosition.y} width="70" height="70" />
                    <rect x={supplyDronePosition.x - 25} y={supplyDronePosition.y + 60} width="150" height="30" fill="black" stroke="white" strokeWidth="2" rx="15" ry="15" />
                    <text x={supplyDronePosition.x + 50} y={supplyDronePosition.y + 80} fill="white" fontSize="15" textAnchor="middle" fontWeight="bold">Supply Drone</text>
                </>
            )}

            {showAirDefense && (
                <>
                    <circle cx={airDefensePosition.x} cy={airDefensePosition.y} r={airDefenseRadius} fill="rgba(255,192,203,0.5)" stroke="red" strokeWidth="2" strokeDasharray="10,5" />
                    <image href="airdefense.png" x={airDefensePosition.x - 25} y={airDefensePosition.y - 25} width="70" height="70" />
                    <rect x={airDefensePosition.x - 25} y={airDefensePosition.y + airDefenseRadius - 10} width="150" height="30" fill="black" stroke="white" strokeWidth="2" rx="15" ry="15" />
                    <text x={airDefensePosition.x + 50} y={airDefensePosition.y + airDefenseRadius + 12} fill="white" fontSize="15" textAnchor="middle" fontWeight="bold">Enemy Air Defense</text>
                    {showThreatText && (
                        <text x={airDefensePosition.x} y={airDefensePosition.y + airDefenseRadius + 50} fill="red" fontSize="20" textAnchor="middle" fontWeight="bold">
                            ⚠️ Threat Detected!
                        </text>
                    )}

                </>
            )}
            <foreignObject x="80%" y="0%" width="20%" height="20%">
                <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px' }}>
                    <div style={{ color: 'yellow' }}>
                        Ground Control Station: {groundStation.x ? `${groundStation.x.toFixed(2)}, ${groundStation.y.toFixed(2)}` : "Unknown"}
                    </div>
                    <div style={{ color: 'lightgreen' }}>
                        Surveillance Drone: {position.x ? `${position.x.toFixed(2)}, ${position.y.toFixed(2)}` : "Unknown"}
                    </div>
                    <div style={{ color: 'lightblue' }}>
                        Supply Drone: {supplyDronePosition.x ? `${supplyDronePosition.x.toFixed(2)}, ${supplyDronePosition.y.toFixed(2)}` : "Unknown"}
                    </div>
                    <div style={{ color: 'pink' }}>
                        Destination: {endPosition.x ? `${endPosition.x.toFixed(2)}, ${endPosition.y.toFixed(2)}` : "Unknown"}
                    </div>
                    <div style={{ color: 'red' }}>
                        Enemy Air Defense: {showAirDefense ? `${airDefensePosition.x.toFixed(2)}, ${airDefensePosition.y.toFixed(2)}` : "Unknown"}
                    </div>
                </div>
            </foreignObject>
        </svg>
            {(showMissionAccomplished || missionAborted) && (
                <div style={missionAccomplishedStyle}>
                    <button
                        className="close-button"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            zIndex: 1001, // Ensure it's above the success message
                        }}
                        onClick={() => {
                            setShowMissionAccomplished(false);
                            handleTabChange('Select Mission Type');
                        }}
                    >
                        X
                    </button>

                    {missionAborted
                        ? "Mission Aborted in Safe Mode. All compromised drones have turned their containers down."
                        : "Mission Accomplished! Supplies Have Been Delivered!"
                    }                </div>
            )}
        </>
    );
};

export default MissionExecution;