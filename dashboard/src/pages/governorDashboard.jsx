import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Typography, Paper, Container, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip
} from '@mui/material';

const GovernorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [comment, setComment] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/requests?status=Org President Approved');
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
        status: 'Governor Approved'
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
    <Container maxWidth="lg" className="gov-container" sx={{ mt: 5, mb: 5 }}>
      <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Governor Dashboard
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Applicant Name</strong></TableCell>
              <TableCell><strong>Student ID</strong></TableCell>
              <TableCell><strong>Track</strong></TableCell>
              <TableCell><strong>SSGP Link</strong></TableCell>
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
                    <a href={row.ssgpLink} target="_blank" rel="noreferrer">View Link</a>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.status} color="primary" />
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      onClick={() => handleApprove(row._id)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error" 
                      size="small"
                      onClick={() => handleDisapproveClick(row._id)}
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
    </Container>
  );
};

export default GovernorDashboard;
