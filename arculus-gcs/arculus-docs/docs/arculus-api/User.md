# User APIs

The User APIs handle the user management functionalities like updating, deleting, and fetching user information.

## DELETE DeleteUser

**Method**: DELETE

**URL**: http://{serverIP}:3001/user/deleteUser?username=newuser&authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

**Description**: The /deleteUser API can be used by authorized Mission Creator users to delete other users.

### Query Parameters
- **username**: newuser
- **authToken**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

### Response
**Status**: OK (200)

```json
{
    "message": "User deleted successfully"
}
```

## GET GetUsers

**Method**: GET

**URL**: http://{serverIP}:3001/user/getUsers?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

**Description**: The /getUsers API fetches all the users in Arculus accepting a valid Mission Creator user.

### Query Parameters
- **authToken**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

### Response
**Status**: OK (200)

```json
[
    {
        "username": "Arculus",
        "email": "arculus@demo.com",
        "user_id": 25,
        "role_name": "Mission Creator",
        "domains": "Explosive Ordnance Reconnaissance,Covert Operations Support,Structural Integrity Assessment,Crisis Response and Restoration"
    },
    {
        "username": "mizzouceri",
        "email": "mizzouceri@umsystem.edu",
        "user_id": 26,
        "role_name": "Mission Creator",
        "domains": "Covert Operations Support,Structural Integrity Assessment,Crisis Response and Restoration"
    },
    {
        "username": "Vamsi",
        "email": "vpkmp@umsystem.edu",
        "user_id": 29,
        "role_name": "Mission Creator",
        "domains": "Explosive Ordnance Reconnaissance,Covert Operations Support"
    },
    {
        "username": "cerisupervisor",
        "email": "cerisupervisor@missouri.edu",
        "user_id": 28,
        "role_name": "Mission Supervisor",
        "domains": "Covert Operations Support,Structural Integrity Assessment"
    },
    {
        "username": "ceriviewer",
        "email": "ceriviewer@missouri.edu",
        "user_id": 27,
        "role_name": "Mission Viewer",
        "domains": "Covert Operations Support,Structural Integrity Assessment"
    }
]
```

## POST UpdateUser

**Method**: POST

**URL**: http://{serverIP}:3001/user/updateUser

**Description**: The /updateUser API is used to edit user information and configuration by an authorized Mission Creator user.

### Request Body
```json
{

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM",

    "user": "mizzouceri",

    "updated_username": "mizzouceri",

    "email_id": "mizzouceri@umsystem.edu",

    "role": "Mission Creator",

    "domains": "Covert Operations Support,Structural Integrity Assessment,Crisis Response and Restoration,Explosive Ordnance Reconnaissance"

}


```

### Response
**Status**: OK (200)

```json
{
    "message": "User updated successfully"
}
```

## GET GetCurrentUser

**Method**: GET

**URL**: http://{serverIP}:3001/user/getCurrentUser?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

**Description**: This API fetches the information of the current user using his/her authorization token.

### Query Parameters
- **authToken**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

