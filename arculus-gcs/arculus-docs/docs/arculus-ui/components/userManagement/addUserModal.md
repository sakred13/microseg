---
sidebar_position: 10
sidebar_label: <AddUserModal />

---

# AddUserModal Component
## Overview
The `<AddUserModal />` component is used for adding new users to the system. It provides a form within a modal for administrators to input new user details, including username, email, role, domains, and password.

## Component Functionality
The `<AddUserModal />` component encompasses several functionalities:
1. **User Data Form:** Offers input fields for the user's basic information and credentials.
2. **Validation:** Ensures that all inputs meet specified criteria before submission.
3. **Success Feedback:** Displays a success message upon successful user creation.
4. **Role and Domain Selection:** Includes dropdowns and an autocomplete component for selecting user roles and domains.

## APIs Used
- **[`/auth/signup`](/docs/arculus-api/Auth#post-signup) API:** This endpoint is used to create new users. It accepts user details and returns success or error messages based on the outcome of the user creation process.

## Interaction and Design
- **Form Submission:** Handles data validation on the client side before submitting to the server.
- **Error Handling:** Provides error messages for individual form fields to ensure the user correctly fills out all required information.
- **Modal Design:** Utilizes the `Modal` component to provide a focused environment for user data entry without navigating away from the current page.

## Security and Data Handling
- Ensures sensitive user information such as passwords are handled securely through HTTPS requests and appropriate backend validations.

## User Experience
- **Responsive Form Design:** The form is designed to be responsive and accessible on various devices and screen sizes.
- **Clear Visual Feedback:** Uses typography and icons to communicate the state of the form, including errors and successful submission.

