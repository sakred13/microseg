#!/bin/bash

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo "curl is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y curl
fi

# Check if correct number of arguments provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <m> <n>"
    exit 1
fi

# Assign command-line arguments to variables
m=$1
n=$2

# Function to make the API call
make_api_call() {
    # Example API call using curl
    response=$(curl -s -X GET "http://44.212.14.107:3001/api/authenticate?processInfo=node1@$$")
    echo "API response: $response"
}

# Function for busy waiting
busy_wait() {
    end_time=$((SECONDS + $1))
    while [ $SECONDS -lt $end_time ]; do
        # Perform a non-intensive task
        :  # No-op, do nothing
    done
}

# Infinite loop to make API calls
while true; do
    # Make m API calls with 1-second interval
    for ((i=0; i<m; i++)); do
        make_api_call
        echo "Made API call $((i+1))"
        busy_wait 1  # Wait for 1 second
    done
    
    # Wait for n seconds
    echo "Waiting for $n seconds..."
    busy_wait $n
done
