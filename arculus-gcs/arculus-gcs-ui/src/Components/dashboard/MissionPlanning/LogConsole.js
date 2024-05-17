import React from 'react';

function LogConsole({ logs }) {
  return (
    <>
      <b>Activity Log</b>
      <div style={{
        height: '60%', // Sets a fixed height for the log section
        overflowY: 'auto',  // Enables vertical scrolling
        overflowX: 'hidden', // Hides horizontal scrollbar
        backgroundColor: 'black', // Sets a background color
        color: 'white', // Sets text color to white for all child elements unless overridden
        padding: '8px', // Adds padding inside the log section
        border: '1px solid #333', // Adds a border around the log section
        width: '100%' // Ensures the div takes the full width of its parent
      }}>
        {logs.map((log, index) => (
          <div key={index} style={{
            backgroundColor: 'black',
            color: log.color,
            textAlign: 'left',
            fontSize: '13px' // Adjust the font size as needed
          }}>
            {log.message}
          </div>
        ))}
      </div>
    </>
  );
}

export default LogConsole;
