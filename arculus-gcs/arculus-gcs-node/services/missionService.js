const { isUserOfType, getUserFromToken, getUserIdFromName } = require('./authService');
const pool = require('../modules/arculusDbConnection');
const fs = require('fs');
const { execSync, exec } = require('child_process');
const { addNetworkPolicyDuringMission, deleteNetworkPolicyDuringMission } = require('./policyService');
const async = require('async');
const path = require('path');
const crypto = require('crypto');
const cryptSecret = fs.readFileSync('configs/ENCRYPTION_SECRET.txt', 'utf8').trim();

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
var ipCache = [];

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
                setTimeout(incrementCoordinates, 3000);
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
        const { authToken, mission_config, supervisors, viewers } = req.body;

        const username = getUserFromToken(authToken);
        isUserOfType(username, ['Mission Creator'], async (err, isMissionCreator) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (!isMissionCreator) {
                console.error('Unauthorized: Only mission creators can create missions');
                return res.status(401).json({ message: 'Unauthorized: Only mission creators can create missions' });
            }

            const creatorId = await getUserIdFromName(username);
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const insertMissionQuery = `INSERT INTO mission (creator_id, mission_config, state) VALUES (?, ?, 'CREATED')`;
            const missionResult = await executeQuery(insertMissionQuery, [creatorId, mission_config]);

            const missionId = missionResult.insertId;

            if (supervisors && supervisors.length > 0) {
                const supervisorValues = supervisors.map(supervisorId => [supervisorId, missionId]);
                const insertSupervisorsQuery = 'INSERT INTO supervisor (user_id, mission_id) VALUES ?';
                await executeQuery(insertSupervisorsQuery, [supervisorValues]);
            }

            if (viewers && viewers.length > 0) {
                const viewerValues = viewers.map(viewerId => [viewerId, missionId]);
                const insertViewersQuery = 'INSERT INTO viewer (user_id, mission_id) VALUES ?';
                await executeQuery(insertViewersQuery, [viewerValues]);
            }

            res.status(200).json({ missionId });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const executeQuery = (query, values) => {
    return new Promise((resolve, reject) => {
        pool.query(query, values, (err, result) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(result);
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

    // Query to fetch missions, supervisors, viewers, and state
    const selectMissionsQuery = `
    SELECT 
        m.mission_config AS config, 
        m.state,
        m.mission_id,
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
        m.mission_config, m.state, m.mission_id;`;

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
                    state: row.state,
                    supervisors: row.supervisors ? row.supervisors.split(',') : [], // Split supervisors by comma
                    viewers: row.viewers ? row.viewers.split(',') : [], // Split viewers by comma
                    mission_id: row.mission_id
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

    // Query to fetch missions for the given supervisor, including state
    const selectMissionsQuery = `
    SELECT 
        m.mission_config AS config,
        m.state,
        m.mission_id,
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
        m.mission_config, m.state, m.mission_id;
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
                    state: row.state,
                    supervisors: row.supervisors ? row.supervisors.split(',') : [], // Split supervisors by comma
                    viewers: row.viewers ? row.viewers.split(',') : [] // Split viewers by comma
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

    // Query to fetch missions for the given viewer, including state
    const selectMissionsQuery = `
    SELECT 
        m.mission_config AS config,
        m.state,
        m.mission_id,
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
        m.mission_config, m.state, m.mission_id;
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
                    state: row.state,
                    supervisors: row.supervisors ? row.supervisors.split(',') : [], // Split supervisors by comma
                    viewers: row.viewers ? row.viewers.split(',') : [] // Split viewers by comma
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

exports.deleteMission = (req, res) => {
    const { authToken, missionId } = req.body;

    // Check if the user has a mission creator role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isMissionCreator) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).send({ message: 'Internal Server Error' });
        }

        if (!isMissionCreator) {
            return res.status(403).send({ message: 'Unauthorized: Only mission creators can delete missions' });
        }

        // Use async waterfall to ensure sequential execution of database operations
        async.waterfall([
            // Delete from supervisor table
            (waterfallCallback) => {
                const deleteSupervisorQuery = 'DELETE FROM supervisor WHERE mission_id = ?';
                pool.query(deleteSupervisorQuery, [missionId], (err, results) => {
                    if (err) {
                        console.error(err);
                        return waterfallCallback({ message: 'Error deleting from supervisor table' });
                    }
                    waterfallCallback(null);
                });
            },
            // Delete from viewer table
            (waterfallCallback) => {
                const deleteViewerQuery = 'DELETE FROM viewer WHERE mission_id = ?';
                pool.query(deleteViewerQuery, [missionId], (err, results) => {
                    if (err) {
                        console.error(err);
                        return waterfallCallback({ message: 'Error deleting from viewer table' });
                    }
                    waterfallCallback(null);
                });
            },
            // Delete from mission table
            (waterfallCallback) => {
                const deleteMissionQuery = 'DELETE FROM mission WHERE mission_id = ?';
                pool.query(deleteMissionQuery, [missionId], (err, results) => {
                    if (err) {
                        console.error(err);
                        return waterfallCallback({ message: 'Error deleting from mission table' });
                    }
                    if (results.affectedRows === 0) {
                        return waterfallCallback({ message: 'Mission not found' });
                    }
                    waterfallCallback(null);
                });
            }
        ], (waterfallErr) => {
            if (waterfallErr) {
                return res.status(500).send(waterfallErr);
            }
            res.status(200).send({ message: 'Mission successfully deleted' });
        });
    });
};


exports.getMissionState = (req, res) => {
    const { deviceName } = req.query;

    try {
        // Execute kubectl exec command synchronously
        const command = `kubectl exec ${deviceName} -n default -- cat mission_state.json`;
        const missionStateJson = execSync(command, { encoding: 'utf-8' });

        // Attempt to parse mission state JSON
        try {
            const missionState = JSON.parse(missionStateJson);
            res.status(200).json(missionState);
        } catch (parseError) {
            // If parsing fails, return the response as is
            // console.error('Parsing Error:', parseError);
            res.status(200).send(missionStateJson);
        }
    } catch (error) {
        // Handle other errors
        if (error.stderr) {
            console.error('Error:', error.stderr);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

exports.executeStealthyReconAndResupply = (req, res) => {
    const { gcX, gcY, destX, destY, controller, supplyDrone, surveillanceDrone, relayDrone, missionId } = req.body;

    const executeKubectlExecAndGetIP = (podName, callback) => {
        exec(`kubectl get pod ${podName} -n default -o json`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error:', stderr || error);
                callback(error);
                return;
            }
            const podInfo = JSON.parse(stdout);
            const podIP = podInfo.status.podIP;
            callback(null, podIP);
        });
    };

    res.status(200).json({ message: 'IP retrieval initiated' });

    executeKubectlExecAndGetIP(supplyDrone, (error, supplyDroneIP) => {
        if (error) {
            console.error('Error fetching supplyDrone IP:', error);
            res.status(500).json({ message: 'Failed to fetch IP for supply drone.' });
            return;
        }

        executeKubectlExecAndGetIP(surveillanceDrone, (error, surveillanceDroneIP) => {
            if (error) {
                console.error('Error fetching surveillanceDrone IP:', error);
                res.status(500).json({ message: 'Failed to fetch IP for surveillance drone.' });
                return;
            }
            executeKubectlExecAndGetIP(relayDrone, (error, relayDroneIP) => {
                if (error) {
                    console.error('Error fetching relayDrone IP:', error);
                    res.status(500).json({ message: 'Failed to fetch IP for relayDrone.' });
                    return;
                }

                const updateQueryInProgress = 'UPDATE mission SET state = ? WHERE mission_id = ?';
                pool.query(updateQueryInProgress, ['IN EXECUTION', missionId], (error, results) => {
                    if (error) {
                        console.error('Database Error:', error);
                        res.status(500).json({ message: 'Database error while updating mission status.' });
                        return;
                    }
                    console.log('Mission status updated to IN EXECUTION.');

                    Promise.all([
                        addNetworkPolicyDuringMission(surveillanceDrone, [{ "device": controller, "port": "3050", "protocol": 'TCP' }, { "device": relayDrone, "port": "3050", "protocol": 'TCP' }], [{ "device": controller, "port": "6001", "protocol": 'UDP' }]),
                        addNetworkPolicyDuringMission(supplyDrone, [{ "device": controller, "port": "4050", "protocol": 'TCP' }, { "device": relayDrone, "port": "4050", "protocol": 'TCP' }], [{ "device": controller, "port": "6002", "protocol": 'UDP' }]),
                        addNetworkPolicyDuringMission(relayDrone, [{ "device": controller, "port": "5050", "protocol": 'TCP' }], [{ "device": controller, "port": "6003", "protocol": 'UDP' }]),
                        addNetworkPolicyDuringMission(controller, [{ "device": supplyDrone, "port": "6002", "protocol": 'UDP' }, { "device": surveillanceDrone, "port": "6001", "protocol": 'UDP' }, { "device": relayDrone, "port": "6003", "protocol": 'UDP' }], [{ "device": relayDrone, "port": "5050", "protocol": 'TCP' }, { "device": surveillanceDrone, "port": "3050", "protocol": 'TCP' }, { "device": supplyDrone, "port": "4050", "protocol": 'TCP' }])
                    ]).then(() => {
                        // Introduce a 2-second delay before executing the next steps
                        ipCache[relayDrone] = relayDroneIP;
                        ipCache[surveillanceDrone] = surveillanceDroneIP;
                        ipCache[supplyDrone] = supplyDroneIP;
                        const command = `kubectl exec ${controller} -n default -- python3 controller.py ${gcX} ${gcY} ${destX} ${destY} ${surveillanceDroneIP} ${supplyDroneIP} ${relayDroneIP}`;
                        console.log('Executing command:', command);

                        exec(command, (error, stdout, stderr) => {
                            if (error) {
                                console.error('Error executing command:', stderr || error);
                                const updateQueryFailed = 'UPDATE mission SET state = ? WHERE mission_id = ?';
                                pool.query(updateQueryFailed, ['ABORTED', missionId], (err, results) => {
                                    if (err) {
                                        console.error('Database Error:', err);
                                        res.status(500).json({ message: 'Database error while updating mission to ABORTED.' });
                                    } else {
                                        deleteNetworkPolicyDuringMission(`policy-${controller}`);
                                        deleteNetworkPolicyDuringMission(`policy-${relayDrone}`);
                                        deleteNetworkPolicyDuringMission(`policy-${surveillanceDrone}`);
                                        deleteNetworkPolicyDuringMission(`policy-${supplyDrone}`);
                                        exec(`kubectl exec ${controller} -n default -- sh -c 'echo "" > mission_state.json'`);
                                        exec(`kubectl exec ${controller} -n default -- sh -c 'echo "connected" > survState.txt'`);
                                        exec(`kubectl exec ${controller} -n default -- sh -c 'echo "connected" > supState.txt'`);
                                        console.log('Mission status updated to ABORTED.');
                                        res.status(200).json({ message: 'Mission failed during execution.' });
                                    }
                                });
                                return;
                            }
                            console.log('Script executed successfully:', stdout);
                            const updateQuerySuccessful = 'UPDATE mission SET state = ? WHERE mission_id = ?';
                            pool.query(updateQuerySuccessful, ['SUCCESSFUL', missionId], (err, results) => {
                                if (err) {
                                    console.error('Database Error:', err);
                                    res.status(500).json({ message: 'Database error while updating mission to SUCCESSFUL.' });
                                } else {
                                    deleteNetworkPolicyDuringMission(`policy-${controller}`);
                                    deleteNetworkPolicyDuringMission(`policy-${relayDrone}`);
                                    deleteNetworkPolicyDuringMission(`policy-${surveillanceDrone}`);
                                    deleteNetworkPolicyDuringMission(`policy-${supplyDrone}`);
                                    console.log('Mission status updated to SUCCESSFUL.');
                                    // res.status(200).json({ message: 'Mission executed successfully.' });
                                }
                            });
                        });
                    }).catch((error) => {
                        console.error('Failed to apply network policies:', error);
                        // res.status(500).json({ message: 'Failed to apply network policies.' });
                    });
                });
            });
        });
    });
};


exports.simulateBadNetwork = (req, res) => {
    const { controller, type } = req.body;
    const drone = `${type}State.txt`;
    const command = `kubectl exec ${controller} -n default -- sh -c 'echo "disconnected" > ${drone}'`;
    console.log(command);
    exec(command);
    // Start the process and send an initial response
    res.status(200).json({ message: 'Network simulation initiated' });
};

exports.simulateGpsSpoofing = (req, res) => {
    const { controller, device, slope, distance } = req.body;
    const drone = device == 'surv' ? "spoofGpsSurv.txt" : "spoofGpsSup.txt";
    const command = `kubectl exec ${controller} -n default -- sh -c 'echo "${slope},${distance}" > ${drone}'`;
    console.log(command);
    exec(command);
    // Start the process and send an initial response
    res.status(200).json({ message: 'GPS Spoofing simulation initiated' });
};

exports.simulatePhysicalCapture = (req, res) => {
    const {device} = req.body;
    deleteNetworkPolicyDuringMission(`policy-${device}`);
    res.status(200).json({message: "Physical Capture simulation successful"});
}

exports.downloadMissionManifest = (req, res) => {
    const authToken = req.query.authToken;

    // Check if the user has a mission creator role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isMissionCreator) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).send({ message: 'Internal Server Error' });
        }

        if (!isMissionCreator) {
            return res.status(403).send({ message: 'Unauthorized: Only mission creators can download manifests' });
        }

        const algorithm = 'aes-256-ctr';
        const iv = crypto.randomBytes(16); // Initialization vector

        // Encrypt function
        const encrypt = (text) => {
            const cipher = crypto.createCipheriv(algorithm, cryptSecret, iv);
            const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
            return encrypted;
        };

        // Encrypt the request body
        const encryptedData = encrypt(JSON.stringify(req.body));

        // Prepare the file path in a temp directory with timestamp
        const timestamp = Date.now();
        const directoryPath = path.join(__dirname, 'tmp');
        const filePath = path.join(directoryPath, `manifest_${timestamp}.mconf`);

        // Write the encrypted data to the file
        fs.mkdir(directoryPath, { recursive: true }, (dirErr) => {
            if (dirErr) {
                console.error('Error creating directory:', dirErr);
                return res.status(500).send('Internal Server Error');
            }

            fs.writeFile(filePath, Buffer.concat([iv, encryptedData]), (err) => {
                if (err) {
                    console.error('Error while writing encrypted file:', err);
                    return res.status(500).send('Internal Server Error');
                }

                res.download(filePath, `manifest_${timestamp}.mconf`, (downloadErr) => {
                    if (downloadErr) {
                        console.error('Error while downloading the file:', downloadErr);
                        res.status(500).send('Internal Server Error');
                    }

                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error('Error while deleting the file:', unlinkErr);
                        }
                    });
                });
            });
        });
    });
};

exports.uploadMissionManifest = (req, res) => {
    const authToken = req.query.authToken;

    // Check if the user has a mission creator role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isMissionCreator) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).send({ message: 'Internal Server Error' });
        }

        if (!isMissionCreator) {
            return res.status(403).send({ message: 'Unauthorized: Only mission creators can upload manifests' });
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.files.uploadedFile;
        const fileBuffer = file.data;

        const algorithm = 'aes-256-ctr';
        const iv = fileBuffer.slice(0, 16);

        if (iv.length !== 16) {
            return res.status(400).send('Invalid IV length. Expected IV length: 16 bytes.');
        }
        const encryptedData = fileBuffer.slice(16);

        const decrypt = (encryptedBuffer) => {
            const decipher = crypto.createDecipheriv(algorithm, cryptSecret, iv);
            const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
            return decrypted;
        };

        const decryptedData = decrypt(encryptedData);

        try {
            const jsonData = JSON.parse(decryptedData.toString());
            res.json(jsonData);
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).send('Error parsing JSON');
        }
    });
};

