---
sidebar_position: 2
sidebar_label: <MissionPlanner />

---
# MissionPlanner Component
## Overview
The `<MissionPlanner />` component allows users to plan and configure detailed military missions within the application. It provides functionality for selecting mission types, specifying locations on an interactive map, and assigning roles such as supervisors and viewers.

## Component Functionality
1. **Select Mission Type:** Users can choose from predefined mission types that specify the objectives and requirements of the operation.
2. **Mission Configuration:** Users can configure mission details including asset criticality, life threats, and data sensitivity.
3. **Role Assignment:** The component enables assignment of roles to different users to ensure proper management and oversight of the mission.

## APIs Used
- **[`/user/getUsers`](/docs/arculus-api/User#get-getusers) API:** Fetches users based on roles to assign as supervisors or viewers for the mission.
- **[`/mission/createMission`](/docs/arculus-api/Mission#post-createmission) API:** Submits the configured mission details to the backend for processing and execution.
- **[`/device/getTrustedDevices`](/docs/arculus-api/Device#get-gettrusteddevices) API:** Retrieves devices that are eligible for involvement in the mission based on their capabilities and approved usage.

---

