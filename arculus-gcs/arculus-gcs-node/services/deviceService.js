const { isUserOfType, getUserFromToken } = require('./authService');
const pool = require('../modules/arculusDbConnection');
const { exec } = require('child_process');
const ip = require('ip');
const fs = require('fs');
const temp = require('temp').track();

var requestList = {};
var acceptedList = {};
var blockList = {};

const imageMap = JSON.parse(fs.readFileSync('configs/dockerImageConfig.json'));

// WebSocket server
// joinReqsWss.on('connection', 
exports.joinReqsWebSocket = (ws, req) => {
    console.log('WebSocket client connected');

    // Send the initial message immediately
    ws.send(JSON.stringify(requestList));

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });

    // Schedule subsequent updates every 5 seconds
    const updateInterval = setInterval(() => {
        ws.send(JSON.stringify(requestList));
    }, 5000);

    // Stop sending updates when the client disconnects
    ws.on('close', () => {
        clearInterval(updateInterval);
    });
};


exports.joinStatusWebSocket = (ws, req) => {
    console.log('WebSocket client connected');

    // Parse query parameters from the URL
    const nodeName = new URLSearchParams(req.url.split('?')[1]).get('nodeName');

    // Initial message
    ws.send("Request submitted. Please hang on until an administrator approves your request.");

    // Handle WebSocket connection close
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });

    // Check for nodeName in acceptedList
    const checkNodeInterval = setInterval(() => {
        if (Object.values(acceptedList).includes(nodeName)) {
            // If nodeName is found, send success message and close the WebSocket
            ws.send("Join Successful");
            clearInterval(checkNodeInterval); // Stop the interval
            ws.close();
        }
        else if (Object.values(blockList).includes(nodeName)) {
            ws.send("Request Declined");
            clearInterval(checkNodeInterval); // Stop the interval
            ws.close();
        }
    }, 5000); // Check every 5 seconds
};

// Function to get task IDs by task names
const getTaskIdsByName = (taskNames) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT task_id FROM task WHERE task_name IN (?)', [taskNames], (queryErr, results) => {
            if (queryErr) {
                reject(queryErr);
            } else {
                const taskIds = results.map(result => result.task_id);
                resolve(taskIds);
            }
        });
    });
};

// Function to insert rows in the device_task table
const insertDeviceTasks = (deviceId, taskIds) => {
    return new Promise((resolve, reject) => {
        const values = taskIds.map(taskId => [deviceId, taskId]);

        pool.query('INSERT INTO device_task (device_id, task_id) VALUES ?', [values], (insertErr) => {
            if (insertErr) {
                reject(insertErr);
            } else {
                resolve();
            }
        });
    });
};

// Function to get the existing device tasks
const getDeviceTasks = (deviceId) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT task_id FROM device_task WHERE device_id = ?', [deviceId], (queryErr, results) => {
            if (queryErr) {
                reject(queryErr);
            } else {
                const taskIds = results.map(result => result.task_id);
                resolve(taskIds);
            }
        });
    });
};

// Function to delete device tasks
const deleteDeviceTasks = (deviceId, taskIdsToDelete) => {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM device_task WHERE device_id = ? AND task_id IN (?)', [deviceId, taskIdsToDelete], (deleteErr) => {
            if (deleteErr) {
                reject(deleteErr);
            } else {
                resolve();
            }
        });
    });
};

// Function to insert a trusted device and get the device ID
const insertTrustedDevice = (deviceName, ipAddress, deviceType) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO trusted_device (device_name, ip_address, device_type) VALUES (?, ?, ?)', [deviceName, ipAddress, deviceType], (insertErr, result) => {
            if (insertErr) {
                reject(insertErr);
            } else {
                resolve(result);
            }
        });
    });
};

// Function to get device_id by device name
const getDeviceIdByName = (deviceName) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT device_id FROM trusted_device WHERE device_name = ?', [deviceName], (queryErr, results) => {
            if (queryErr) {
                reject(queryErr);
            } else if (results.length === 0) {
                reject({ message: 'Device not found' });
            } else {
                resolve(results[0].device_id);
            }
        });
    });
};

