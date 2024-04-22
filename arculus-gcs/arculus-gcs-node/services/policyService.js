const { isUserOfType, getUserFromToken } = require('./authService');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);

async function isAdmin(authToken) {
    return new Promise((resolve, reject) => {
        isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isAdmin) => {
            if (roleErr) {
                console.error(roleErr);
                reject(roleErr);
            } else {
                resolve(isAdmin);
            }
        });
    });
}

exports.addNetworkPolicy = (req, res) => {
    const { authToken, device, ingress, egress } = req.body;

    try {
        const admin = isAdmin(authToken);

        if (admin) {
            // Construct NetworkPolicy YAML
            const networkPolicyId = `policy-${device}`;
            let networkPolicyYAML = `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${networkPolicyId}
spec:
  podSelector:
    matchLabels:
      app: ${device}
  policyTypes:
  - Ingress
  - Egress
`;

            // Add ingress rules if ingress is not null or empty
            if (ingress && ingress.length > 0) {
                networkPolicyYAML += `
  ingress:
${constructIngressYAML(device, ingress)}
`;
            }

            // Add egress rules if egress is not null or empty
            if (egress && egress.length > 0) {
                networkPolicyYAML += `
  egress:
${constructEgressYAML(device, egress)}
`;
            }

            // Apply NetworkPolicy YAML using kubectl
            exec(`kubectl apply -f - <<EOF\n${networkPolicyYAML}\nEOF`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing kubectl: ${error}`);
                    res.status(500).json({ message: 'Failed to create NetworkPolicy' });
                    return;
                }

                // Return the ID of the created NetworkPolicy
                res.status(200).json({ networkPolicyId });
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


function constructIngressYAML(device, ingress) {
    let yaml = '';
    ingress.forEach(rule => {
        yaml += `
  - from:
    - podSelector:
        matchLabels:
          app: ${rule.device} # Match pods with the specified name
    ports:
    - protocol: ${rule.protocol}
      port: ${rule.port}`;
    });
    return yaml;
}

function constructEgressYAML(device, egress) {
    let yaml = '';
    egress.forEach(rule => {
        yaml += `
  - to:
    - podSelector:
        matchLabels:
          app: ${rule.device} # Match pods with the specified name
    ports:
    - protocol: ${rule.protocol}
      port: ${rule.port}`;
    });
    return yaml;
}

async function addNetworkPolicyDuringMission(device, ingress, egress) {
    try {
        const networkPolicyId = `policy-${device}`;
        let ingressYAML = '';
        let egressYAML = '';

        if (ingress && ingress.length > 0) {
            ingressYAML = await constructIngressYAML(device, ingress);
        }

        if (egress && egress.length > 0) {
            egressYAML = await constructEgressYAML(device, egress);
        }

        const ingressSection = ingressYAML ? `  ingress:\n${ingressYAML}` : '';
        const egressSection = egressYAML ? `  egress:\n${egressYAML}` : '';

        const networkPolicyYAML = `
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${networkPolicyId}
spec:
  podSelector:
    matchLabels:
      app: ${device}
  policyTypes:
  - Ingress
  - Egress
${ingressSection}
${egressSection}
`;

        // Apply NetworkPolicy YAML using kubectl
        const { stdout, stderr } = await execAsync(`kubectl apply -f - <<EOF\n${networkPolicyYAML}\nEOF`);

        console.log(`NetworkPolicy created successfully with ID: ${networkPolicyId}`);
        return networkPolicyId;
    } catch (error) {
        console.error(`Error executing kubectl: ${error}`);
        throw new Error('Failed to create NetworkPolicy');
    }
}


exports.addNetworkPolicyDuringMission = addNetworkPolicyDuringMission;
function constructPortsYAML(ports) {
    return ports.map(port => `    - protocol: ${port.split('/')[1]}\n      port: ${port.split('/')[0]}`).join('\n');
}

exports.getNetworkPolicies = (req, res) => {
    const { authToken } = req.query;
    try {
        const admin = isAdmin(authToken);
        if (admin) {
            // Execute kubectl command to get NetworkPolicies in JSON format
            exec('kubectl get networkpolicies --namespace=default -o json', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing kubectl: ${error}`);
                    res.status(500).json({ message: 'Failed to fetch NetworkPolicies' });
                    return;
                }

                try {
                    const networkPolicies = parseNetworkPolicies(stdout);

                    // Return the list of NetworkPolicies
                    res.status(200).json(networkPolicies);
                } catch (parseError) {
                    console.error(`Error parsing NetworkPolicy JSON: ${parseError}`);
                    res.status(500).json({ message: 'Failed to parse NetworkPolicies' });
                }
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

function parseNetworkPolicies(stdout) {
    const parsedOutput = JSON.parse(stdout);
    return parsedOutput.items.map(policy => ({
        name: policy.metadata.name,
        podSelector: policy.spec.podSelector,
        policyTypes: policy.spec.policyTypes,
        ingress: policy.spec.ingress,
        egress: policy.spec.egress,
    }));
}


exports.deleteNetworkPolicy = (req, res) => {
    const { authToken, policyName } = req.body;

    try {
        const admin = isAdmin(authToken);

        if (admin) {
            // Execute kubectl command to delete the NetworkPolicy
            exec(`kubectl delete networkpolicy ${policyName} --namespace=default`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing kubectl: ${error}`);
                    res.status(500).json({ message: 'Failed to delete NetworkPolicy' });
                    return;
                }

                // Check if deletion was successful
                if (stderr) {
                    console.error(`Error deleting NetworkPolicy: ${stderr}`);
                    res.status(500).json({ message: 'Failed to delete NetworkPolicy' });
                    return;
                }

                // Return success message
                res.status(200).json({ message: 'NetworkPolicy deleted successfully' });
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can perform this action' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

function deleteNetworkPolicyDuringMission(policyName) {
    exec(`kubectl delete networkpolicy ${policyName} --namespace=default`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing kubectl: ${error}`);
            throw new Error('Failed to delete NetworkPolicy');
        }

        if (stderr) {
            console.error(`Error deleting NetworkPolicy: ${stderr}`);
            throw new Error('Failed to delete NetworkPolicy');
        }

        console.log('NetworkPolicy deleted successfully');
    });
}
exports.deleteNetworkPolicyDuringMission = deleteNetworkPolicyDuringMission;