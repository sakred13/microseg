import React from 'react';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';

function DroneRemote() {
    return (<>
        <div>
            <b>Control Remotely</b>
            <select>
                <option value="surveillance">Surveillance Drone</option>
                <option value="supply">Supply Drone</option>
            </select>
        </div>
        <div className="button-section">
            <div className="row1">
                <button className="arrow-button"><span style={{ transform: 'rotate(315deg)', display: 'inline-block' }}>&#9650;</span></button>
                <button className="arrow-button"><span>&#9650;</span></button>
                <button className="arrow-button"><span style={{ transform: 'rotate(45deg)', display: 'inline-block' }}>&#9650;</span></button>
            </div>
            <div className="row2">
                <button className="arrow-button"><span>&#9668;</span></button>
                <div
                    style={{
                        backgroundColor: '#87CEEB', // Bright blue color
                        width: '50px', // Set a fixed width
                        height: '50px', // Set a fixed height
                        display: 'flex', // Use flexbox for centering
                        justifyContent: 'center', // Center horizontally
                        alignItems: 'center', // Center vertically
                        borderRadius: '50%', // Rounded corners to make it circular
                    }}
                >
                    <SettingsRemoteIcon style={{ fontSize: "40px", color: "white" }} />
                </div>
                <button className="arrow-button"><span>&#9654;</span></button>
            </div>
            <div className="row3">
                <button className="arrow-button"><span style={{ transform: 'rotate(225deg)', display: 'inline-block' }}>&#9650;</span></button>
                <button className="arrow-button"><span>&#9660;</span></button>
                <button className="arrow-button"><span style={{ transform: 'rotate(135deg)', display: 'inline-block' }}>&#9650;</span></button>
            </div>
        </div>
    </>
    );
}

export default DroneRemote;
