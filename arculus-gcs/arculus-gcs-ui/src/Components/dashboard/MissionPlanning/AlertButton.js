import React from 'react';

function AlertButton({ userType, handleAbortMission }) {  // Correctly destructure props here
  let buttonText = '';

  // Determine the button text based on the userType prop
  switch (userType) {
    case 'Mission Creator':
      buttonText = 'Abort Mission';
      break;
    case 'Mission Supervisor':
      buttonText = 'Alert Creator and Request to Abort';
      break;
    case 'Mission Viewer':
      buttonText = 'Report Suspicious Commands';
      break;
    default:
      buttonText = 'Action';
      break;
  }

  return (
    <button
      className="action-button"
      onClick={handleAbortMission} // Attach the onClick event handler
      style={{
        fontWeight: 'bold',
        backgroundColor: '#d63838', // Creamish red color
        color: 'white', // White text color
        border: 'none', // No border
        padding: '10px 20px', // Padding
        borderRadius: '5px', // Rounded corners
        cursor: 'pointer', // Hyperlink cursor
      }}
    >
      {buttonText}
    </button>
  );
}

export default AlertButton;
