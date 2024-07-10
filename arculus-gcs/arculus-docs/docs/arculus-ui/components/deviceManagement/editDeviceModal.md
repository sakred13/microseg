---
sidebar_position: 7
sidebar_label: <EditDeviceModal />

---

# EditDeviceModal Component
## Overview
The `<EditDeviceModal />` component is designed to facilitate the editing of device details within the system. It provides a user interface for modifying information about a trusted device, including its name, IP address, and allowed operations.

## Component Functionality
The `<EditDeviceModal />` component serves several purposes:
1. **Form for Editing Device Details:** Provides a structured form to update the device's name, IP address, and the operations it is allowed to perform.
2. **Validation and Submission:** Ensures all required fields are correctly filled before allowing the submission to update device details.
3. **Dynamic Rule Generation:** Automatically generates ingress and egress rules based on the allowed operations assigned to the device.
4. **Success Indication:** Displays a success message upon successful update of the device details.

## APIs Used
- **[`/device/updateTrustedDevice`](/docs/arculus-api/Device#put-updatetrusteddevice) API:** This endpoint is used to update the details of a trusted device in the system. It accepts details such as the device's name, IP address, and allowed operations.

## Design and Interaction
- **Modal Presentation:** Uses a `Modal` component to present the form in a dialog overlay, providing a focused environment for entering device details.
- **Form Controls and Validation:** Incorporates form elements like `TextField` and `Autocomplete` for input, with validation to ensure data integrity.
- **Feedback Mechanisms:** Provides feedback through success messages and error handling to inform the user of the system's state.

## Security and Authentication
- Ensures that API calls to update device details are authenticated and secure, preventing unauthorized modifications.

## User Experience
- **Responsive Design:** Ensures the modal and form elements are responsive, providing a consistent experience across different devices.
- **Visual Feedback:** Utilizes visual cues such as success icons and typography to clearly communicate the outcome of update operations.