// Function to find a trusted device by device name
const findTrustedDeviceByName = (deviceName) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM trusted_device WHERE device_name = ?', [deviceName], (queryErr, results) => {
            if (queryErr) {
                reject(queryErr);
            } else {
                resolve(results[0]);
            }
        });
    });
};

// Function to update device name and IP address
const updateDevice = (deviceId, newDeviceName, newIpAddress) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE trusted_device SET device_name = ?, ip_address = ? WHERE device_id = ?', [newDeviceName, newIpAddress, deviceId], (updateErr) => {
            if (updateErr) {
                reject(updateErr);
            } else {
                resolve();
            }
        });
    });
};

function calculateSubnetRange(ipAddress, subnetMask) {
    const subnet = ip.subnet(ipAddress, subnetMask);
    return subnet;
}

function generateIPRange(startIP, endIP) {
    const start = startIP.split('.').map(Number);
    const end = endIP.split('.').map(Number);
    const result = [];

    for (let i = start[0]; i <= end[0]; i++) {
        for (let j = start[1]; j <= end[1]; j++) {
            for (let k = start[2]; k <= end[2]; k++) {
                for (let l = start[3]; l <= end[3]; l++) {
                    result.push(`http://${i}.${j}.${k}.${l}:*`);
                    result.push(`https://${i}.${j}.${k}.${l}:*`);
                }
            }
        }
    }

    return result;
}

try {

    const networkInterfaces = require('os').networkInterfaces();
    const subnetMask = networkInterfaces['eth0'][0].netmask;
    const subnetRange = calculateSubnetRange(hostIp, subnetMask);
    subnetIps = generateIPRange(subnetRange.firstAddress, subnetRange.lastAddress);
    exports.subnetIps = subnetIps;
} catch (error) {
    console.error('Error:', error.message);
}

exports.getTrustedDevices = (req, res) => {
    const { authToken } = req.query;
    const username = getUserFromToken(authToken);

    // Execute the kubectl command to get running pods
    exec('kubectl get pods --namespace=default -o json', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing kubectl: ${error}`);
            res.status(500).send('Failed to fetch pod information');
            return;
        }

        const podInfo = JSON.parse(stdout).items.map(pod => ({
            name: pod.metadata.name,
            ip: pod.status.podIP,
        }));

        const podNames = podInfo.map(pod => pod.name);
        const podIPs = podInfo.map(pod => pod.ip);

        pool.getConnection(function (err, connection) {
            if (err) throw err;

            connection.beginTransaction(function (err) {
                if (err) throw err;

                connection.query('SELECT user_id FROM user WHERE username = ? LIMIT 1', [username], function (err, userRows) {
                    if (err) {
                        connection.rollback(function () {
                            throw err;
                        });
                    }

                    if (userRows.length === 0 || userRows === undefined || !userRows[0].user_id) {
                        res.status(400).send('User not found');
                        connection.rollback(function () {
                            connection.release();
                        });
                        return;
                    }
                    const userId = userRows[0].user_id;

                    if (podNames.length === 0 || podIPs.length === 0) {
                        // Handle the case where there are no pod names or IP addresses
                        connection.release();
                        res.json([]); // Return an empty array or handle it as needed
                    } else {
                        connection.query(`
                            SELECT device_id, device_name, ip_address, personnel_rank, device_type
                            FROM trusted_device
                            WHERE device_name IN (?) AND ip_address IN (?)
                        `, [podNames, podIPs], function (err, deviceRows) {
                            if (err) {
                                connection.rollback(function () {
                                    throw err;
                                });
                            } else {
                                const deviceIds = deviceRows.map(device => device.device_id);

                                if (deviceIds.length === 0) {
                                    // No trusted devices found, return an empty array
                                    connection.release();
                                    res.json([]);
                                    return;
                                }

                                // Fetch tasks for each device
                                connection.query(`
                                    SELECT dt.device_id, t.task_name
                                    FROM device_task dt
                                    INNER JOIN task t ON dt.task_id = t.task_id
                                    WHERE dt.device_id IN (?)
                                `, [deviceIds], function (err, taskRows) {
                                    if (err) {
                                        connection.rollback(function () {
                                            throw err;
                                        });
                                    } else {
                                        connection.release();

                                        // Organize tasks by device_id
                                        const tasksByDevice = {};
                                        taskRows.forEach(task => {
                                            if (!tasksByDevice[task.device_id]) {
                                                tasksByDevice[task.device_id] = [];
                                            }
                                            tasksByDevice[task.device_id].push(task.task_name);
                                        });

                                        // Merge tasks into deviceRows
                                        const devicesWithTasks = deviceRows.map(device => ({
                                            ...device,
                                            allowedTasks: tasksByDevice[device.device_id] || [],
                                        }));

                                        res.json(devicesWithTasks);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    });
};

function getK3sNodes(callback) {
    exec('kubectl get nodes -o json', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing kubectl: ${error.message}`);
            callback(error, null);
            return;
        }

        try {
            const nodeData = JSON.parse(stdout);

            const nodeList = nodeData.items
                .filter((node) => {
                    return node.status.conditions.some((condition) => {
                        return condition.type === 'Ready' && condition.status === 'True';
                    });
                })
                .map((node) => {
                    return {
                        nodeName: node.metadata.name,
                        nodeIP: node.status.addresses.find((addr) => addr.type === 'InternalIP').address,
                    };
                });

            callback(null, nodeList);
        } catch (err) {
            console.error(`Error parsing JSON: ${err.message}`);
            callback(err, null);
        }
    });
}

