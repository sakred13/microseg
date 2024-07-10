# Auth APIs

The Authorization APIs handle the user creation, sign-in and session management of the application.

## POST Login

**Method**: POST

**URL**: http://{serverIP}:3001/auth/login

**Description**: The login API accepts the username and password of the user, verifies them, and issues an encrypted JWT token with a one-hour access session.

### Request Body
```json
{

    "username": "Arculus",

    "password": "password"

}
```

### Response
**Status**: OK (200)

```json
{
    "status": 200,
    "message": "Logged in successfully",
    "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk3ODEsImV4cCI6MTcxODkzMzM4MX0.Tk3StLwQ4tOfzmmX6PNb_BcAd45kUt-hZZ7Ht0bWye8",
    "user": "Arculus"
}
```

## GET Authorize

**Method**: GET

**URL**: http://{serverIP}:3001/auth/authorize?authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

**Description**: The /authorize API checks the authorization token and returns the user type for the UI to render content based on the user role.

### Query Parameters
- **authToken**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug

### Response
**Status**: OK (200)

```json
{
    "message": "User is authorized",
    "userType": "Mission Creator"
}
```

## POST Signup

**Method**: POST

**URL**: http://{serverIP}:3001/auth/signup

**Description**: The /signup API accepts new user information, verifies there is no duplication of user information, creates the new user, and returns success/failure status.

### Request Body
```json
{

    "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug",

    "username": "newuser",

    "email": "newuser@gmail.com",

    "role": "Mission Supervisor",

    "password": "qwertyuiop",

    "domains": "Explosive Ordnance Reconnaissance,Structural Integrity Assessment"

}
```

### Response
**Status**: OK (200)

```json
{
    "message": "User account created successfully"
}
```

## POST SendEmailForAuth

**Method**: POST

**URL**: http://{serverIP}:3001/auth/sendEmailForAuth

**Description**: The /sendEmailForAuth API sends an authentication e-mail to the user's address with a one-time password (OTP).

### Request Body
```json
{

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug"

}
```

### Response
**Status**: OK (200)

```json
{
    "message": "Email successfully sent"
}
```

## PUT SetZTMode

**Method**: PUT

**URL**: http://{serverIP}:3001/auth/setZtMode?mode=no_zt

**Description**: The /setZtMode API changes the Zero Trust mode used by the backend based on the dropdown option chosen by the user.

### Query Parameters
- **mode**: no_zt

### Request Body
```json
{

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5MzMxNzYsImV4cCI6MTcxODkzNjc3Nn0.MMGXVLY9-F7zACJc_70L5IQeAjKzcxb2my2_4X_AxEM"

}
```

### Response
**Status**: OK (200)

```json
{
    "message": "Zero Trust mode changed successfully"
}
```

## POST VerifyOTP

**Method**: POST

**URL**: http://{serverIP}:3001/auth/verifyOtp

**Description**: The /verifyOtp API checks the input OTP and verifies it against the issues code. It returns a failure status if the OTP is incorrect.

### Request Body
```json
{

    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFyY3VsdXMiLCJwYXNzd29yZCI6IkJ1cm5pdGUuMjQiLCJpYXQiOjE3MTg5Mjk1MzAsImV4cCI6MTcxODkzMzEzMH0.3l8GFdBJyng8CZ8GU7nBS-d4BJ1JiTyuZ9WEWp1Cgug",

    "otp": "836657"

}
```

### Response
**Status**: Forbidden (403)

```json
{
    "message": "Incorrect OTP"
}
```

