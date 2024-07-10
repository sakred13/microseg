---
sidebar_position: 12
sidebar_label: <DashboardContext />

---

# DashboardContext Component

## Overview
The `DashboardContext` component in React provides a centralized state management solution within the dashboard application. It uses the Context API to store and manage the state related to the active tab and the IP address of an attacker, facilitating state sharing across different components without prop drilling.

## Component Functionality
- **Centralized State Management**: Stores the active tab state and the attacker's IP address, allowing different parts of the application to react to changes in these states.
- **Context Provider**: Exposes the `DashboardContext.Provider` which passes down the context values to any child components, enabling them to re-render when the context values change.
- **Custom Hook**: Includes a custom hook `useDashboardContext`, which simplifies the process of accessing this context's values within functional components.

## Design Details
- **State Variables**:
  - `activeTab`: Manages the current visible tab within the dashboard.
  - `attackerIp`: Stores the IP address of a selected attacker when detailed stats are needed.
- **Functions**:
  - `switchToAttackerStats(ip)`: A function to switch the view to 'Attacker Stats' and set the IP address of the attacker, which is useful for fetching and displaying detailed information about security threats.

## Usage
`DashboardContext` is particularly useful in applications that require shared state across many components and where props chaining would be cumbersome or inefficient. Here’s how to utilize this context in a component:

```jsx
import { useDashboardContext } from './DashboardContext';

const SomeComponent = () => {
  const { activeTab, switchToAttackerStats } = useDashboardContext();

  return (
    <div>
      <button onClick={() => switchToAttackerStats('192.168.1.1')}>
        View Attacker Stats
      </button>
      Current tab is: {activeTab}
    </div>
  );
};
