#!/bin/bash

# Fetch the private IP address
PRIVATE_IP=$(hostname -I | awk '{print $1}')

sudo apt update
sudo apt install net-tools

# Set the K3S_NODE_NAME and INSTALL_K3S_EXEC variables
export K3S_NODE_NAME=controller
export INSTALL_K3S_EXEC="--write-kubeconfig ~/.kube/config --write-kubeconfig-mode 666 --node-external-ip $PRIVATE_IP --tls-san $PRIVATE_IP"

# Install k3s
curl -sfL https://get.k3s.io | sh -s -
