# Device APIs
The Device APIs are used to add devices to the Arculus cluster, configure and deconfigure them, and remove them from the cluster.

## GET GetTrustedDevices

**Method**: GET

**URL**: http://{serverIP}:3001/device/getTrustedDevices?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

**Description**: This API fetches the list of devices configured with K3s pods when provided with an authorized Mission Creator user.

### Query Parameters
- **authToken**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

### Response
**Status**: OK (200)

```json
[
    {
        "device_id": 70,
        "device_name": "survdrone",
        "ip_address": "10.42.16.11",
        "personnel_rank": null,
        "device_type": "Freight Drone",
        "allowedTasks": [
            "send_sensordata",
            "send_posdata",
            "receive_command"
        ]
    },
    {
        "device_id": 77,
        "device_name": "relaydrone",
        "ip_address": "10.42.21.8",
        "personnel_rank": null,
        "device_type": "Communication Relay Drone",
        "allowedTasks": [
            "send_command",
            "send_video",
            "send_sensordata",
            "send_posdata",
            "receive_posdata",
            "receive_sensordata",
            "receive_video",
            "receive_command"
        ]
    },
    {
        "device_id": 78,
        "device_name": "surveillancedrone",
        "ip_address": "10.42.20.9",
        "personnel_rank": null,
        "device_type": "Video Capture Drone",
        "allowedTasks": [
            "send_video",
            "send_sensordata",
            "send_posdata",
            "receive_command"
        ]
    },
    {
        "device_id": 79,
        "device_name": "dronelatest",
        "ip_address": "10.42.24.3",
        "personnel_rank": null,
        "device_type": "Communication Relay Drone",
        "allowedTasks": [
            "send_command",
            "send_sensordata",
            "send_posdata",
            "receive_sensordata",
            "receive_command"
        ]
    },
    {
        "device_id": 80,
        "device_name": "newdemodrone",
        "ip_address": "10.42.23.8",
        "personnel_rank": null,
        "device_type": "Freight Drone",
        "allowedTasks": [
            "send_sensordata",
            "send_posdata",
            "receive_command"
        ]
    },
    {
        "device_id": 81,
        "device_name": "armdevice",
        "ip_address": "10.42.25.3",
        "personnel_rank": null,
        "device_type": "Video Capture Drone",
        "allowedTasks": [
            "send_video",
            "send_sensordata",
            "send_posdata",
            "receive_command"
        ]
    },
    {
        "device_id": 82,
        "device_name": "killerdrone",
        "ip_address": "10.42.26.3",
        "personnel_rank": null,
        "device_type": "Freight Drone",
        "allowedTasks": [
            "send_command",
            "receive_sensordata"
        ]
    }
]
```

## GET GetMoreNodes

**Method**: GET

**URL**: http://{serverIP}:3001/device/getMoreNodes?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

**Description**: This API fetches devices in the cluster that aren't configured with functions and K3s pods.

### Query Parameters
- **authToken**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

### Response
**Status**: OK (200)

```json
[
    {
        "nodeName": "controller",
        "nodeIP": "172.31.88.29"
    }
]
```

## DELETE RemoveTrustedDevice

**Method**: DELETE

**URL**: http://{serverIP}:3001/device/removeTrustedDevice?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug&deviceName=controller

**Description**: This API accepts an authorization token and device name, and deletes the device on the user being an authorized Mission Creator.

### Query Parameters
- **authToken**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug
- **deviceName**: controller

### Response
**Status**: OK (200)

```json
{
    "message": "Trusted device and associated pod removed successfully"
}
```

## POST AddTrustedDevice

**Method**: POST

**URL**: http://{serverIP}:3001/device/addTrustedDevice

**Description**: This API is used to configure a node with virtualized functionality for a specific device type and its allowed functions.

### Request Body
```json
{

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug",

    "deviceName": "controller",

    "ipAddress": "172.31.88.29",

    "deviceType": "Video Analytic Controller",

    "tasks": [

        "send_command",

        "receive_posdata",

        "receive_sensordata",

        "receive_video"

    ]

}
```

### Response
**Status**: OK (200)

```json
{
    "message": "Trusted device added successfully"
}
```

## PUT UpdateTrustedDevice

**Method**: PUT

**URL**: http://{serverIP}:3001/device/updateTrustedDevice

**Description**: This API updates the allowed functions for a configured device.

### Request Body
```json
{

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug",

    "deviceName": "controller",

    "ipAddress": "10.42.0.232",

    "currentName": "controller",

    "tasks": [

        "send_command",

        "receive_sensordata",

        "receive_posdata"

    ]

}
```

### Response
**Status**: OK (200)

```json
{
    "message": "Trusted device updated successfully"
}
```

## POST AddToCluster

**Method**: POST

**URL**: http://{serverIP}:3001/device/addToCluster

**Description**: This API adds a device to the Arculus cluster when an authorized user accepts a join cluster request.

### Request Body
```json
{

    "ipAddress": "162.219.62.167",

    "nodeName": "newDrone1",

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug"

}
```

### Response
**Status**: OK (200)

```json
{
    "message": "Added to cluster successfully."
}
```

## DELETE RemoveFromCluster

**Method**: DELETE

**URL**: http://{serverIP}:3001/device/removeFromCluster

**Description**: This API removes devices from the K3s cluster when an authorized user removes it using the "Remove from cluster" button.

### Request Body
```json
{

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug",

    "nodeName": "dronex"

}
```

### Response
**Status**: Internal Server Error (500)

```json
{
    "message": "Internal Server Error"
}
```

