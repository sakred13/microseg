import {Typography, Button} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';

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



function DeviceInspection(props) {
    return (
        <div id='deviceInspectioDiv' style={rfInsepectStyle}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant='h5'>
                {"Name"}
                </Typography>
                <Typography>
                {"placeholder"}
                </Typography>                 
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant='h5'>
                {"IP Address"}
                </Typography>
                <Typography>
                {"placeholder"}
                </Typography> 
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant='h5'>
                {"Device Type"}
                </Typography>
                <Typography>
                {"placeholder"}
                </Typography> 
            </div>
            <div >
                <Typography variant='h5'>
                {"Allowed Functions"}
                </Typography>
                <Tooltip
                    // title={device.allowedTasks.map((task, index) => (
                    //     <React.Fragment key={index}>
                    //         {task}
                    //         <br />
                    //     </React.Fragment>
                    // ))}
                    // arrow
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
                    // onClick={() => handleEditDevice(device)}
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