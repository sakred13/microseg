---
sidebar_position: 5
sidebar_label: <MissionExecution />

---

# MissionExecution Component

## Overview
The `<MissionExecution />` component visualizes the dynamic state of missions by updating positions and statuses of drones and other relevant entities in real time.

## Component Functionality
This component tracks and controls different aspects of a mission such as surveillance, supply delivery, and communication relay drones, integrating the following functionalities:

### Features
- **Real-Time Updates**: Fetches and displays the latest state of the mission from the server at regular intervals.
- **Dynamic Positioning**: Visualizes the movement of drones and other entities on a mission map.
- **Mission Control**: Allows for starting, monitoring, and aborting missions based on their current state and user interactions.

### User Interaction
- **Mission Monitoring**: Users can view the current state of the mission including drone locations, paths, and statuses.
- **Control Actions**: Provides interactive controls for aborting or altering mission parameters as necessary.

## Design Details
- **Visual Elements**: Uses SVG and other graphical representations to show mission-related data dynamically.
- **Interactive Components**: Includes buttons and icons for direct interaction, allowing users to affect the mission's course in real-time.

## Usage
The `<MissionExecution />` component is used within the mission control dashboard where operational staff can monitor ongoing missions, respond to changes, and make decisions based on real-time data.

## Props
| Prop              | Type     | Description                           |
|-------------------|----------|---------------------------------------|
| `handleTabChange` | `function` | Callback to switch tabs in the dashboard |
| `setSurvCommEstablished` | `function` | Updates the state when communication with the surveillance drone is established |
| `setSurvCommLost` | `function` | Updates the state when communication with the surveillance drone is lost |
| `showSupplyDrone` | `boolean` | Controls the visibility of the supply drone |
| `setShowSupplyDrone` | `function` | Sets the visibility state of the supply drone |
| `showLowBattery` | `boolean` | Indicates if the drone's battery is low |
| `blinkLowBattery` | `boolean` | Controls the blinking state of the low battery indicator |
| `missionAborted` | `boolean` | Indicates if the mission has been aborted |
| `survCommEstablished` | `boolean` | Stores the state of communication with the surveillance drone |
| `setLogs` | `function` | Function to log messages related to mission operations |