// Route to handle user update without changing password
exports.getMoreNodes = (req, res) => {
    const { authToken } = req.query;
    const username = getUserFromToken(authToken);

    pool.getConnection((err, connection) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                connection.release();
                return;
            }

            connection.query('SELECT user_id FROM user WHERE username = ? LIMIT 1', [username], (err, userRows) => {
                if (err) {
                    console.error(err);
                    connection.rollback(() => {
                        res.status(500).send('Internal Server Error');
                        connection.release();
                    });
                    return;
                }

                if (userRows.length === 0 || userRows === undefined || !userRows[0].user_id) {
                    res.status(400).send('User not found');
                    connection.rollback(() => {
                        connection.release();
                    });
                    return;
                }

                // Call the getK3sNodes function to get nodes
                getK3sNodes((error, nodeList) => {
                    if (error) {
                        // Handle the error, send an error response, and perform rollback and release
                        res.status(500).send('Internal Server Error');
                        connection.rollback(() => {
                            connection.release();
                        });
                        return;
                    }

                    // Send the node list as a response
                    res.json(nodeList);
                    connection.commit(() => {
                        connection.release();
                    });
                });
            });
        });
    });
};

exports.addTrustedDevice = (req, res) => {
    const { authToken, deviceName, tasks, deviceType } = req.body;

    // Check if the user has an admin role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {

            const commandMap = {
                "Video Capture Drone": ["python3", "surveillanceDrone.py"],
                "Video Analytic Controller": ["sleep", '"3600000"'],
                "Video Capture Rover": ["sleep", "3600000"],
                "Freight Drone": ["python3", "supplyDrone.py"],
                "Freight UGV": ["sleep", "3600000"],
                "Sensor-Integrated Drone": ["sleep", "3600000"],
                "Communication Relay Drone": ["python3", "relayDrone.py"],
                "Communication Relay Rover": ["sleep", "3600000"],
            };

            const portMap = {
                "Video Capture Drone": 3050,
                "Video Analytic Controller": 5050,
                "Video Capture Rover": 8080,
                "Freight Drone": 4050,
                "Freight UGV": 8080,
                "Sensor-Integrated Drone": 8080,
                "Communication Relay Drone": 5050,
                "Communication Relay Rover": 8080,
            };

            const selectedImage = imageMap[deviceType];
            const selectedCommand = commandMap[deviceType];

            if (!selectedImage) {
                return res.status(400).json({ message: 'Invalid deviceType' });
            }

            try {
                // Create a temporary YAML file
                const podYAML = `
apiVersion: v1
kind: Pod
metadata:
  name: ${deviceName}
  labels:
    app: ${deviceName}
spec:
  nodeName: ${deviceName}
  containers:
  - name: busybox
    image: ${selectedImage}
    imagePullPolicy: Always 
    ports:
      - containerPort: ${portMap[deviceType]}
    command:
      - ${selectedCommand.join("\n      - ")}`;

                const yamlFilePath = temp.openSync({ suffix: '.yaml' });
                fs.writeSync(yamlFilePath.fd, podYAML);
                fs.closeSync(yamlFilePath.fd);

                // Apply the YAML file to create the Pod using exec
                exec(`kubectl apply -f ${yamlFilePath.path}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing kubectl: ${error.message}`);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }

                    // Function to check the IP address of the Pod
                    const checkPodIP = () => {
                        exec(`kubectl get pod ${deviceName} -o=jsonpath='{.status.podIP}'`, (ipError, podIP, ipStderr) => {
                            if (ipError) {
                                console.error(`Error getting Pod IP: ${ipError.message}`);
                                return res.status(500).json({ message: 'Internal Server Error' });
                            }

                            if (podIP) {
                                // Continue with database operations
                                Promise.all([
                                    insertTrustedDevice(deviceName, podIP, deviceType),
                                    getTaskIdsByName(tasks),
                                ])
                                    .then(([insertDeviceResult, taskIds]) => {
                                        // Insert rows in the device_task table
                                        return insertDeviceTasks(insertDeviceResult.insertId, taskIds);
                                    })
                                    .then(() => {
                                        // Delete the temporary YAML file
                                        fs.unlinkSync(yamlFilePath.path);
                                        return res.status(200).json({ message: 'Trusted device added successfully' });
                                    })
                                    .catch((err) => {
                                        console.error(err);
                                        return res.status(500).json({ message: 'Internal Server Error' });
                                    });
                            } else {
                                // If the IP address is not available, check again after a short delay
                                setTimeout(checkPodIP, 1000); // Check every second (adjust as needed)
                            }
                        });
                    };

                    // Start checking for the IP address
                    checkPodIP();
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }
    });
};


