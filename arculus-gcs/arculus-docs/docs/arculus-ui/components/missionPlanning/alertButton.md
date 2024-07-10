---
sidebar_position: 11
sidebar_label: <AlertButton />

---

# AlertButton Component

## Overview
The `<AlertButton />` component allows users to perform critical actions based on their role within a system, such as aborting a mission, alerting creators, or reporting issues. It adapts its functionality and display according to the user's type, ensuring appropriate actions are accessible in mission-critical situations.

## Component Functionality
- **Role-Based Actions**: Dynamically changes the button's behavior and label based on the user type to ensure relevant functionalities are provided.
- **Event Handling**: Utilizes an `onClick` handler to execute a function passed through props, allowing it to be integrated flexibly within various parts of an application.
- **Styling**: Emphasizes visibility and urgency with a bold and red aesthetic, drawing the user's attention and indicating the importance of the actions it triggers.

## Design Details
- **Color Scheme**:
  - Background Color: A striking creamish red (`#d63838`), designed to stand out and signify urgent actions.
  - Text Color: White, ensuring high contrast for readability.
- **Text and Layout**:
  - Font Weight: Bold, to highlight the button's importance.
  - Padding: `10px 20px`, providing a tactile and comfortable click area.
  - Border Radius: `5px`, for a modern, rounded look.
  - Cursor: Pointer, indicating an interactive element.

## Usage
The `<AlertButton />` is primarily used in operational interfaces where quick and decisive actions are necessary:
- **Mission Control Dashboards**: Where mission creators, supervisors, or viewers need to intervene swiftly in operational activities.
- **Administrative Panels**: In systems requiring high-level administrative interactions like emergency stops or alerts.
- **Safety-Critical Applications**: Where users must report safety concerns or command discrepancies quickly.
