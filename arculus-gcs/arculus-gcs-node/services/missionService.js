const { isUserOfType, getUserFromToken, getUserIdFromName } = require('./authService');
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
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isAdmin) => {
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
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isAdmin) => {
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

// Function to create a new mission
exports.createMission = (req, res) => {
    var { authToken, missionData, supervisors, viewers } = req.body;

    // Check if the user has a mission creator role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isMissionCreator) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!isMissionCreator) {
            return res.status(401).json({ message: 'Unauthorized: Only mission creators can create missions' });
        }

        missionData['creator_id'] = getUserIdFromName(getUserFromToken(authToken));

        // Query to insert a new mission into the mission table
        const insertMissionQuery = 'INSERT INTO mission SET ?';
        pool.query(insertMissionQuery, missionData, (err, missionResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            const missionId = missionResult.insertId;

            // Insert supervisors
            const supervisorValues = supervisors.map(supervisorId => [supervisorId, missionId]);
            const insertSupervisorsQuery = 'INSERT INTO supervisor (user_id, mission_id) VALUES ?';
            pool.query(insertSupervisorsQuery, [supervisorValues], (supervisorErr, supervisorResult) => {
                if (supervisorErr) {
                    console.error(supervisorErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                // Insert viewers
                const viewerValues = viewers.map(viewerId => [viewerId, missionId]);
                const insertViewersQuery = 'INSERT INTO viewer (user_id, mission_id) VALUES ?';
                pool.query(insertViewersQuery, [viewerValues], (viewerErr, viewerResult) => {
                    if (viewerErr) {
                        console.error(viewerErr);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }

                    res.status(200).json({ missionId }); // Return the ID of the newly inserted mission
                });
            });
        });
    });
};

// Function to retrieve a mission by ID
exports.getMissionById = (authToken, missionId, callback) => {
    // Get user ID from the authentication token
    const userName = getUserFromToken(authToken);
    getUserIdFromName(userName, (userIdErr, userId) => {
        if (userIdErr) {
            console.error(userIdErr);
            return callback({ message: 'Internal Server Error' });
        }

        // Query to retrieve a mission by its ID
        const missionQuery = 'SELECT * FROM mission WHERE mission_id = ?';
        pool.query(missionQuery, [missionId], (missionErr, missionResults) => {
            if (missionErr) {
                console.error(missionErr);
                return callback({ message: 'Internal Server Error' });
            }
            if (missionResults.length === 0) {
                return callback({ message: 'Mission not found' });
            }

            // Query to retrieve supervisors for the mission
            const supervisorQuery = 'SELECT * FROM supervisor WHERE mission_id = ?';
            pool.query(supervisorQuery, [missionId], (supervisorErr, supervisorResults) => {
                if (supervisorErr) {
                    console.error(supervisorErr);
                    return callback({ message: 'Internal Server Error' });
                }

                // Query to retrieve viewers for the mission
                const viewerQuery = 'SELECT * FROM viewer WHERE mission_id = ?';
                pool.query(viewerQuery, [missionId], (viewerErr, viewerResults) => {
                    if (viewerErr) {
                        console.error(viewerErr);
                        return callback({ message: 'Internal Server Error' });
                    }

                    // Combine all information into a single object
                    const missionData = {
                        mission: missionResults[0],
                        supervisors: supervisorResults,
                        viewers: viewerResults
                    };

                    callback(null, missionData); // Return the mission data
                });
            });
        });
    });
};


exports.getMissionsByCreatorId = (authToken, callback) => {
    // Get user ID from the authentication token
    const userName = getUserFromToken(authToken);
    getUserIdFromName(userName, (userIdErr, userId) => {
        if (userIdErr) {
            console.error(userIdErr);
            return callback({ message: 'Internal Server Error' });
        }

        // Query to retrieve missions by creator ID along with associated supervisor and viewer information
        const query = `
            SELECT 
                mission.*, 
                GROUP_CONCAT(DISTINCT supervisor.user_id) AS supervisor_ids,
                GROUP_CONCAT(DISTINCT viewer.user_id) AS viewer_ids
            FROM 
                mission 
            LEFT JOIN 
                supervisor ON mission.mission_id = supervisor.mission_id
            LEFT JOIN 
                viewer ON mission.mission_id = viewer.mission_id
            WHERE 
                mission.creator_id = ?
            GROUP BY 
                mission.mission_id
        `;
        pool.query(query, [userId], (err, results) => {
            if (err) {
                console.error(err);
                return callback({ message: 'Internal Server Error' });
            }
            callback(null, results); // Return the list of missions with associated supervisor and viewer IDs
        });
    });
};


