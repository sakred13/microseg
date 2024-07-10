---
sidebar_position: 8
sidebar_label: <Blacklist />

---

# Blacklist Component
## Overview
The `<Blacklist />` component is responsible for managing and displaying a list of blacklisted IP addresses within the system. It allows users to view, update, and remove IP addresses from the blacklist, ensuring dynamic control over network security measures.

## Component Functionality
The `<Blacklist />` component facilitates several key functions:
1. **Display Blacklisted IPs:** Lists all blacklisted IP addresses currently stored in the system.
2. **Manage Display Records:** Allows users to control the number of records shown at one time through a user input.
3. **Remove IP Addresses:** Provides functionality to remove selected IP addresses from the blacklist after confirmation.

## APIs Used
- **`/blacklistapi/getBlacklist` API:** Fetches the list of blacklisted IP addresses.
- **`/blacklistapi/removeFromBlacklist` API:** Handles the removal of IP addresses from the blacklist.

## Interaction and Design
- **Loading State:** Displays a loading indicator when the blacklist data is being fetched.
- **Dynamic List Rendering:** Shows a list of blacklisted IPs with checkboxes to select and remove multiple IPs.
- **Confirmation Dialog:** Before removing IPs from the blacklist, a confirmation dialog is presented to prevent accidental deletions.

## Security and Data Handling
- Ensures that all interactions with the blacklist API are conducted over secured connections and that user actions are authenticated.

## User Experience
- **Feedback Mechanisms:** Provides immediate feedback on the success or failure of blacklist updates.
- **Accessibility:** Implements accessible dialogs and controls to ensure usability for all users.

