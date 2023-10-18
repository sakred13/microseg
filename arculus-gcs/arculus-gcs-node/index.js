const express = require('express');
const fs = require('fs-extra');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const util = require('util');
const { exec, execSync } = require('child_process');
const ip = require('ip');
const WebSocket = require('ws');
const http = require('http');

// const hostIp = process.env.HOST_IP;
const hostIp = execSync("ifconfig eth0 | grep 'inet ' | awk '{print $2}'").toString().trim();
const publicIp = execSync("curl -s ifconfig.me").toString().trim();
console.log('Public IP: ', publicIp)
const allowCors = [`http://localhost:3000`, `http://127.0.0.1:3000`, `http://${hostIp}:3000`, `http://${publicIp}:3000`]
var requestList = {};
var acceptedList = {};
var blockList = {};
var subnetIps;
console.log(`Allowing CORS: ${allowCors}`);
const app = express();
const server = http.createServer(app);
const joinReqsWss = new WebSocket.Server({ server, path: '/joinRequests' });
const joinStatusServer = http.createServer();
const joinStatusWss = new WebSocket.Server({ server: joinStatusServer, path: '/getJoinStatus' });

app.use(cors({
    origin: allowCors,
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

const dbConfig = JSON.parse(fs.readFileSync('./configs/dbconfigs.json'));

// Create a connection pool to handle multiple connections to the database
const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectionLimit: dbConfig.connectionLimit
});

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

    // console.log('Private IP Address:', hostIp);
    // console.log('Subnet Mask:', subnetMask);

    const subnetRange = calculateSubnetRange(hostIp, subnetMask);
    // console.log('Subnet Range:', subnetRange.networkAddress + '/' + subnetRange.subnetMaskLength);
    // console.log('IP Range:', subnetRange.firstAddress + ' - ' + subnetRange.lastAddress);
    subnetIps = generateIPRange(subnetRange.firstAddress, subnetRange.lastAddress);
} catch (error) {
    console.error('Error:', error.message);
}

// Middleware function to verify JWT token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

function getUserFromToken(token) {
    if (typeof token !== 'string') {
        return 'Unauthorized';
    }

    try {
        const decoded = jwt.verify(token, 'secret');

        if (!decoded.username) {
            return 'Unauthorized';
        }

        return decoded.username;
    } catch (err) {
        console.log('eee ' + err)
        return 'Unauthorized';
    }
}
// Function to check if the user is an admin
const isAdminUser = (username, callback) => {
    pool.query("SELECT r.role_name FROM user u JOIN role r ON u.role_id = r.role_id WHERE u.username = ?", [username], (err, results) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }

        const isAdmin = results.some((row) => row.role_name === 'Admin');
        callback(null, isAdmin);
    });
};

app.post('/api/signup', (req, res) => {
    const { jwtToken, username, email, password, role } = req.body;

    // Check if the user has an admin role
    isAdminUser(getUserFromToken(jwtToken), (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            // Fetch role_id based on role_name
            pool.query('SELECT role_id FROM role WHERE role_name = ?', [role], (selectErr, results) => {
                if (selectErr) {
                    console.error(selectErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                if (results.length === 0) {
                    // Role not found
                    return res.status(400).json({ message: 'Invalid role specified' });
                }

                const role_id = results[0].role_id;

                // Hash the password using bcrypt
                bcrypt.hash(password, 10, (hashErr, hash) => {
                    if (hashErr) {
                        console.error(hashErr);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }

                    // Insert the user into the database
                    pool.query('INSERT INTO user (username, email, role_id, password_hash) VALUES (?, ?, ?, ?)', [username, email, role_id, hash], (insertErr) => {
                        if (insertErr) {
                            console.error(insertErr);
                            return res.status(500).json({ message: 'An Account is already present with the given email or username. Please try to login or create a new account using a different email.' });
                        }

                        return res.status(200).json({ message: 'User account created successfully' });
                    });
                });
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
        }
    });
});


// app.post('/api/signup1', (req, res) => {
//     const { username, email, password, role_id } = req.body;

//     // Hash the password using bcrypt
//     bcrypt.hash(password, 10, (hashErr, hash) => {
//         if (hashErr) {
//             console.error(hashErr);
//             return res.status(500).json({ message: 'Internal Server Error' });
//         }

//         // Insert the user into the database
//         pool.query('INSERT INTO user (username, email, role_id, password_hash) VALUES (?, ?, ?, ?)', [username, email, role_id, hash], (insertErr) => {
//             if (insertErr) {
//                 console.error(insertErr);
//                 return res.status(500).json({ message: 'An Account is already present with the given email or username. Please try to login or create a new account using a different email.' });
//             }

//             return res.status(200).json({ message: 'User account created successfully' });
//         });
//     });
// });

// Route to handle user login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    pool.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ status: 401, message: 'Invalid credentials' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 500, message: 'Internal Server Error' });
            }

            if (!isMatch) {
                return res.status(401).json({ status: 401, message: 'Invalid credentials' });
            }

            // Create JWT token and send it back to the client
            const jwtToken = jwt.sign({ username, password }, 'secret', { expiresIn: '1h' });

            // Include the username in the response body
            res.json({ status: 200, message: 'Logged in successfully', jwtToken, user: username });
        });
    });
});

