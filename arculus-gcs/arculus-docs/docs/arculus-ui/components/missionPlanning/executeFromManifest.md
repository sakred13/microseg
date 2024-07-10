---
sidebar_position: 6
sidebar_label: <ExecuteFromManifest />

---

# ExecuteFromManifest Component

## Overview
The `<ExecuteFromManifest />` component allows users to upload mission configuration files (manifests) and execute missions based on the configurations specified within these files.

## Component Functionality
This component supports the entire lifecycle of mission execution from file upload to actual mission launch:

1. **File Upload**: Users can upload a mission manifest file which contains all necessary mission parameters.
2. **File Validation**: Validates the uploaded file to ensure it conforms to expected formats and contains all required data.
3. **Mission Preparation**: Extracts mission data from the file and prepares it for execution.
4. **Mission Execution**: Initiates the mission based on the extracted data, handling the mission's execution logic and displaying progress.

## Design Details
- **Visual Elements**: 
  - Uses Material-UI components such as `Button`, `Typography`, `Box`, and `Paper` to create a user-friendly interface.
  - Icons like `CloseIcon` and `HourglassEmptyIcon` provide intuitive interaction cues for removing files and indicating processing states, respectively.

- **Layout**:
  - The component layout is structured to guide the user through the file upload process, display of file content, and execution actions in a logical and easy-to-follow manner.

## Usage
The `<ExecuteFromManifest />` component is typically used in systems that require complex setups before mission execution, where configurations are predefined and stored in files for repeatability and automation.

## Props
| Prop                   | Type       | Description                                       |
|------------------------|------------|---------------------------------------------------|
| `handleTabChange`      | `function` | Callback to switch between different UI tabs.     |
| `setDeviceName`        | `function` | Function to set the name of the device being used in the mission. |
| `setSelectedLocation`  | `function` | Sets the geographical location for the mission based on the manifest. |

This markdown documentation encapsulates the `<ExecuteFromManifest />` component's functionality and usage, providing all necessary details to understand and integrate it within a broader application context.
