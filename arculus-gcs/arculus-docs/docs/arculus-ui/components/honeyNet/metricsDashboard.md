---
sidebar_position: 4
sidebar_label: <MetricsDashboard />

---

# Metrics Dashboard Component
## Overview
The `<MetricsDashboard />` component serves as the main interface for viewing metrics and attacker statistics in a cybersecurity context. It integrates different sub-components like [`IntelFeed`](/docs/arculus-ui/components/honeyNet/intelFeed) and [`AttackerStats`](/docs/arculus-ui/components/honeyNet/attackerStatss) and allows navigation between these views through a tabbed interface.

## Component Functionality
- **Navigation Tabs**: Provides tabs for switching between the `Overview`, [`Intel Feed`](/docs/arculus-ui/components/honeyNet/intelFeed), and [`Attacker Stats`](/docs/arculus-ui/components/honeyNet/attackerStats). Each tab displays a relevant component.
- **Contextual State Management**: Utilizes a dashboard context to manage states such as the active tab and the IP address of the attacker.
- **External Navigation**: Includes a button that opens an external CHN (CommunityHoneyNetwork) dashboard for more detailed insights.

## Interaction and Design
- **Tab Interaction**: Users can switch views by clicking on the tabs which dynamically load the respective content.
- **External Link**: The dashboard provides a direct link to the CommunityHoneyNetwork's documentation and external dashboard for expanded information.
- **Responsive Layout**: Adopts a responsive design to ensure usability across various device sizes.

## User Guidance
- **User Feedback**: Visual feedback is provided via the active state of tabs and a progress indicator when switching between tabs.
- **Guidance and Documentation**: A footer link directs users to additional resources and documentation for deeper understanding and further exploration.
