---
sidebar_position: 6
sidebar_label: <AddDeviceModal />

---

# AddDeviceModal Component
## Overview
The `<AddDeviceModal />` component facilitates the addition of new trusted devices into the system. It is designed to handle user input in a modal dialog, offering a form to input device details and register them within the system.

## Component Functionality
The `<AddDeviceModal />` component serves the following key purposes:
1. **Form Input for Device Details:** Provides input fields for device name, IP address, device type, and allowed operations.
2. **Dynamic Rule Generation:** Generates ingress and egress rules based on selected operations to configure device networking correctly.
3. **Validation and Submission:** Ensures that all required fields are filled before submitting and handles the creation of new trusted devices through API calls.
4. **Success Indication:** Displays a success message with an icon when a device is successfully added.

## APIs Used
- **`/device/addTrustedDevice` API:** This API endpoint is called to register a new device with the provided details. It expects device name, IP address, device type, and the allowed operations.

## Design and Interaction
- **Modal Design:** Utilizes the `Modal` component from Material-UI for a consistent and clean user interface.
- **Form Handling:** Manages form state and interactions, including data validation, submission, and error handling.
- **Success and Error Feedback:** Provides immediate feedback on the success or failure of device addition operations.

## Security and Data Handling
- Ensures that data transmitted during device addition is protected through secure API calls and that user input is validated both client-side and server-side to prevent common web vulnerabilities.

## User Experience
- **Responsive Form Design:** Adapts to various screen sizes and device types to ensure usability across all platforms.
- **Clear Visual Feedback:** Utilizes icons and typography to clearly communicate success states and action items to the user.

