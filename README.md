# Arculus Test Bed

This repository contains the UI, back-end and database infrastructure to setup a test-bed on cloud/physical infrastructure to manage device clusters, users, and assign network policies dynamically to achieve Role-Based, Function-Based, and Risk-Based Access Control through a Ground Control Client Application.

## Getting Started

### Prerequisites

For initial setup of the master node which container a ground controller, an EC2 instance or physical machine with Docker installed and having at least 4 GB memory running on Ubuntu is required. For each worker node which will hold a K3S pod, a machine/EC2 instance with 1 GB memory is sufficient.

### Setting up the Ground Controller

To set up the ground controller as the master node, follow these steps:

1. Make sure not to run commands as sudo by default. Only run commands as super-user where specified.

2. On the controller machine, run the script `setup_controller.sh` to configure it as a K3S master node.

```bash
#!/bin/bash
./setup_controller.sh
```

Running this script installs K3s on the controller machine and sets it up as the primary node of the cluster.

3. Now modify the docker image that holds the client application's MySQL database server to have the desired password, build and deploy it as a container with the required port-mapping by running the below commands from the project's root directory.
```bash
#!/bin/bash
cd arculus-gcs-mysql
sudo apt update
sudo apt install docker.io npm
sudo docker build -t arculus-gcs-mysql:latest .
sudo docker run -p 3306:3306 --name arculus-gcs-db arculus-gcs-mysql
```

4. To turn up the node.js back-end application, navigate to `arculus-gcs-node/` and update `dbConfigs.json` with the database credentials, `dockerImageConfig.json` with device type - docker image mapping from DockerHub, `EMAIL_API_KEY.txt` with SMTP API key, and `ENCRYPTION_SECRET.txt` with a random 256-bit encryption key to be used for encryption for authorization and other purposes.

5. Now run the following commands to install the needed dependencies and start a development API server on port 3001. 
```bash
#!/bin/bash
npm install
npm start
```

6. To start a deployment server, run the following commands.
```bash
#!/bin/bash
npm install
pm2 start index.js
```

7. Follow instructions at https://communityhoneynetwork.readthedocs.io/en/stable/serverinstall/ to setup a CHN server for honeypots. Note down its URL, deploy key, user name, password, and API key, and update these in the honeypot_config.json of the node.js codebase. This lets our UI communicate with the CHN server's SDK APIs through our proxy honeypot server.
 
8. Before starting the UI server of the Ground Control Client, update `arculus-gcs-ui/config.js` with the public IP address of the controller node for API access. Update the PRIVATE_IP constant to the private IP address of the instance. Update the CHN_URL constant with the CHN server's URL.

9. To start the ReactJS UI application, navigate to `arculus-gcs-ui/` and run the following commands again to install the needed dependencies and start the API server and start a development UI server. 
```bash
#!/bin/bash
npm install
npm start
```

10. To start a deployment server, run the following commands.
```bash
#!/bin/bash
npm install
pm2 start server.js
```

### Adding a Node to the K3S Cluster

1. The addition of worker nodes to the cluster has been dynamized and centrally maintained on the Arculus Ground Control Client application.

2. This step does not require the complete codebase to run. The script `joinClusterWizard.sh` with the private IP address of the master node and the name being requested for the node as command-line arguments would be sufficient. Run the below script on the node you wish to add to the cluster from the directory containing the script.
```bash
#!/bin/bash
sudo ./joinClusterWizard.sh {master-node-private-ip} {node-name}
```

This script makes a request to an API to request addition of the node as a worker to the cluster. On the Device Management dashboard of the Arculus Ground Control Client, admin users gets a pop-up about the request and they can decide to approve or decline the request. When an admin user approves the request, the requesting node receives the K3S token of the master node to join the cluster. The script then proceeds to join the cluster using the procured token. The back-end application waits for the addition of the node, and once it is added, it deploys a K3S pod and lists it in the list of nodes in the cluster.

3. This behavior can be verified by either using the UI dashboard or running the below commands on the controller node.
```bash
#!/bin/bash
kubectl get nodes
```
```bash
#!/bin/bash
kubectl get pods
```

These commands list all the nodes and pods on the cluster. Make sure that all the added nodes are listed here.

### Understanding the Usage and Flow of the Application

The documentation of the workflow and its respective code (for developers) has been documented as a Docusaurus web app for docs. To read the docs, follow the below steps:

1. Go to the `arculus-docs` directory and run `npm install` and `npm start`.

2. The docs web application launches on port 6006 of the host machine. Access the docs at `{hostIp}:6006`.

### Watch tutorials of application usage below:
[![User and Device Management (Video)](http://img.youtube.com/vi/nwDFrQLYTA8/0.jpg)](https://youtu.be/nwDFrQLYTA8)
[![Mission Planning (Video)](http://img.youtube.com/vi/J8Y1VbJu18g/0.jpg)](https://youtu.be/J8Y1VbJu18g)
[![Normal Scenario](http://img.youtube.com/vi/OabGbvjsLhY/0.jpg)](https://youtu.be/OabGbvjsLhY) 
[![Scenario 1: Denial of Service](http://img.youtube.com/vi/Pfk5QcVTnfo/0.jpg)](https://youtu.be/Pfk5QcVTnfo) 
[![Scenario 2: Disruption by Brute Force and Physical Capture](http://img.youtube.com/vi/hR5MkyXRhEc/0.jpg)](https://youtu.be/hR5MkyXRhEc)
[![Scenario 3: Intermittent Connectivity](http://img.youtube.com/vi/dO9TIpk9nCc/0.jpg)](https://youtu.be/dO9TIpk9nCc) 
[![Scenario 4: Limited Availability of Battery](http://img.youtube.com/vi/e5xqwsqSv64/0.jpg)](https://youtu.be/e5xqwsqSv64) 