// Route to handle user update without changing password
app.post('/api/updateUser', (req, res) => {
    const { authToken, user, updated_username, email_id, role } = req.body;

    const username = getUserFromToken(authToken);
    // Check if the user has an admin role
    isAdminUser(username, (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can edit user details' });
        }

        // Fetch the user record from the database using the provided username
        pool.query('SELECT * FROM user WHERE username = ?', [user], (selectErr, results) => {
            if (selectErr) {
                console.error(selectErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (results.length === 0) {
                // No user found with the given username
                return res.status(404).json({ message: 'User not found' });
            }

            // Update the user record with the new information
            pool.query(
                'UPDATE user SET username = ?, email = ?, role_id = ? WHERE username = ?',
                [updated_username, email_id, role, user],
                (updateErr) => {
                    if (updateErr) {
                        console.error(updateErr);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }

                    return res.status(200).json({ message: 'User updated successfully' });
                }
            );
        });
    });
});


app.delete('/api/deleteUser', (req, res) => {
    const { username, authToken } = req.query;
    const user = getUserFromToken(authToken);

    // Check if the user has an admin role
    isAdminUser(user, (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can delete users' });
        }

        // Delete the user record from the database using the provided username
        pool.query('DELETE FROM user WHERE username = ?', [username], (deleteErr) => {
            if (deleteErr) {
                console.error(deleteErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            return res.status(200).json({ message: 'User deleted successfully' });
        });
    });
});

// Route to handle protected resource
app.get('/protected', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({ message: 'You have access to the protected resource', authData });
        }
    });
});

app.get('/api/getUsers', (req, res) => {
    const { authToken } = req.query;
    const username = getUserFromToken(authToken);

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

                if (userRows.length == 0 || userRows == undefined || !userRows[0].user_id) {
                    res.status(400).send('User not found');
                    connection.rollback(function () {
                        connection.release();
                    });
                    return;
                }
                const userId = userRows[0].user_id;

                connection.query(`
                    SELECT u.username, u.email, r.role_name
                    FROM user u
                    JOIN role r ON u.role_id = r.role_id
                `, function (err, rows) {
                    if (err) {
                        connection.rollback(function () {
                            throw err;
                        });
                    } else {
                        connection.release();
                        res.json(rows);
                    }
                });
            });
        });
    });
});

app.get('/api/getTrustedDevices', (req, res) => {
    const { authToken } = req.query;
    const username = getUserFromToken(authToken);

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

                connection.query(`
                SELECT device_id, device_name, ip_address, personnel_rank
                FROM trusted_device
            `, function (err, deviceRows) {
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
            });
        });
    });
});

