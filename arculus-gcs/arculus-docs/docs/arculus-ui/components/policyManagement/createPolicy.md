---
sidebar_position: 16
sidebar_label: <CreatePolicy />

---

# CreatePolicy Component
## Overview
The `<CreatePolicy />` component provides a user interface for creating network policies within the application. It enables users to define ingress and egress rules for devices, facilitating the management of network traffic permissions based on specific criteria.

## Component Functionality
The `<CreatePolicy />` component includes:
1. **Device Selection:** Allows users to select a device for which the policy will be applied.
2. **Rule Definition:** Provides interfaces to add ingress and egress rules, specifying the allowed connections and protocols.
3. **Feedback Mechanism:** Displays a snackbar notification to inform the user about the success or failure of policy creation.

## APIs Used
- **[`/device/getTrustedDevices`](/docs/arculus-api/Device#get-gettrusteddevices) API:** Fetches a list of devices that can be used to create policies.
- **[`/policy/addNetworkPolicy`](/docs/arculus-api/Policy#post-addnetworkpolicy) API:** Submits the defined network policy to the server for creation.

## Interaction and Design
- **Form Controls:** Utilizes form elements such as `Select`, `TextField`, and `IconButton` to allow users to input and manage policy details.
- **Dynamic Rule Management:** Users can dynamically add or remove rule sets for both ingress and egress directions.
- **Snackbar Notifications:** Provides real-time feedback using `Snackbar` to show notifications after attempting to create a policy.

## Security and Authentication
- Ensures that interactions with the network policy creation are secure and authenticated using the provided authToken.

## User Experience
- **Responsive Design:** Ensures the component is usable and visually appealing across various devices and screen sizes.
- **Intuitive User Flow:** Guides the user through the policy creation process with clear steps and immediate feedback on actions.

