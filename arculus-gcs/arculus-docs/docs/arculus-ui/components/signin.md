---
sidebar_position: 2
sidebar_label: <SignIn />

---
# SignIn Component
## Overview
The `<SignIn />` component is a fundamental part of the authentication system in the application. It provides a user-friendly interface for users to log in by entering their credentials. This component handles form submission to authenticate users via API calls.

## Component Functionality
The `<SignIn />` component serves the following purposes:
1. **Render the Sign-In Form:** It displays a form with fields for username and password, and a submit button.
2. **User Authentication:** It processes form submissions by sending the entered credentials to the authentication API.
3. **State Management:** It manages the authentication state and navigates users to the appropriate page upon successful login.
4. **Error Handling:** It displays error messages for invalid credentials or unexpected errors during the login process.

## APIs Used
- **[`/auth/login`](/docs/arculus-api/Auth#post-login) API:** This API endpoint is called during form submission to authenticate the user. It sends a POST request with the username and password. On successful authentication, it returns a JWT token and user information.
- **[`/auth/authorize`](/docs/arculus-api/Auth#get-authorize) API:** This API is indirectly referenced through the application's routing logic. It checks the validity of the JWT token to ensure the user is authenticated.

---

