const { isUserOfType, getUserFromToken } = require('./authService');

const pool = require('../modules/arculusDbConnection');

// Define global variables
let gcX = null;
let gcY = null;
let destX = null;
let destY = null;
let survDroneName = null;
let survDroneIp = null;
let supplyDroneName = null;
let supplyDroneIp = null;
let survX = null;
let survY = null;
let supplyX = null;
let supplyY = null;
let missionRunning = false;

exports.startMission = (req, res) => {
    const { authToken, gcX: newGcX, gcY: newGcY, destX: newDestX, destY: newDestY, survDroneName: newSurvDroneName, survDroneIp: newSurvDroneIp, supplyDroneName: newSupplyDroneName, supplyDroneIp: newSupplyDroneIp } = req.body;

    // Check if the user has an admin role
    isUserOfType(getUserFromToken(authToken), 'Mission Creator', (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
        }

        // Update global variables with new values
        gcX = newGcX;
        gcY = newGcY;
        destX = newDestX;
        destY = newDestY;
        survDroneName = newSurvDroneName;
        survDroneIp = newSurvDroneIp;
        supplyDroneName = newSupplyDroneName;
        supplyDroneIp = newSupplyDroneIp;
        missionRunning = true;
        survX = gcX;
        survY = gcY;
        supplyX = gcX;
        supplyY = gcY;
        
        // Send response indicating mission started
        res.status(200).json({ message: 'Mission data updated successfully' });

        // Function to increment survX and survY every 2 seconds
        const incrementCoordinates = () => {
            if (missionRunning) {
                // Increment survX and survY
                survX += 1;
                survY += 1;
                                
                // Call the function recursively after 2 seconds
                setTimeout(incrementCoordinates, 2000);
            }
        };

        // Call the function to start incrementing coordinates
        incrementCoordinates();
    });
};

exports.getMissionState = (req, res) => {
    // Check if the user has an admin role
    const { authToken } = req.query;
    isUserOfType(getUserFromToken(authToken), 'Mission Creator', (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
        }

        // Return all global variables associated with the mission
        return res.status(200).json({ 
            gcX,
            gcY,
            destX,
            destY,
            survDroneName,
            survDroneIp,
            supplyDroneName,
            supplyDroneIp,
            survX,
            survY,
            supplyX,
            supplyY,
            missionRunning
        });
    });
};