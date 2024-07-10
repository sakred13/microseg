---
sidebar_position: 4
sidebar_label: <NoAccess />

---

# NoAccess Component
## Overview
The `<NoAccess />` component provides a user-friendly notification for access restriction scenarios. It is displayed when a user attempts to access a page or resource for which they do not have the necessary permissions.

## Component Functionality
The `<NoAccess />` component is designed to:
1. **Display a Clear Message:** It prominently displays an "Access Denied" message, informing users that they cannot access the requested page.
2. **Aesthetic and Responsive Design:** Utilizes Material-UI components to ensure the message is not only clear but also visually appealing and responsive across different device sizes.
3. **Error Code Information:** It includes a specific error code (403 Forbidden) to clarify the type of access denial the user is encountering.

## Design Details
- **Visual Elements:** 
  - Uses a `Paper` component from Material-UI for a clean and elevated card-style design.
  - Employs `Typography` for textual content, ensuring that the message is readable and stylistically consistent with the rest of the application.
  - A `Divider` is used to separate the title from the detailed message, enhancing the visual organization of the component.
- **Layout:**
  - The component uses a flexbox layout to center its contents both vertically and horizontally within the viewport.
  - It is designed to take up a reasonable portion of the viewport (50% width and 50% height), making sure the message is focal without overwhelming the rest of the interface.

## Usage
The `<NoAccess />` component is typically rendered in routes or sections of the application where user permissions are checked and found insufficient. It can also be used as a fallback component in routing logic to handle unauthorized access attempts gracefully.

