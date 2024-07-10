---
sidebar_position: 7
sidebar_label: <CurrentMissions />

---

# CurrentMissions Component

## Overview
The `<CurrentMissions />` component serves as the central dashboard for managing and executing drone missions within a simulated environment. It integrates various functionalities allowing users to create, monitor, and manipulate missions based on their roles.

## Component Functionality
This component combines several functionalities and sub-components to provide a comprehensive mission management system:

1. **Mission Listing and Selection**: Displays missions available to the user based on their role (Creator, Supervisor, Viewer) and allows for selection and further interaction.
2. **Mission Execution from Manifest**: Enables users to upload and execute missions from a predefined manifest file, ensuring precision and repeatability.
3. **Live Mission Execution and Monitoring**: Facilitates real-time control and monitoring of ongoing missions, providing tools for direct interaction such as simulating various mission challenges (e.g., communication loss, GPS spoofing).

## Sub-components
- [`<ListMissions />`](/docs/arculus-ui/components/missionPlanning/listMissions): Lists all the missions based on the user type and allows interaction.
- [`<ExecuteFromManifest />`](/docs/arculus-ui/components/missionPlanning/executeFromManifest): Provides functionality to execute missions from uploaded manifest files.
- [`<MissionExecution />`](/docs/arculus-ui/components/missionPlanning/missionExecution): Handles the real-time execution and monitoring of selected missions.
- [`<DroneRemote />`](/docs/arculus-ui/components/missionPlanning/droneRemote): Offers controls for manual intervention in drone operations.
- [`<LogConsole />`](/docs/arculus-ui/components/missionPlanning/logConsole): Displays logs and updates from mission operations to help monitor the current state and changes.
- [`<AlertButton />`](/docs/arculus-ui/components/missionPlanning/alertButton): Provides emergency controls to abort the mission or respond to critical situations.

## Design Details
- **User Interaction**: Through a tabbed interface, users can switch between different views such as listing missions, uploading mission manifests, and actively monitoring and controlling missions.
- **Responsive Design**: Adapts to different screen sizes and orientations, ensuring usability across devices.
- **Error Handling**: Implements robust error handling to manage and display errors during file uploads, API interactions, and live mission operations.

## Usage
This component is used in environments where drone mission management is critical, such as in logistics, surveillance, and automated delivery systems. It is particularly useful in simulation environments for training and testing purposes.

## Props
| Prop              | Type       | Description                                    |
|-------------------|------------|------------------------------------------------|
| `userType`        | `string`   | Defines the role of the user to tailor the displayed content and available actions. |
| `handleTabChange` | `function` | Function to switch between different operational tabs in the UI. |

This component is integral to systems requiring detailed mission planning, execution, and real-time operational control with a focus on interactivity and user role management.
