const pool = require('../modules/arculusDbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
            return res.status(200).json({ message: 'User is an admin' });
        } else {
            return res.status(403).json({ message: 'Unauthorized: User is not an admin' });
        }
    });
};

