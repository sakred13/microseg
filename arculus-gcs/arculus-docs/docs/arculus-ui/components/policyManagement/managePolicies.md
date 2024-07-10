---
sidebar_position: 14
sidebar_label: <ManagePolicies />

---

# ManagePolicies Component
## Overview
The `<ManagePolicies />` component is designed for managing network policies within the application. It provides a user interface that allows users to switch between viewing existing policies and creating new ones, facilitating comprehensive policy management.

## Component Functionality
The `<ManagePolicies />` component includes:
1. **Tabbed Interface:** Utilizes a tabbed interface to switch between listing active network policies and creating new policies.
2. **List Policies:** Displays existing network policies using the [`<ListPolicies />`](/docs/arculus-ui/components/policyManagement/listPolicies) component.
3. **Create Policy:** Provides a form to create new network policies using the [`<CreatePolicy />`](/docs/arculus-ui/components/policyManagement/createPolicy) component.

## Interaction and Design
- **Dynamic Tab Switching:** Allows users to switch between different aspects of policy management through interactive tabs.
- **Content Display:** Dynamically displays content based on the selected tab, enhancing the user experience and reducing screen clutter.

## Security and Authentication
- Ensures that interactions with network policies are securely managed and require proper authentication using tokens retrieved from cookies.

## User Experience
- **Responsive Layout:** Designed to be functional and visually appealing across different devices and screen sizes.
- **Ease of Use:** Provides an intuitive interface for managing network policies, making it easy for users to navigate between viewing and creating policies.

