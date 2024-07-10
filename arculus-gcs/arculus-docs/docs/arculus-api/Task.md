# Task APIs

The task API fetches the list of available functions from the database to configure them for devices.

## GET GetTasks

**Method**: GET

**URL**: http://{serverIP}:3001/task/getTasks?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM

**Description**: The task API fetches the list of available functions from the database to configure them for devices.

### Query Parameters
- **authToken**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM

### Response
**Status**: OK (200)

```json
{
    "taskNames": [
        "send_command",
        "send_video",
        "send_sensordata",
        "send_posdata",
        "receive_posdata",
        "receive_sensordata",
        "receive_video",
        "receive_command"
    ]
}
```

