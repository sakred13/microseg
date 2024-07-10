---
sidebar_position: 7
sidebar_label: <Routing />

---

# Routing Component
## Overview
The `<Routing />` component manages user navigation based on their authentication status. It employs cookies to determine if a user is logged in and automatically redirects to the appropriate page.

## Component Functionality
- **Authentication Check**: At initialization, it checks for the existence of a `jwtToken` cookie to ascertain if the user is authenticated.
- **Conditional Navigation**: 
  - If a token is present, indicating that the user is logged in, it redirects to the `/dashboard`.
  - If no token is found, suggesting the user is not logged in, it redirects to the `/signIn` page.

## Implementation Details
- **Cookie Management**: Utilizes `js-cookie` for handling browser cookies, specifically checking for `jwtToken`.
- **Navigation Hook**: Uses the `useNavigate` hook from `react-router-dom` to programmatically navigate to different routes based on authentication status.

## Usage
This component is primarily used in higher-order components or application layouts where authentication-based conditional routing is required. It ensures that users access only those parts of the application that their authentication status permits, enhancing both security and user experience.

This Markdown document provides a concise explanation of the `Routing` component's purpose, how it functions, and its role in the application's navigation strategy.
