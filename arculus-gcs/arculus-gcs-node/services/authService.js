const pool = require('../modules/arculusDbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
var ztMode = 'no_zt';
var pids = {};

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
};
exports.getUserFromToken = getUserFromToken;

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
exports.isAdminUser = isAdminUser;


exports.signup = (req, res) => {
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
};

exports.login = (req, res) => {
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
};

exports.authorizeAdmin = (req, res) => {
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
            return res.status(200).json({ message: 'User is an admin', mode: ztMode });
        } else {
            return res.status(403).json({ message: 'Unauthorized: User is not an admin' });
        }
    });
};

exports.setZtMode = (req, res) => {
    const { mode } = req.query;
    const { authToken } = req.body;

    const user = getUserFromToken(authToken);

    // Check if the user has an admin role
    isAdminUser(user, (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can change Zero Trust Settings' });
        }

        ztMode = mode;
        return res.status(200).json({ message: 'Zero Trust mode changed successfully' });

    });
};

exports.runExperimentInPod = async (req, res) => {
    try {
        const { authToken } = req.query;
        const username = getUserFromToken(authToken);
        const podNames = ["node1", "node2", "node3", "node4", "node5", "node6", "node7", "node8", "node9", "node10"]; // Specify the name of the pod where you want to execute the script

        // Check if the user has an admin role
        const isAdmin = await new Promise((resolve, reject) => {
            isAdminUser(username, (error, isAdmin) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else {
                    resolve(isAdmin);
                }
            });
        });

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }

        // Execute the kubectl command to kill processes inside the pods
        const killPromises = Object.entries(pids).map(([device, pid]) => {
            return new Promise((resolve, reject) => {
                console.log(pids);
                exec(`kubectl exec ${device} --namespace=default -- sh -c 'kill ${pid}'`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error killing process in pod ${device}: ${error}`);
                        // Break out of the loop without emptying the pids object
                        resolve(); // Resolve to break out of the loop
                    } else {
                        console.log(`Process with PID ${pid} killed successfully in pod ${device}`);
                        resolve();
                    }
                });
            });
        });

        await Promise.all(killPromises);

        // Check ztMode and set parameters accordingly
        let m = 4;
        let n = 5;
        if (ztMode === 'full_zt') {
            m = 12;
            n = 3;
        }

        // Execute scripts in pods
        const scriptPromises = podNames.map(podName => {
            return new Promise((resolve, reject) => {
                exec(`kubectl exec ${podName} --namespace=default -- sh -c ' /home/run_experiment.sh ${m} ${n}'`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing script in pod ${podName}: ${error}`);
                        reject(error);
                    } else {
                        console.log(`Script executed successfully in pod ${podName}`);
                        resolve();
                    }
                });
            });
        });

        await Promise.all(scriptPromises);

        res.status(200).send('Scripts executed successfully in all pods');
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.authenticate = (req, res) => {
    const { processInfo } = req.query;
    // Check if the user has an admin role
    // Function to parse and store process information
    const parseProcessInfo = (processInfo) => {
        if (processInfo) {
            console.log('Process Info:', processInfo);
            const [key, value] = processInfo.split('@');
            pids[key] = value;
        }
    };

    // Parse process information
    parseProcessInfo(processInfo);

    // Return success response
    res.status(200).json({ message: 'Process information received and stored successfully' });
};