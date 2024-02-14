import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TablePagination } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useDashboardContext } from './DashboardContext';

function IntelFeed() {
    const [honeypot, setHoneypot] = useState('None');
    const [protocol, setProtocol] = useState('');
    const [hoursAgo, setHoursAgo] = useState(24);
    const [limit, setLimit] = useState(500);
    const [intelData, setIntelData] = useState([]);
    const [page, setPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(0);
    const { switchToAttackerStats } = useDashboardContext();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleIpClick = (ip) => {
        switchToAttackerStats(ip);
    };

    const handleFilter = async () => {
        try {
            let url = `${API_URL}/honeypot-proxy/api/intel_feed?authToken=${encodeURIComponent(Cookies.get('jwtToken'))}&hours_ago=${hoursAgo}&limit=${limit}`;
            if (honeypot !== 'None') {
                url += `&honeypot=${honeypot}`;
            }
            if (protocol) {
                url += `&protocol=${protocol}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setIntelData(data.data);
                setTotalRecords(data.meta.size);
                if (data.data) {
                    setRowsPerPage(Math.min(data.data.length, 10));
                }
            } else {
                console.error('Failed to fetch intel data');
            }
        } catch (error) {
            console.error('Error fetching intel data:', error);
        }
    };

    useEffect(() => {
        handleFilter();
    }, []); // Initial fetch on component mount

    return (
        <Box sx={{ marginX: '10%', width: '80%', padding: 3 }}>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold'}}>Intel Feed</Typography>
            <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                <FormControl sx={{ flexGrow: 1 }}>
                    <InputLabel>Honeypot</InputLabel>
                    <Select value={honeypot} label="Honeypot" onChange={(e) => setHoneypot(e.target.value)}>
                        <MenuItem value="None">None</MenuItem>
                        <MenuItem value="cowrie">Cowrie</MenuItem>
                        <MenuItem value="dionaea">Dionaea</MenuItem>
                        <MenuItem value="conpot">Conpot</MenuItem>
                        <MenuItem value="elasticpot">Elasticpot</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ flexGrow: 1 }}>
                    <InputLabel>Protocol</InputLabel>
                    <Select value={protocol} label="Protocol" onChange={(e) => setProtocol(e.target.value)}>
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="ssh">SSH</MenuItem>
                        <MenuItem value="http">HTTP</MenuItem>
                        <MenuItem value="ftp">FTP</MenuItem>
                        <MenuItem value="https">HTTPS</MenuItem>
                        <MenuItem value="telnet">Telnet</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    type="number"
                    label="Time Frame"
                    value={hoursAgo}
                    onChange={(e) => setHoursAgo(e.target.value)}
                    inputProps={{ min: "1" }}
                    sx={{ flexGrow: 1 }}
                />
                <FormControl sx={{ flexGrow: 1 }}>
                    <InputLabel>Number of Records</InputLabel>
                    <Select value={limit} label="Number of Records" onChange={(e) => setLimit(e.target.value)}>
                        {[10, 20, 50, 100, 200, 500, 1000].map(num => (
                            <MenuItem key={num} value={num}>{num}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" sx={{ flexGrow: 1 }} onClick={handleFilter}> <FilterAltIcon /> Filter</Button>
            </Box>
            <TableContainer component={Paper}>
                <Table aria-label="Intel Feed">
                    <TableHead>
                        <TableRow>
                            <TableCell>Source IP</TableCell>
                            <TableCell>Honeypot</TableCell>
                            <TableCell>Protocol</TableCell>
                            <TableCell align="right">Destination Port</TableCell>
                            <TableCell align="right">Count</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {intelData.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((row, index) => (
                            <TableRow key={index}>
                                <TableCell
                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => handleIpClick(row.source_ip)}>
                                    {row.source_ip}
                                </TableCell>
                                <TableCell>{row.honeypot}</TableCell>
                                <TableCell>{row.protocol}</TableCell>
                                <TableCell align="right">{row.destination_port}</TableCell>
                                <TableCell align="right">{row.count}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={totalRecords}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[10, 20, 50, 100, 200, 500, 1000]}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />
        </Box>
    );
}

export default IntelFeed;
