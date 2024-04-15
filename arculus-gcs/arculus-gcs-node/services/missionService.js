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

exports.createMission = async (req, res) => {
    try {
        var { authToken, mission_config, supervisors, viewers } = req.body;

        const username = getUserFromToken(authToken);
        const isMissionCreator = await isUserOfType(username, ['Mission Creator']);
        if (!isMissionCreator) {
            console.error('Unauthorized: Only mission creators can create missions');
            return res.status(401).json({ message: 'Unauthorized: Only mission creators can create missions' });
        }

        const creatorId = await getUserIdFromName(username);
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const insertMissionQuery = `INSERT INTO mission (creator_id, mission_config) VALUES (?, ?)`;
        const missionResult = await new Promise((resolve, reject) => {
            pool.query(insertMissionQuery, [creatorId, mission_config], (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });

        const missionId = missionResult.insertId;

        if (supervisors && supervisors.length > 0) {
            const supervisorValues = supervisors.map(supervisorId => [supervisorId, missionId]);
            const insertSupervisorsQuery = 'INSERT INTO supervisor (user_id, mission_id) VALUES ?';
            await new Promise((resolve, reject) => {
                pool.query(insertSupervisorsQuery, [supervisorValues], (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        }

        if (viewers && viewers.length > 0) {
            const viewerValues = viewers.map(viewerId => [viewerId, missionId]);
            const insertViewersQuery = 'INSERT INTO viewer (user_id, mission_id) VALUES ?';
            await new Promise((resolve, reject) => {
                pool.query(insertViewersQuery, [viewerValues], (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        }

        res.status(200).json({ missionId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
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
                    const mission_config = {
                        mission: missionResults[0],
                        supervisors: supervisorResults,
                        viewers: viewerResults
                    };

                    callback(null, mission_config); // Return the mission data
                });
            });
        });
    });
};


exports.getMissionsByCreatorId = async (req, res) => {
    const authToken = req.query.authToken;

    // Get user ID from token
    const creatorId = await getUserIdFromName(getUserFromToken(authToken));

    // Query to fetch missions, supervisors, and viewers
    const selectMissionsQuery = `
    SELECT 
        m.mission_config AS config,
        GROUP_CONCAT(DISTINCT u1.username) AS supervisors,
        GROUP_CONCAT(DISTINCT u2.username) AS viewers
    FROM 
        mission AS m
    LEFT JOIN 
        supervisor AS s ON m.mission_id = s.mission_id
    LEFT JOIN 
        viewer AS v ON m.mission_id = v.mission_id
    LEFT JOIN 
        user AS u1 ON s.user_id = u1.user_id
    LEFT JOIN 
        user AS u2 ON v.user_id = u2.user_id
    WHERE 
        m.creator_id = ?
    GROUP BY 
        m.mission_config;`;

    pool.query(selectMissionsQuery, [creatorId], (err, missionsResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Check if missionsResult is not null and contains rows
        if (missionsResult && missionsResult.length > 0) {
            // Map rows to missions array
            const missions = missionsResult.map(row => {
                return {
                    config: row.config,
                    supervisors: row.supervisors? row.supervisors.split(','): [], // Split supervisors by comma
                    viewers: row.viewers ? row.viewers.split(','): [] // Split viewers by comma
                };
            });

            res.status(200).json({ missions });
        } else {
            res.status(404).json({ message: 'No missions found for the given creator' });
        }
    });
};

exports.getMissionsBySupervisorId = async (req, res) => {
    const authToken = req.query.authToken;

    // Get user ID from token
    const supervisorId = await getUserIdFromName(getUserFromToken(authToken));

    // Query to fetch missions for the given supervisor
    const selectMissionsQuery = `
    SELECT 
        m.mission_config AS config,
        GROUP_CONCAT(DISTINCT u.username) AS supervisors,
        GROUP_CONCAT(DISTINCT vu.username) AS viewers
    FROM 
        mission AS m
    LEFT JOIN 
        supervisor AS s ON m.mission_id = s.mission_id
    LEFT JOIN 
        viewer AS v ON m.mission_id = v.mission_id
    LEFT JOIN 
        user AS u ON s.user_id = u.user_id
    LEFT JOIN 
        user AS vu ON v.user_id = vu.user_id
    WHERE 
        s.user_id = ?
    GROUP BY 
        m.mission_config;
`;

    pool.query(selectMissionsQuery, [supervisorId], (err, missionsResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Check if missionsResult is not null and contains rows
        if (missionsResult && missionsResult.length > 0) {
            // Map rows to missions array
            const missions = missionsResult.map(row => {
                return {
                    config: row.config,
                    supervisors: row.supervisors? row.supervisors.split(','): [], // Split supervisors by comma
                    viewers: row.viewers ? row.viewers.split(','): [] // Split viewers by comma
                };
            });

            res.status(200).json({ missions });
        } else {
            res.status(404).json({ message: 'No missions found for the given supervisor' });
        }
    });
};

exports.getMissionsByViewerId = async (req, res) => {
    const authToken = req.query.authToken;

    // Get user ID from token
    const viewerId = await getUserIdFromName(getUserFromToken(authToken));

    // Query to fetch missions for the given viewer
    const selectMissionsQuery = `
    SELECT 
        m.mission_config AS config,
        GROUP_CONCAT(DISTINCT u.username) AS supervisors,
        GROUP_CONCAT(DISTINCT vu.username) AS viewers
    FROM 
        mission AS m
    LEFT JOIN 
        supervisor AS s ON m.mission_id = s.mission_id
    LEFT JOIN 
        viewer AS v ON m.mission_id = v.mission_id
    LEFT JOIN 
        user AS u ON s.user_id = u.user_id
    LEFT JOIN 
        user AS vu ON v.user_id = vu.user_id
    WHERE 
        vu.user_id = ?
    GROUP BY 
        m.mission_config;
`;

    pool.query(selectMissionsQuery, [viewerId], (err, missionsResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Check if missionsResult is not null and contains rows
        if (missionsResult && missionsResult.length > 0) {
            // Map rows to missions array
            const missions = missionsResult.map(row => {
                return {
                    config: row.config,
                    supervisors: row.supervisors? row.supervisors.split(','): [], // Split supervisors by comma
                    viewers: row.viewers ? row.viewers.split(','): [] // Split viewers by comma
                };
            });

            res.status(200).json({ missions });
        } else {
            res.status(404).json({ message: 'No missions found for the given viewer' });
        }
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

