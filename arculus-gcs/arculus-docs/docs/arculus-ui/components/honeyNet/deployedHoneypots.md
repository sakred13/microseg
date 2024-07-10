---
sidebar_position: 5
sidebar_label: <DeployedHoneypots />

---

# Deployed Honeypots Component
## Overview
The `<DeployedHoneypots />` component manages and displays honeypots that have been deployed. It provides functionality for monitoring and undeploying these honeypots.

## Component Functionality
- **View Deployed Honeypots**: Lists all currently deployed honeypots along with their IP addresses and types.
- **Undeploy Honeypots**: Allows the user to remove deployed honeypots from active service.
- **Loading State**: Displays a loading spinner when the list of deployed honeypots is being fetched.
- **Confirmation Dialogs**: Uses dialogs to confirm the undeployment of honeypots to prevent accidental removals.

## Design and Interaction
- **Table Display**: Utilizes a table format to neatly present the deployed honeypots and related actions.
- **Action Buttons**: Includes interactive icons for viewing details and undeploying honeypots.
- **Progress Feedback**: Shows a progress indicator during the loading and undeploying processes to enhance user interaction.

## Notifications
- **Success Messages**: After successfully undeploying a honeypot, a success message is displayed to confirm the action.
- **Error Handling**: Implements robust error handling to manage and display errors during the undeployment process.

