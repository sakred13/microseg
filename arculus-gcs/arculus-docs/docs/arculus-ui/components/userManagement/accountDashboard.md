---
sidebar_position: 12
sidebar_label: <AccountDashboard />

---

# AccountDashboard Component
## Overview
The `<AccountDashboard />` component provides a user interface for displaying and updating user account information. This component allows users to view their account details, manage domains, and change their password.

## Component Functionality
The `<AccountDashboard />` component serves several key functions:
1. **Display Account Information:** Shows details such as username, email, role, and associated domains.
2. **Edit Domains:** Utilizes an `Autocomplete` component to add or remove domains associated with the user.
3. **Password Management:** Offers functionality to change the current password.
4. **Update Profile:** Allows users to update their profile information after authentication.

## APIs Used
- **[`/user/getCurrentUser`](/docs/arculus-api/User#get-getcurrentuser) API:** Fetches the current user's details.
- **[`/user/updateUser`](/docs/arculus-api/User#post-updateuser) API:** Updates the user's profile information upon successful authentication and verification through the [`AuthenticationModal`](/docs/arculus-ui/components/userManagement/authenticationModal).

## Interaction and Design
- **Form Inputs:** Provides text fields for editing email and domains, along with read-only fields for username and role.
- **Change Password:** Toggleable fields for updating the user's password.
- **Verification Modal:** Utilizes [`<AuthenticationModal />`](/docs/arculus-ui/components/userManagement/authenticationModal) for additional security during sensitive account updates.

## Security and Authentication
- Ensures that changes to sensitive information like email and passwords are securely handled and require user authentication.

## User Experience
- **Responsive Layout:** Designed to be functional and visually appealing across different devices and screen sizes.
- **User Feedback:** Provides immediate feedback on the success or failure of update attempts.

