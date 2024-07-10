const pool = require('../modules/arculusDbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
var ztMode = 'no_zt';
var pids = {};
var otps = {};
const sgMail = require('@sendgrid/mail')
const fs = require('fs');

const apiKey = fs.readFileSync('configs/EMAIL_API_KEY.txt', 'utf8').trim();
const cryptSecret = fs.readFileSync('configs/ENCRYPTION_SECRET.txt', 'utf8').trim();

sgMail.setApiKey(apiKey);

function getUserFromToken(token) {
    if (typeof token !== 'string') {
        return 'Unauthorized';
    }

    try {
        const decoded = jwt.verify(token, cryptSecret);

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

const isUserOfType = (username, userTypes, callback) => {
    pool.query("SELECT r.role_name FROM user u JOIN role r ON u.role_id = r.role_id WHERE u.username = ?", [username], (err, results) => {
        if (err) {
            console.error(err);
            callback(err, null);
            return;
        }

        const isOfRightType = results.some((row) => userTypes.includes(row.role_name));
        callback(null, isOfRightType);
    });
};
exports.isUserOfType = isUserOfType;


const getUserRole = (username, callback) => {
    pool.query("SELECT r.role_name FROM user u JOIN role r ON u.role_id = r.role_id WHERE u.username = ?", [username], (err, results) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }

        // Extract the role name from the query result
        if (results.length > 0) {
            const roleName = results[0].role_name;
            callback(null, roleName);
        } else {
            // If no role found for the user, return null
            callback(null, null);
        }
    });
};
exports.getUserRole = getUserRole;

const getUserIdFromName = async (username) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT user_id FROM user WHERE username = ?", [username], (err, results) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }

            if (results.length === 0) {
                reject({ message: 'User not found' });
                return;
            }

            const userId = results[0].user_id;
            resolve(userId);
        });
    });
};
exports.getUserIdFromName = getUserIdFromName;

