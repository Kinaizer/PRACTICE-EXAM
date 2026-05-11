import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Typography, Paper, Container, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

const OrgPresidentDashboard = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [comment, setComment] = useState('');
  const [financialStanding, setFinancialStanding] = useState('Clear');
  const [sanctions, setSanctions] = useState('None');

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`/api/requests?status=Checker Approved&track=${user?.organization || ''}`);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`/api/requests/${id}`, {
        status: 'Org President Approved'
      });
      fetchRequests();
    } catch (err) {
      console.error("Error approving:", err);
    }
  };

  const handleDisapproveClick = (id) => {
    setSelectedReqId(id);
    setComment('');
    setOpenDialog(true);
  };

  const handleDisapproveSubmit = async () => {
    try {
      await axios.patch(`/api/requests/${selectedReqId}`, {
        status: 'Disapproved',
        comment
      });
      setOpenDialog(false);
      fetchRequests();
    } catch (err) {
      console.error("Error disapproving:", err);
    }
  };

  return (
    <Container maxWidth="lg" className="org-container" sx={{ mt: 5, mb: 5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Org President Dashboard ({user?.organization || 'No Organization'})
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Applicant Name</strong></TableCell>
              <TableCell><strong>Student ID</strong></TableCell>
              <TableCell><strong>Track</strong></TableCell>
              <TableCell><strong>Financial/Sanctions</strong></TableCell>
              <TableCell><strong>SSGP File</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No applications waiting for your approval.</TableCell>
              </TableRow>
            ) : (
              requests.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell>{row.studentId}</TableCell>
                  <TableCell>{row.track}</TableCell>
                  <TableCell>
                    <Typography variant="body2">Fin: {row.userId?.financialStanding || 'Clear'}</Typography>
                    <Typography variant="body2">Sanctions: {row.userId?.sanctions || 'None'}</Typography>
                  </TableCell>
                  <TableCell>
                    <a href={row.ssgpLink} target="_blank" rel="noreferrer">View File</a>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.status} color="info" />
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      size="small" 
                      onClick={() => {
                        setSelectedReq(row);
                        setFinancialStanding(row.userId?.financialStanding || 'Clear');
                        setSanctions(row.userId?.sanctions || 'None');
                        setOpenStatusDialog(true);
                      }}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Manage Status
                    </Button>
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      onClick={() => handleApprove(row._id)}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error" 
                      size="small"
                      onClick={() => handleDisapproveClick(row._id)}
                      sx={{ mb: 1 }}
                    >
                      Disapprove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Disapprove Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Disapprove Application</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Disapproval"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleDisapproveSubmit} color="error" variant="contained">
            Submit Disapproval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Status Dialog */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Manage Student Status</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Financial Standing"
              variant="outlined"
              fullWidth
              value={financialStanding}
              onChange={(e) => setFinancialStanding(e.target.value)}
              placeholder="e.g. Clear, Unpaid Org Fee"
            />
            <TextField
              label="Sanctions"
              variant="outlined"
              fullWidth
              value={sanctions}
              onChange={(e) => setSanctions(e.target.value)}
              placeholder="e.g. None, Pending community service"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button 
            onClick={async () => {
              try {
                await axios.patch(`/api/users/${selectedReq.userId._id || selectedReq.userId}`, {
                  financialStanding,
                  sanctions
                });
                setOpenStatusDialog(false);
                fetchRequests();
              } catch (err) {
                console.error("Error updating status:", err);
              }
            }} 
            color="primary" 
            variant="contained"
          >
            Save Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrgPresidentDashboard;
