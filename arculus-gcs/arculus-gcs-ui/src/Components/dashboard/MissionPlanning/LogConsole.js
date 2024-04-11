import React from 'react';

function LogConsole() {
  return (
    <>
      <b>Command Activity</b>
      <div className="log-section">
        <div className="log" style={{ backgroundColor: 'black', color: 'green' }}>
          Move command to supply drone by controller.
        </div>
        <div className="log" style={{ backgroundColor: 'black', color: 'red' }}>
          Move command to supply drone from 122.43.53.23!
        </div>
        {/* Repeat this div for each log */}
      </div>
    </>
  );
}

export default LogConsole;