exports.updateTrustedDevice = async (req, res) => {
    const { authToken, currentName, deviceName, ipAddress, tasks } = req.body;

    // Check if the user has an admin role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], async (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            try {
                // Find the trusted device by deviceName
                const existingDevice = await findTrustedDeviceByName(currentName);

                if (!existingDevice) {
                    return res.status(404).json({ message: 'Device not found' });
                }

                // Update device name and IP address
                await updateDevice(existingDevice.device_id, deviceName, ipAddress);

                // Get task IDs by task names
                const taskIds = await getTaskIdsByName(tasks);

                // Get the existing device tasks
                const existingDeviceTasks = await getDeviceTasks(existingDevice.device_id);

                // Identify new tasks to add and tasks to delete
                const tasksToAdd = taskIds.filter(taskId => !existingDeviceTasks.includes(taskId));
                const tasksToDelete = existingDeviceTasks.filter(taskId => !taskIds.includes(taskId));

                // Insert new tasks
                if (tasksToAdd.length > 0) {
                    await insertDeviceTasks(existingDevice.device_id, tasksToAdd);
                }

                // Delete old tasks
                if (tasksToDelete.length > 0) {
                    await deleteDeviceTasks(existingDevice.device_id, tasksToDelete);
                }

                return res.status(200).json({ message: 'Trusted device updated successfully' });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }
    });
};

exports.removeTrustedDevice = (req, res) => {
    const { authToken, deviceName } = req.query;

    // Check if the user has an admin role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], async (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            try {
                // Fetch device_id based on deviceName
                const deviceId = await getDeviceIdByName(deviceName);

                // Delete rows from device_task table with matching device_id
                pool.query('DELETE FROM device_task WHERE device_id = ?', [deviceId], (deleteTaskErr) => {
                    if (deleteTaskErr) {
                        console.error(deleteTaskErr);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }

                    // Delete the row from trusted_device table with matching device_id
                    pool.query('DELETE FROM trusted_device WHERE device_id = ?', [deviceId], (deleteDeviceErr) => {
                        if (deleteDeviceErr) {
                            console.error(deleteDeviceErr);
                            return res.status(500).json({ message: 'Internal Server Error' });
                        }

                        // Now that the database records are deleted, you can delete the pod using kubectl
                        exec(`kubectl delete pod ${deviceName}`, (deletePodErr, stdout, stderr) => {
                            if (deletePodErr) {
                                console.error(`Error deleting pod: ${deletePodErr.message}`);
                                return res.status(500).json({ message: 'Internal Server Error' });
                            }

                            return res.status(200).json({ message: 'Trusted device and associated pod removed successfully' });
                        });
                    });
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }
    });
};


