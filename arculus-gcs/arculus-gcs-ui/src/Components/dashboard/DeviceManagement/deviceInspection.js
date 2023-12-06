import React, { useState, useEffect } from 'react';
import {Typography, Button} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
import EditDeviceModal from './EditDeviceModal';
// import { useNavigate } from 'react-router-dom';

const rfInsepectStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    width: '20%',
    height: '80vh',
    backgroundColor: '#DED9D9',
    border: '2px solid black',
    overflow: 'hidden'
  };

  const getTasks = async () => {
    try {
        const url = `${API_URL}/api/getTasks?authToken=${encodeURIComponent(
            Cookies.get('jwtToken')
        )}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        throw error;
    }
};



const  DeviceInspection = ({device}) => {
    const [tasks, setTasks] = useState([]);
    const [triggerRender, setTriggerRender] = useState(false);
    const [isEditDeviceModalOpen, setIsEditDeviceModalOpen] = useState(false);
    const [editDeviceDetails, setEditDeviceDetails] = useState(null);
    // const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksList = await getTasks();
                setTasks(tasksList);
            } catch (error) {
                // Cookies.remove('jwtToken');
                // navigate('/signIn');
                console.log('error');
            }
        };
    
        fetchTasks();
    }, []);

    const handleEditDevice = (device) => {
        setEditDeviceDetails(device);
        setIsEditDeviceModalOpen(true);
    };

    const handleEditDeviceModalClose = () => {
        setIsEditDeviceModalOpen(false);
        setEditDeviceDetails(null);
        setTriggerRender((prev) => !prev);
    };

    return (

        <div id='deviceInspectioDiv' style={rfInsepectStyle}>

            {isEditDeviceModalOpen && (
                <EditDeviceModal
                    isOpen={isEditDeviceModalOpen}
                    setIsOpen={handleEditDeviceModalClose}
                    deviceDetails={editDeviceDetails}
                    allowedTasks={tasks}
                />
            )}

            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant='h5'>
                {"Name"}
                </Typography>
                {device.device_name ? <Typography>{device.device_name}</Typography> : <Typography>{"N/A"}</Typography>}               
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant='h5'>
                {"IP Address"}
                </Typography>
                {device.ip_address ? <Typography>{device.ip_address}</Typography> : <Typography>{"N/A"}</Typography>}
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant='h5'>
                {"Device Type"}
                </Typography>
                {device.device_type ? <Typography>{device.device_type}</Typography> : <Typography>{"N/A"}</Typography>}
            </div>
            <div >
                <Typography variant='h5'>
                {"Allowed Functions"}
                </Typography>
                <Tooltip
                    title={device.allowedTasks.map((task, index) => (
                        <React.Fragment key={index}>
                            {task}
                            <br />
                        </React.Fragment>
                    ))}
                    arrow
                >
                    <IconButton size="small">
                        <VisibilityIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant='h5'>
                {"Actions"}
                </Typography>
                <Button
                    variant='contained'
                    startIcon={<EditIcon />}
                    onClick={() => handleEditDevice(device)}
                    style={{ cursor: 'pointer' }}
                >
                    <font color="black">Update Device Capabilities</font>
                </Button>{' '}
                <br/>
                <Button
                    variant='contained'
                    startIcon={<RemoveCircleOutlineIcon style={{ color: '#e34048' }} />}
                    // onClick={() => handleDeleteDialogOpen(device.device_name)}
                    style={{ cursor: 'pointer', color: 'black' }}
                >
                    Deconfigure Device
                </Button>
            </div>
        </div>
    );
}

export default DeviceInspection;