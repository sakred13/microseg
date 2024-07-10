---
sidebar_position: 3  
sidebar_label: <AccessWrapper />

---

# AccessWrapper Component
## Overview
The `<AccessWrapper />` component is a critical element in controlling access to various components based on user roles and permissions. It determines whether a user should have access to a component and handles authorization checks via API calls.

## Component Functionality
The `<AccessWrapper />` component provides several key functionalities:
1. **User Role Verification:** Checks the user's role against permitted roles to determine access rights.
2. **Dynamic Component Rendering:** Conditionally renders child components based on user authorization.
3. **State Management:** Manages the state of user types, legitimacy checks, and error handling.
4. **Error Handling:** Displays error messages if there are issues during the authorization check.

## APIs Used
- **`/auth/authorize` API:** This endpoint is used to verify if the user's JWT token is valid and fetches the user's role type. Based on this role, it determines whether the user can access the component or not.

## Implementation Details
The `AccessWrapper` component operates by:
- Fetching the user's JWT token from cookies and making an API call to [`/auth/authorize`](/docs/arculus-api/Auth#get-authorize) to retrieve the user type.
- Comparing the fetched user type against a list of allowed user types provided via props.
- Conditionally rendering the child component if the user type is among the allowed types or rendering a [`<NoAccess />`](/docs/arculus-ui/components/auth/noaccess) component otherwise.
- Handling and displaying errors if the API call fails or if the user type cannot be determined.