exports.isNewSetup = (req, res) => {
    // Query the user table to check if there are any records
    pool.query('SELECT COUNT(*) AS userCount FROM user', (queryErr, results) => {
        if (queryErr) {
            console.error(queryErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Check the count of users
        if (results[0].userCount === 0) {
            // No users found, likely a new setup
            return res.status(200).json({ newSetup: true });
        } else {
            // Users exist in the database
            return res.status(200).json({ newSetup: false });
        }
    });
};

exports.signup = (req, res) => {
    const { jwtToken, username, email, password, role, domains } = req.body;

    // Function to insert user into the database
    const createUser = (role_id) => {
        bcrypt.hash(password, 10, (hashErr, hash) => {
            if (hashErr) {
                console.error(hashErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            // Insert the user into the database
            pool.query('INSERT INTO user (username, email, role_id, password_hash, domains) VALUES (?, ?, ?, ?, ?)',
                [username, email, role_id, hash, domains],
                (insertErr) => {
                    if (insertErr) {
                        console.error(insertErr);
                        return res.status(500).json({ message: 'An Account is already present with the given email or username. Please try to login or create a new account using a different email.' });
                    }
                    return res.status(200).json({ message: 'User account created successfully' });
                }
            );
        });
    };

    // Check for a valid JWT token
    if (jwtToken) {
        verifyToken(jwtToken, (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err);
                checkForEmptyDatabaseAndCreateUser();
            } else {
                isUserOfType(decoded.userId, ['Mission Creator'], (roleErr, isAdmin) => {
                    if (roleErr || !isAdmin) {
                        console.error(roleErr);
                        return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
                    }

                    fetchRoleIdAndCreateUser(role);
                });
            }
        });
    } else {
        checkForEmptyDatabaseAndCreateUser();
    }

    function checkForEmptyDatabaseAndCreateUser() {
        pool.query('SELECT COUNT(*) AS count FROM user', (err, results) => {
            if (err || results[0].count > 0) {
                return res.status(403).json({ message: 'Unauthorized: No valid JWT provided and users exist in the database' });
            }
            fetchRoleIdAndCreateUser(role);
        });
    }

    function fetchRoleIdAndCreateUser(roleName) {
        pool.query('SELECT role_id FROM role WHERE role_name = ?', [roleName], (selectErr, results) => {
            if (selectErr || results.length === 0) {
                console.error(selectErr);
                return res.status(500).json({ message: 'Internal Server Error or Invalid role specified' });
            }
            const role_id = results[0].role_id;
            createUser(role_id);
        });
    }
};

exports.sendEmailForAuth = (req, res) => {
    const { authToken } = req.body;
    const username = getUserFromToken(authToken);
    console.log('API KEY: ', process.env.SENDGRID_API_KEY);

    isUserOfType(username, ['Mission Creator', 'Mission Supervisor', 'Mission Viewer'], (roleErr, isAuthorized) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Unauthorized to perform this action' });
        }

        // Fetch role_id based on role_name
        pool.query('SELECT email FROM user WHERE username = ?', [username], (selectErr, results) => {
            if (selectErr) {
                console.error(selectErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (results.length === 0) {
                // No email found
                return res.status(400).json({ message: 'Error fetching email ID' });
            }

            const email = results[0].email;
            const otp = Math.floor(100000 + Math.random() * 900000);
            otps[username] = otp.toString();
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .email-container { background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 10px; }
    .email-header { background: #007bff; color: #ffffff; padding: 10px; border-radius: 10px 10px 0 0; text-align: center; }
    .email-body { padding: 20px; text-align: center; }
    .otp-code { font-size: 24px; color: #333333; margin: 20px 0; padding: 10px; border: 1px dashed #007bff; display: inline-block; }
    .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #666; }
</style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Verify Your Identity</h1>
        </div>
        <div class="email-body">
            <p>Hello ${username},</p>
            <p>Your One-Time Password (OTP) for your password change request is:</p>
            <div class="otp-code">${otp}</div>
            <p>Please enter this code on the provided screen to proceed.</p>
        </div>
        <div class="footer">
            <p>If you did not request this, please ignore this email or contact support if you have any concerns.</p>
        </div>
    </div>
</body>
</html>
`;
            const msg = {
                to: email,
                from: 'saketh.reddy1102@gmail.com', // Make sure this is a verified sender
                subject: 'Arculus: Authentication for Password Change Request',
                text: `Hello ${username}, your OTP is: ${otp}`, // Fallback plain text email
                html: htmlContent
            };

            sgMail
                .send(msg)
                .then(() => {
                    console.log('Email sent');
                    res.status(200).json({ message: 'Email successfully sent' });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Failed to send email' });
                });
        });
    });
};

exports.verifyOtp = (req, res) => {
    const { authToken, otp } = req.body;
    const username = getUserFromToken(authToken);

    isUserOfType(username, ['Mission Creator', 'Mission Supervisor', 'Mission Viewer'], (roleErr, isAuthorized) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Unauthorized to perform this action' });
        }

        if(otps[username] === otp) {
            return res.status(200).json({message: "Identity Verified"});
        }

        return res.status(403).json({message: "Incorrect OTP"});

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
            const jwtToken = jwt.sign({ username, password }, cryptSecret, { expiresIn: '1h' });

            // Include the username in the response body
            res.json({ status: 200, message: 'Logged in successfully', jwtToken, user: username });
        });
    });
};

exports.authorize = (req, res) => {
    const { authToken } = req.query;
    const username = getUserFromToken(authToken);

    // Check if the user exists
    if (!username) {
        return res.status(403).json({ message: 'Unauthorized: User not found' });
    }

    // Get user's role
    getUserRole(username, (roleErr, userType) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        return res.status(200).json({ message: 'User is authorized', userType });
    });
};

exports.setZtMode = (req, res) => {
    const { mode } = req.query;
    const { authToken } = req.body;

    const user = getUserFromToken(authToken);

    // Check if the user has an admin role
    isUserOfType(user, ['Mission Creator'], (roleErr, isAdmin) => {
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
            isUserOfType(username, ['Mission Creator'], (error, isAdmin) => {
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