exports.getMissionsBySupervisorId = (authToken, callback) => {
    // Get the user ID from the authentication token
    const userName = getUserFromToken(authToken);
    getUserIdFromName(userName, (userIdErr, userId) => {
        if (userIdErr) {
            console.error(userIdErr);
            return callback({ message: 'Internal Server Error' });
        }

        // Query to retrieve missions by supervisor ID along with associated supervisor and viewer information
        const query = `
            SELECT 
                mission.*, 
                GROUP_CONCAT(DISTINCT supervisor.user_id) AS supervisor_ids,
                GROUP_CONCAT(DISTINCT viewer.user_id) AS viewer_ids
            FROM 
                mission 
            LEFT JOIN 
                supervisor ON mission.mission_id = supervisor.mission_id
            LEFT JOIN 
                viewer ON mission.mission_id = viewer.mission_id
            WHERE 
                ? IN (supervisor.user_id)
            GROUP BY 
                mission.mission_id
        `;
        pool.query(query, [userId], (err, results) => {
            if (err) {
                console.error(err);
                return callback({ message: 'Internal Server Error' });
            }
            callback(null, results); // Return the missions with associated supervisor and viewer information
        });
    });
};

// Function to update a mission
exports.updateMission = (authToken, missionId, newData, callback) => {
    // Check if the user has a mission creator role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isMissionCreator) => {
        if (roleErr) {
            console.error(roleErr);
            return callback({ message: 'Internal Server Error' });
        }

        if (!isMissionCreator) {
            return callback({ message: 'Unauthorized: Only mission creators can update missions' });
        }

        // Query to update a mission by its ID
        const updateMissionQuery = 'UPDATE mission SET ? WHERE mission_id = ?';
        pool.query(updateMissionQuery, [newData, missionId], (err, results) => {
            if (err) {
                console.error(err);
                return callback({ message: 'Internal Server Error' });
            }
            if (results.affectedRows === 0) {
                return callback({ message: 'Mission not found' });
            }

            // Update the supervisor and viewer tables
            async.parallel([
                (parallelCallback) => {
                    // Update supervisor table
                    const updateSupervisorQuery = 'UPDATE supervisor SET ? WHERE mission_id = ?';
                    pool.query(updateSupervisorQuery, [newData, missionId], (err, results) => {
                        if (err) {
                            console.error(err);
                            return parallelCallback({ message: 'Internal Server Error' });
                        }
                        parallelCallback(null);
                    });
                },
                (parallelCallback) => {
                    // Update viewer table
                    const updateViewerQuery = 'UPDATE viewer SET ? WHERE mission_id = ?';
                    pool.query(updateViewerQuery, [newData, missionId], (err, results) => {
                        if (err) {
                            console.error(err);
                            return parallelCallback({ message: 'Internal Server Error' });
                        }
                        parallelCallback(null);
                    });
                }
            ], (parallelErr) => {
                if (parallelErr) {
                    return callback(parallelErr);
                }
                callback(null); // Success
            });
        });
    });
};

// Function to delete a mission
exports.deleteMission = (authToken, missionId, callback) => {
    // Check if the user has a mission creator role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isMissionCreator) => {
        if (roleErr) {
            console.error(roleErr);
            return callback({ message: 'Internal Server Error' });
        }

        if (!isMissionCreator) {
            return callback({ message: 'Unauthorized: Only mission creators can delete missions' });
        }

        async.parallel([
            // Delete from supervisor table
            (parallelCallback) => {
                const deleteSupervisorQuery = 'DELETE FROM supervisor WHERE mission_id = ?';
                pool.query(deleteSupervisorQuery, [missionId], (err, results) => {
                    if (err) {
                        console.error(err);
                        return parallelCallback({ message: 'Internal Server Error' });
                    }
                    parallelCallback(null);
                });
            },
            // Delete from viewer table
            (parallelCallback) => {
                const deleteViewerQuery = 'DELETE FROM viewer WHERE mission_id = ?';
                pool.query(deleteViewerQuery, [missionId], (err, results) => {
                    if (err) {
                        console.error(err);
                        return parallelCallback({ message: 'Internal Server Error' });
                    }
                    parallelCallback(null);
                });
            },
            // Delete from mission table
            (parallelCallback) => {
                const deleteMissionQuery = 'DELETE FROM mission WHERE mission_id = ?';
                pool.query(deleteMissionQuery, [missionId], (err, results) => {
                    if (err) {
                        console.error(err);
                        return parallelCallback({ message: 'Internal Server Error' });
                    }
                    if (results.affectedRows === 0) {
                        return parallelCallback({ message: 'Mission not found' });
                    }
                    parallelCallback(null);
                });
            }
        ], (parallelErr) => {
            if (parallelErr) {
                return callback(parallelErr);
            }
            callback(null); // Success
        });
    });
};

