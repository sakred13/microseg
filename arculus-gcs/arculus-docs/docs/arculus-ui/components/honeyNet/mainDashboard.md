---
sidebar_position: 1
sidebar_label: <MainDashboard />

---

# Main Dashboard Component
## Overview
The `<MainDashboard />` component is designed to provide a comprehensive overview of cyber attack statistics over a selected time period. It features dynamic data visualization including pie charts and tables to display attack details effectively.

## Component Functionality
- **Dynamic Time Selection**: Users can select the number of hours back they wish to view attack data, allowing for flexible and relevant data visualization.
- **Attack Data Visualization**: Utilizes a pie chart to show the distribution of attacks and a table to list top attacker IPs along with the number of attacks and their geographic locations.
- **Integration with Context**: Uses the [`DashboardContext`](/docs/arculus-ui/components/honeyNet/dashboardContext) to manage state across the dashboard, including switching to detailed attacker statistics based on user interaction.

## Design and Layout
- **Responsive Design**: Ensures that the layout adjusts well across different screen sizes, maintaining usability and accessibility.
- **Interactive Elements**: Interactive charts and clickable elements that provide a more engaging user experience.

## Data Handling
- **Data Fetching**: Data for the dashboard is fetched from a backend API, which is dynamically updated based on the user-selected time frame.
- **Error Handling**: Implements robust error handling to manage and display errors effectively if data fetching fails.

## Extensibility
- **Modular Design**: The dashboard's design allows for easy addition of new visual components or data sources as needed.
- **Context Usage**: By using context, the component maintains a clean state management strategy, making it easy to extend or modify functionalities.

This Markdown overview outlines the structure and functionality of the `MainDashboard` component, highlighting its key features and integration within a larger application framework.
