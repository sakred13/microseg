---
sidebar_position: 15
sidebar_label: <ListPolicies />

---

# ListPolicies Component
## Overview
The `<ListPolicies />` component is designed to display a list of active network policies within the application. It provides functionality for viewing, editing, and deleting network policies, integrating essential aspects of network policy management.

## Component Functionality
The `<ListPolicies />` component encompasses several functionalities:
1. **Display of Policies:** Lists all current network policies, showing details like policy ID, associated devices, and rules.
2. **Delete Functionality:** Offers the ability to delete a policy with a confirmation dialog to prevent accidental deletions.
3. **Loading State:** Provides feedback during data fetching to indicate loading status.

## APIs Used
- **[`/policy/getNetworkPolicies`](/docs/arculus-api/Policy#get-getnetworkpolicies) API:** Fetches the list of network policies.
- **[`/policy/deleteNetworkPolicy`](/docs/arculus-api/Policy#deletenetworkpolicy) API:** Handles the deletion of a network policy.

## Interaction and Design
- **Interactive Table:** Utilizes a `Table` component to display policy details interactively, allowing users to quickly understand and manage policies.
- **Confirmation Dialogs:** Employs dialogs to confirm deletion actions, enhancing usability and safety.
- **Error Handling:** Implements error handling for fetch and deletion operations, ensuring robust operation under various network conditions.

## Security and Authentication
- Ensures that all interactions with network policies are securely managed and require proper authentication, protecting sensitive operations from unauthorized access.

## User Experience
- **Responsive Layout:** Designed to be functional and visually appealing across different devices and screen sizes.
- **Feedback Mechanisms:** Provides immediate visual feedback on the status of network operations, including loading indicators and success or error messages.

