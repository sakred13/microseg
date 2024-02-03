# Arculus Test Bed

This repository contains the UI, back-end and database infrastructure to setup a test-bed on cloud/physical infrastructure to manage device clusters, users, and assign network policies dynamically to achieve Role-Based, Function-Based, and Risk-Based Access Control through a Ground Control Client Application.

## Getting Started

### Prerequisites

For initial setup of the master node which container a ground controller, an EC2 instance or physical machine with Docker installed and having at least 4 GB memory running on Ubuntu is required. For each worker node which will hold a K3S pod, a machine/EC2 instance with 1 GB memory is sufficient.

### Setting up the Ground Controller

To set up the ground controller as the master node, follow these steps:

1. Make sure not to run commands as sudo by default. Only run commands as super-user where specified.

2. On the controller machine, run the script `arculus-gcs/setup_controller.sh` to configure it as a K3S master node.

```bash
#!/bin/bash
./arculus-gcs/setup_controller.sh
```

Running this script installs K3s on the controller machine and sets it up as the primary node of the cluster.

3. Now build the docker image that holds the client application's MySQL database server and deploy it as a container with the required port-mapping by running the below commands from the project's root directory.
```bash
#!/bin/bash
cd arculus-gcs/arculus-gcs-mysql
sudo apt update
sudo apt install docker.io npm
sudo docker build -t arculus-gcs-mysql:latest .
sudo docker run -p 3306:3306 --name arculus-gcs-db arculus-gcs-mysql
```

4. To turn up the node.js back-end application, navigate to `arculus-gcs/arculus-gcs-node/` and run the following commands to install the needed dependencies and start the API server on port 3001. 
```bash
#!/bin/bash
npm install
npm start
```

5. Before starting the UI of the Ground Control Client, update `arculus-gcs/config.js` with the public IP address of the controller node for API access.

6. Start the ReactJS UI application, navigate to `arculus-gcs/arculus-gcs-ui/` and run the following commands again to install the needed dependencies and start the API server. 
```bash
#!/bin/bash
npm install
npm start
```

### Adding a Node to the K3S Cluster

1. The addition of worker nodes to the cluster has been dynamized and centrally maintained on the Arculus Ground Control Client application.

2. This step does not require the complete codebase to run. The script located at `arculus-gcs/joinClusterWizard.sh` with the private IP address of the master node and the name being requested for the node as command-line arguments would be sufficient. Run the below script on the node you wish to add to the cluster from the directory containing the script.
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
