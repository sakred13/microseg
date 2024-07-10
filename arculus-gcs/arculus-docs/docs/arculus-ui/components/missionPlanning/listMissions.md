---
sidebar_position: 4
sidebar_label: <ListMissions />

---

# ListMissions Component

## Overview
The `<ListMissions />` component is responsible for fetching and displaying a list of missions based on the user's role. It allows mission creators to execute and delete missions, while supervisors and viewers can monitor ongoing missions.

## Component Functionality
This component integrates critical mission management functionalities tailored for different user roles within a sophisticated mission planning and monitoring interface.

### Features
- **Dynamic Data Fetching**: Fetches missions dynamically based on the user type—creator, supervisor, or viewer.
- **Mission Execution**: Allows mission creators to start missions if they are not in an 'IN EXECUTION', 'SUCCESSFUL', or 'ABORTED' state.
- **Monitoring and Deletion**: Provides mechanisms for monitoring ongoing missions and deleting missions when necessary, with safeguards to prevent deletion during execution.

### User Interaction
- **Execute Mission**: Mission creators can initiate a mission execution directly from the list.
- **View Mission Details**: Users can view detailed information about the mission setup and status.
- **Delete Mission**: Mission creators can remove missions that are no longer needed or relevant.

## Design Details
- **Visual Layout**: Utilizes a `Table` from Material-UI to present mission data in a structured format.
- **Interactive Elements**: Includes `IconButton` components for actions like executing and deleting missions.
- **Feedback Mechanisms**: Uses dialogs to confirm deletion requests and displays loading indicators during mission execution.

## Usage
`<ListMissions />` is used in the mission management dashboard where users with different roles manage their missions. It is a crucial component for maintaining operational oversight and control over mission lifecycles.

## Props
| Prop              | Type     | Description                           |
|-------------------|----------|---------------------------------------|
| `authToken`       | `string` | Authentication token for API requests |
| `setSelectedLocation` | `function` | Function to set the location in global state for routing |
| `setDeviceName`   | `function` | Function to set the selected device name in global state |
| `setActiveTab`    | `function` | Function to navigate between different tabs in the dashboard |
| `userType`        | `string` | Type of the user to fetch appropriate missions |
| `setVideoCollectionDrone` | `function` | Function to set the selected video collection drone in global state |
| `setSupplyDeliveryDrone` | `function` | Function to set the selected supply delivery drone in global state |