app.get('/api/getMoreNodes', (req, res) => {
    const { authToken } = req.query;
    const username = getUserFromToken(authToken);

    pool.getConnection((err, connection) => {
        if (err) throw err;

        connection.beginTransaction((err) => {
            if (err) throw err;

            connection.query('SELECT user_id FROM user WHERE username = ? LIMIT 1', [username], (err, userRows) => {
                if (err) {
                    connection.rollback(() => {
                        throw err;
                    });
                }

                if (userRows.length === 0 || userRows === undefined || !userRows[0].user_id) {
                    res.status(400).send('User not found');
                    connection.rollback(() => {
                        connection.release();
                    });
                    return;
                }

                // Use exec to run kubectl command
                exec('kubectl get pods -o custom-columns=POD:metadata.name,IP:status.podIP', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing kubectl: ${error.message}`);
                        res.status(500).send('Internal Server Error');
                        connection.rollback(() => {
                            connection.release();
                        });
                        return;
                    }

                    const podList = stdout
                        .trim() // Remove leading/trailing whitespace
                        .split('\n') // Split into lines
                        .slice(1) // Skip header
                        .map((line) => {
                            const [pod, ip] = line.trim().split(/\s+/);
                            return { pod, ip };
                        });

                    res.json(podList);
                    connection.commit(() => {
                        connection.release();
                    });
                });
            });
        });
    });
});

app.get('/api/getTasks', (req, res) => {
    const { authToken } = req.query;

    // Check if the user has an admin role
    isAdminUser(getUserFromToken(authToken), (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            // Query to get task names
            pool.query('SELECT task_name FROM task', (queryErr, results) => {
                if (queryErr) {
                    console.error(queryErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                const taskNames = results.map(result => result.task_name);
                return res.status(200).json({ taskNames });
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
        }
    });
});

app.get('/api/getRoles', (req, res) => {
    const { authToken } = req.query;

    // Check if the user has an admin role
    isAdminUser(getUserFromToken(authToken), (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            // Query to get task names
            pool.query('SELECT role_name FROM role', (queryErr, results) => {
                if (queryErr) {
                    console.error(queryErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                const roleNames = results.map(result => result.role_name);
                return res.status(200).json({ roleNames });
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
        }
    });
});

// Route to handle adding a trusted device
app.post('/api/addTrustedDevice', (req, res) => {
    const { authToken, deviceName, ipAddress, tasks } = req.body;

    // Check if the user has an admin role
    isAdminUser(getUserFromToken(authToken), async (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            try {
                // Insert into trusted_device and get the device ID
                const insertDeviceResult = await insertTrustedDevice(deviceName, ipAddress);

                // Get task IDs by task names
                const taskIds = await getTaskIdsByName(tasks);

                // Insert rows in the device_task table
                await insertDeviceTasks(insertDeviceResult.insertId, taskIds);

                return res.status(200).json({ message: 'Trusted device added successfully' });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }
    });
});

// Function to insert a trusted device and get the device ID
const insertTrustedDevice = (deviceName, ipAddress) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO trusted_device (device_name, ip_address) VALUES (?, ?)', [deviceName, ipAddress], (insertErr, result) => {
            if (insertErr) {
                reject(insertErr);
            } else {
                resolve(result);
            }
        });
    });
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

app.put('/api/updateTrustedDevice', async (req, res) => {
    const { authToken, currentName, deviceName, ipAddress, tasks } = req.body;

    // Check if the user has an admin role
    isAdminUser(getUserFromToken(authToken), async (roleErr, isAdmin) => {
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
});

app.delete('/api/removeTrustedDevice', (req, res) => {
    const { authToken, deviceName } = req.query;

    // Check if the user has an admin role
    isAdminUser(getUserFromToken(authToken), async (roleErr, isAdmin) => {
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

                        return res.status(200).json({ message: 'Trusted device removed successfully' });
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
});

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

app.get('/api/authorizeAdmin', (req, res) => {
    const { authToken } = req.query;

    // Assuming getUserFromToken and isAdminUser functions are defined elsewhere
    const username = getUserFromToken(authToken);

    // Check if the user has an admin role
    isAdminUser(username, (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            return res.status(200).json({ message: 'User is an admin' });
        } else {
            return res.status(403).json({ message: 'Unauthorized: User is not an admin' });
        }
    });
});

app.post('/api/clusterJoinRequest', cors({
    origin: subnetIps,
    methods: 'POST',
    credentials: true,
}), (req, res) => {
    const { nodeName } = req.query;

    // Check if nodeName already exists in requestList or acceptedList
    if (Object.values(requestList).includes(nodeName) || Object.values(acceptedList).includes(nodeName)) {
        console.log(`Node name ${nodeName} is already taken. Sending 409 status.`);
        return res.status(409).json({ error: 'The node name is already taken. Please choose a different name.' });
    }

    // Process the nodeName as needed
    console.log(`Received cluster join request for node: ${nodeName}`);
    requestList[req.ip.replace('::ffff:', '')] = nodeName;
    console.log("Request List: ", requestList);

    res.status(200).json({ message: 'Cluster join request received successfully', nodeName });
});

// Error handling middleware to catch any unhandled errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});


// WebSocket server
joinReqsWss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');

    ws.on('close', () => {
        console.log('WebSocket client disconnected');

    });

    // Periodically send updates to connected clients
    setInterval(() => {
        ws.send(JSON.stringify(requestList));
    }, 5000);
});

joinStatusWss.on('connection', (ws, req) => {
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
    }, 5000); // Check every 5 seconds
});

app.get('/getToken', cors({
    origin: subnetIps,
    methods: 'GET',
    credentials: true,
}), (req, res) => {
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

        // Validation: Ensure a valid token is obtained
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
});

app.post('/addToCluster', (req, res) => {
    const { ipAddress, nodeName, authToken } = req.body;

    // Check if the user has an admin role
    isAdminUser(getUserFromToken(authToken), async (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            // Validation: Ensure both ipAddress and nodeName are provided
            if (!ipAddress || !nodeName) {
                return res.status(400).json({ error: 'Both ipAddress and nodeName are required.' });
            }

            // Add to acceptedList and remove from requestList
            acceptedList[ipAddress] = nodeName;
            delete requestList[ipAddress];

            res.status(200).json({ message: 'Added to cluster successfully.' });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }
    });
});

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    };
    const formattedDate = date.toLocaleDateString('en-GB', options);
    return formattedDate;
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

joinStatusServer.listen(3002, () => {
    console.log('Join Status WebSocket server listening on port 3002');
});