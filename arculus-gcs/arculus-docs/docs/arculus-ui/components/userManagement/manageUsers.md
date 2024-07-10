---
sidebar_position: 9
sidebar_label: <ManageUsers />

---

# ManageUsers Component
## Overview
The `<ManageUsers />` component serves as a comprehensive user management dashboard within the application. It facilitates the viewing, adding, editing, and deleting of user accounts, providing a central interface for administrative tasks related to user management.

## Component Functionality
The `<ManageUsers />` component incorporates several functionalities:
1. **Listing Users:** Displays a table of users, including details such as username, email, role, and associated domains.
2. **Adding New Users:** Integrates with [`<AddUserModal />`](/docs/arculus-ui/components/userManagement/addUserModal) to provide a dialog for entering new user details.
3. **Editing Existing Users:** Utilizes [`<EditUserModal />`](/docs/arculus-ui/components/userManagement/editUserModal) for updating details of existing users.
4. **Deleting Users:** Offers the capability to delete users with a confirmation dialog to prevent accidental deletions.

## APIs Used
- **[`/user/getUsers`](/docs/arculus-api/User#get-getusers) API:** Fetches the list of all users.
- **[`/user/deleteUser`](/docs/arculus-api/User#delete-deleteuser) API:** Handles the deletion of a user account.

## Interaction and Design
- **Modal Dialogs:** Uses modals for adding and editing user information, ensuring a seamless interaction without navigating away from the management dashboard.
- **Confirmation Dialogs:** Employs dialogs to confirm user deletion actions, enhancing usability and safety.
- **Dynamic Table:** The user list is dynamically updated based on actions taken, such as adding or deleting a user.

## Security and Authentication
- Ensures that all actions, such as adding, editing, and deleting users, are performed with proper authentication checks and are secured against unauthorized access.

## User Experience
- **Responsive Layout:** The user management dashboard is designed to be responsive, ensuring usability across various devices and screen sizes.
- **Immediate Feedback:** Provides immediate visual feedback for operations like add, edit, and delete through modal dialogs and dynamic table updates.

