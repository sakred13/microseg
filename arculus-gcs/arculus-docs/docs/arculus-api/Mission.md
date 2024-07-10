# Mission APIs

The Mission APIs are used for the web simulation of various phases of a mission from its creation to its execution or abortion.

## GET GetMissionByCreatorId

**Method**: GET

**URL**: http://{serverIP}:3001/mission/getMissionsByCreatorId?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM

**Description**: This API fetches the list of all missions created by a certain Mission Creator user by fetching his/her user ID.

### Query Parameters
- **authToken**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM

### Response
**Status**: OK (200)

```json
{
    "missions": [
        {
            "config": "{\"location\":\"/desert.png\",\"mission_type\":\"Stealthy Reconnaissance and Resupply\",\"gcX\":202.3168,\"gcY\":420.0448,\"destX\":1316.422566055701,\"destY\":477.75291597238754,\"selections\":{\"Video-Analytic Route Planner (Ground Control)\":\"controller\",\"Video Collection Surveillance Drone\":\"surveillancedrone\",\"Supply Delivery Drone\":\"newdemodrone\",\"Communication Relay Drone\":\"relaydrone\"},\"create_time\":\"2024-06-04 18:22:38\",\"duration_sec\":120}",
            "state": "SUCCESSFUL",
            "supervisors": [
                "cerisupervisor"
            ],
            "viewers": [
                "ceriviewer"
            ],
            "mission_id": 450
        },
        {
            "config": "{\"location\":\"/desert.png\",\"mission_type\":\"Stealthy Reconnaissance and Resupply\",\"gcX\":202.3168,\"gcY\":420.0448,\"destX\":1377.262937395858,\"destY\":368.55224946441325,\"selections\":{\"Video-Analytic Route Planner (Ground Control)\":\"controller\",\"Video Collection Surveillance Drone\":\"surveillancedrone\",\"Supply Delivery Drone\":\"newdemodrone\",\"Communication Relay Drone\":\"relaydrone\"},\"duration_sec\":120,\"create_time\":\"2024-06-04 18:30:54\"}",
            "state": "SUCCESSFUL",
            "supervisors": [],
            "viewers": [],
            "mission_id": 451
        },
        {
            "config": "{\"location\":\"/desert.png\",\"mission_type\":\"Stealthy Reconnaissance and Resupply\",\"gcX\":202.3168,\"gcY\":420.0448,\"destX\":1377.262937395858,\"destY\":368.55224946441325,\"selections\":{\"Video-Analytic Route Planner (Ground Control)\":\"controller\",\"Video Collection Surveillance Drone\":\"surveillancedrone\",\"Supply Delivery Drone\":\"newdemodrone\",\"Communication Relay Drone\":\"relaydrone\"},\"duration_sec\":120,\"create_time\":\"2024-06-04 18:55:13\"}",
            "state": "SUCCESSFUL",
            "supervisors": [],
            "viewers": [],
            "mission_id": 459
        },
        {
            "config": "{\"location\":\"/desert.png\",\"mission_type\":\"Stealthy Reconnaissance and Resupply\",\"gcX\":202.3168,\"gcY\":420.0448,\"destX\":1377.262937395858,\"destY\":368.55224946441325,\"selections\":{\"Video-Analytic Route Planner (Ground Control)\":\"controller\",\"Video Collection Surveillance Drone\":\"surveillancedrone\",\"Supply Delivery Drone\":\"newdemodrone\",\"Communication Relay Drone\":\"relaydrone\"},\"duration_sec\":120,\"create_time\":\"2024-06-04 18:58:58\"}",
            "state": "SUCCESSFUL",
            "supervisors": [],
            "viewers": [],
            "mission_id": 461
        },
        {
            "config": "{\"location\":\"/desert.png\",\"mission_type\":\"Stealthy Reconnaissance and Resupply\",\"gcX\":202.3168,\"gcY\":420.0448,\"destX\":1377.262937395858,\"destY\":368.55224946441325,\"selections\":{\"Video-Analytic Route Planner (Ground Control)\":\"controller\",\"Video Collection Surveillance Drone\":\"surveillancedrone\",\"Supply Delivery Drone\":\"newdemodrone\",\"Communication Relay Drone\":\"relaydrone\"},\"duration_sec\":120,\"create_time\":\"2024-06-04 19:09:37\"}",
            "state": "SUCCESSFUL",
            "supervisors": [],
            "viewers": [],
            "mission_id": 468
        },
        {
            "config": "{\"location\":\"/desert.png\",\"mission_type\":\"Stealthy Reconnaissance and Resupply\",\"gcX\":202.3168,\"gcY\":420.0448,\"destX\":1377.262937395858,\"destY\":368.55224946441325,\"selections\":{\"Video-Analytic Route Planner (Ground Control)\":\"controller\",\"Video Collection Surveillance Drone\":\"surveillancedrone\",\"Supply Delivery Drone\":\"newdemodrone\",\"Communication Relay Drone\":\"relaydrone\"},\"duration_sec\":120,\"create_time\":\"2024-06-04 19:12:26\"}",
            "state": "SUCCESSFUL",
            "supervisors": [],
            "viewers": [],
            "mission_id": 470
        }
    ]
}
```

## POST CreateMission

**Method**: POST

**URL**: http://{serverIP}:3001/mission/createMission

**Description**: This API authorizes if the user requesting is a Mission Creator and on success, it creates a new mission.

### Request Body
```json
{

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM",

    "mission_config": "{\"location\":\"/desert.png\",\"mission_type\":\"Stealthy Reconnaissance and Resupply\",\"gcX\":202.3168,\"gcY\":420.0448,\"destX\":1370.660164933668,\"destY\":465.848404446038,\"selections\":{\"Video-Analytic Route Planner (Ground Control)\":\"controller\",\"Video Collection Surveillance Drone\":\"surveillancedrone\",\"Supply Delivery Drone\":\"survdrone\",\"Communication Relay Drone\":\"relaydrone\"},\"create_time\":\"2024-06-21 01:43:44\",\"duration_sec\":120}",

    "supervisors": [],

    "viewers": []

}
```

### Response
**Status**: OK (200)

```json
{
    "missionId": 473
}
```

## POST ExecuteStealthyReconAndResupply

**Method**: POST

**URL**: http://{serverIP}:3001/mission/executeStealthyReconAndResupply

**Description**: This API is used to execute the Stealthy Reconnaissance and Resupply mission with the mission information.

### Request Body
```json
{

    "gcX": 202.3168,

    "gcY": 420.0448,

    "destX": 1370.660164933668,

    "destY": 465.848404446038,

    "controller": "controller",

    "supplyDrone": "survdrone",

    "surveillanceDrone": "surveillancedrone",

    "relayDrone": "relaydrone",

    "missionId": 472

}
```

### Response
**Status**: OK (200)

```json
{
    "message": "IP retrieval initiated"
}
```

