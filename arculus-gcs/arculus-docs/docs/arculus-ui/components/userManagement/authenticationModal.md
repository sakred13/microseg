---
sidebar_position: 13
sidebar_label: <AuthenticationModal />

---

# AuthenticationModal Component
## Overview
The `<AuthenticationModal />` component is used to authenticate user actions that require a higher level of security, such as updating sensitive profile information. This modal supports a two-step verification process where a verification email is sent followed by OTP (One-Time Password) verification.

## Component Functionality
The `<AuthenticationModal />` component operates in two steps:
1. **Send Email Step:** Initially, the modal allows the user to send a verification email to their registered email address.
2. **Verify OTP Step:** After sending the email, the user must input the OTP received to verify their identity.

## APIs Used
- **[`/auth/sendEmailForAuth`](/docs/arculus-api/Auth#post-sendemailforauth) API:** Sends a verification email with an OTP to the user's email address.
- **[`/auth/verifyOtp`](/docs/arculus-api/Auth#post-verifyotp) API:** Verifies the OTP entered by the user against the server.

## Interaction and Design
- **Modal Presentation:** Uses the `Modal` component from MUI to present the authentication steps in a central overlay, making the process straightforward and focused.
- **Step Transition:** Dynamically changes between the 'send email' and 'verify OTP' steps based on user interaction and API responses.
- **Responsive Design:** Ensures the modal is appropriately sized and positioned across different devices and resolutions.

## Security and Authentication
- Ensures that all interactions are secure, with OTP data handled confidentially and sensitive operations requiring correct OTP verification.

## User Experience
- **Clear Instructions:** Provides clear, concise instructions for each step of the verification process.
- **Feedback Mechanisms:** Offers immediate feedback on the success or failure of email sending and OTP verification.