exports.clusterJoinRequest = (req, res) => {
    const { nodeName } = req.query;

    const requestingIP = req.ip.replace('::ffff:', '');

    // Execute the kubectl get nodes command to fetch the node names and IP addresses
    exec('kubectl get nodes -o custom-columns=NAME:.metadata.name,INTERNAL-IP:.status.addresses[0].address', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing kubectl: ${error.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const nodeData = stdout
            .split('\n')
            .slice(1) // Skip the header line
            .filter((data) => data.length > 0)
            .map((data) => {
                const [nodeName, nodeIP] = data.split(/\s+/);
                return { nodeName, nodeIP };
            });

        // Check if nodeName already exists in the cluster
        const existingNodeNames = nodeData.map((node) => node.nodeName);
        if (existingNodeNames.includes(nodeName)) {
            console.log(`Node name ${nodeName} is already taken. Sending 422 status.`);
            return res.status(422).json({ error: 'The node name is already taken. Please choose a different name.' });
        }

        // Check if the requesting IP is already part of the cluster
        const existingIPs = nodeData.map((node) => node.nodeIP);
        if (existingIPs.includes(requestingIP)) {
            console.log(`Requesting device with IP address ${requestingIP} is already part of the cluster. Sending 409 status.`);
            return res.status(409).json({ error: 'The device is already part of the cluster.' });
        }

        // Process the nodeName as needed
        console.log(`Received cluster join request for node: ${nodeName}`);
        requestList[requestingIP] = nodeName;
        console.log("Request List: ", requestList);

        res.status(200).json({ message: 'Cluster join request received successfully', nodeName });
    });
};


exports.getToken = (req, res) => {
    const { nodeName } = req.query;

    if (!nodeName) {
        return res.status(400).json({ error: 'Node name is required.' });
    }

    // Execute the command to retrieve the K3S token
    exec('sudo cat /var/lib/rancher/k3s/server/node-token', (err, stdout, stderr) => {
        if (err) {
            console.error(`Error executing command: ${err.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Extract the token from the command output
        const token = stdout.trim();

        if (!token) {
            console.error('Empty token received.');
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!nodeName.trim()) {
            return res.status(400).json({ error: 'Invalid nodeName.' });
        }


        // Example: Respond with the obtained token
        if (Object.values(acceptedList).includes(nodeName))
            res.status(200).json({ token });
        else {
            res.status(409).json({ error: 'Node name not found in acceptedList.' });
        }
    });
};

exports.addToCluster = (req, res) => {
    const { ipAddress, nodeName, authToken, decline } = req.body;

    // Check if the user has an admin role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], async (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            // Validation: Ensure both ipAddress and nodeName are provided
            if (!ipAddress || !nodeName) {
                return res.status(400).json({ error: 'Both ipAddress and nodeName are required.' });
            }

            if (decline) {
                blockList[ipAddress] = nodeName;
                delete requestList[ipAddress];
                res.status(403).json({ message: 'Device declined and removed from the request list.' });
            } else {
                // Add to acceptedList and remove from requestList
                acceptedList[ipAddress] = nodeName;
                delete requestList[ipAddress];
                res.status(200).json({ message: 'Added to cluster successfully.' });
            }
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }
    });
};

exports.removeFromCluster = (req, res) => {
    const { authToken, nodeName } = req.body;

    // Check if the user has an admin role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], async (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            try {
                // First, delete the Pod with the given nodeName
                exec(`kubectl delete node ${nodeName}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing kubectl: ${error.message}`);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
                    return res.status(200).json({ message: 'Node removed from the cluster successfully' });
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }
    });
};
