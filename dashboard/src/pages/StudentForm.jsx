import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';

const StudentForm = ({ user }) => {
  const [ssgpFile, setSsgpFile] = useState(null);
  const [ssgpLink, setSsgpLink] = useState('');
  const [status, setStatus] = useState('Not Applied'); 
  const [comment, setComment] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [reqId, setReqId] = useState(null);

  const fetchMyData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`/api/requests?userId=${user._id}`);
      if (res.data && res.data.length > 0) {
        const latestReq = res.data[0];
        setReqId(latestReq._id);
        setStatus(latestReq.status);
        setSsgpLink(latestReq.ssgpLink);
        setComment(latestReq.comment || '');
        setUpdatedAt(latestReq.updatedAt || new Date().toISOString());
      } else {
        setReqId(null);
        setStatus('Not Applied');
        setSsgpLink('');
        setComment('');
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  }, [user?._id]);

  useEffect(() => { 
    fetchMyData(); 
  }, [fetchMyData]);

  const handleApplyClearance = async (e) => {
    e.preventDefault();
    if (!ssgpFile) {
      alert("Please upload your SSGP document in PDF format");
      return;
    }
    
    // Check if the file is a PDF
    if (ssgpFile.type !== 'application/pdf') {
      alert("Only PDF files are allowed for the SSGP document");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('userId', user._id);
      formData.append('fullName', user.fullName);
      formData.append('studentId', user?.idNumber);
      formData.append('track', user?.organization || 'Engineering');
      formData.append('ssgpFile', ssgpFile);

      await axios.post('/api/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Clearance Application Submitted Successfully!");
      fetchMyData();
    } catch (err) {
      alert("Error submitting request. Please try again.");
    }
  };

  const handleCancelClearance = async () => {
    if (!reqId) return;
    if (window.confirm("Are you sure you want to cancel your clearance application?")) {
      try {
        await axios.delete(`/api/requests/${reqId}`);
        alert("Clearance Application Canceled.");
        fetchMyData();
      } catch (err) {
        alert("Error canceling request.");
      }
    }
  };

  // Calculate progress based on status
  const getProgress = () => {
    switch (status) {
      case 'Not Applied': return 0;
      case 'Pending': return 25;
      case 'Checker Approved': return 50;
      case 'Org President Approved': return 75;
      case 'Governor Approved': return 100;
      case 'Disapproved': return 100;
      default: return 0;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Student Clearance Portal
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Application Status: <span style={{ color: status === 'Governor Approved' ? 'green' : status === 'Disapproved' ? 'red' : '#f57c00', fontWeight: 'bold' }}>{status}</span>
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={getProgress()} 
            color={status === 'Disapproved' ? 'error' : status === 'Governor Approved' ? 'success' : 'primary'}
            sx={{ height: 10, borderRadius: 5 }} 
          />
        </Box>

        {status === 'Disapproved' && comment && (
          <Alert severity="error" sx={{ mb: 4 }}>
            <strong>Reason for disapproval:</strong> {comment}
          </Alert>
        )}

        {status === 'Governor Approved' ? (
          <Paper elevation={10} sx={{ 
            mt: 4, 
            p: 5, 
            border: '12px solid #d4af37', 
            borderRadius: '4px',
            backgroundColor: '#fffdf5', 
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ border: '2px dashed #d4af37', p: 4, height: '100%', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: -45, left: '50%', transform: 'translateX(-50%)', bgcolor: '#fffdf5', px: 2 }}>
                <svg width="70" height="70" viewBox="0 0 24 24" fill="#d4af37">
                  <path d="M12 15.22l-4.52 2.76 1.18-5.18-4.04-3.51 5.31-.46L12 4l2.07 4.83 5.31.46-4.04 3.51 1.18 5.18z"/>
                </svg>
              </Box>
              
              <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", "Times New Roman", serif', color: '#1a1a1a', fontWeight: '900', mb: 2, mt: 3, letterSpacing: '2px' }}>
                CERTIFICATE OF CLEARANCE
              </Typography>
              
              <Typography variant="h6" sx={{ color: '#555', fontStyle: 'italic', mb: 4, mt: 4 }}>
                This is to officially certify that
              </Typography>
              
              <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", "Times New Roman", serif', fontWeight: 'bold', color: '#2c3e50', mb: 1 }}>
                {user.fullName}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ color: '#777', mb: 4, letterSpacing: '1px' }}>
                Student ID: {user?.idNumber} | Track: {user?.organization}
              </Typography>
              
              <Typography variant="body1" sx={{ fontSize: '1.2rem', color: '#333', mb: 6, maxWidth: '600px', mx: 'auto', lineHeight: 1.8 }}>
                has successfully completed all requirements and is officially cleared from all academic and administrative obligations for the current semester.
              </Typography>
              
              <Box display="flex" justifyContent="space-around" mt={6} pt={4}>
                <Box textAlign="center">
                  <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', color: '#1a1a1a', borderBottom: '1px solid #d4af37', width: '220px', mb: 1, pb: 1 }}>
                    Approved
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                    Governor's Signature
                  </Typography>
                </Box>
                
                <Box textAlign="center">
                  <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', color: '#1a1a1a', borderBottom: '1px solid #d4af37', width: '220px', mb: 1, pb: 1 }}>
                    {new Date(updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                    Date of Issue
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box display="flex" justifyContent="center" mt={4} className="no-print">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.print()}
                sx={{ py: 1, px: 4, fontWeight: 'bold' }}
              >
                Print / Save as PDF
              </Button>
            </Box>
          </Paper>
        ) : (
          <form onSubmit={handleApplyClearance}>
            <Box display="flex" flexDirection="column" gap={3} mb={4}>

              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center"
                p={3}
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  bgcolor: status !== 'Not Applied' && status !== 'Disapproved' ? '#f5f5f5' : '#fafafa',
                  cursor: status !== 'Not Applied' && status !== 'Disapproved' ? 'not-allowed' : 'pointer',
                  '&:hover': {
                    bgcolor: status !== 'Not Applied' && status !== 'Disapproved' ? '#f5f5f5' : '#f0f0f0'
                  }
                }}
              >
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={(e) => setSsgpFile(e.target.files[0])}
                  disabled={status !== 'Not Applied' && status !== 'Disapproved'}
                />
                <label htmlFor="raised-button-file" style={{ width: '100%', textAlign: 'center', cursor: status !== 'Not Applied' && status !== 'Disapproved' ? 'not-allowed' : 'pointer' }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#C3110C', marginBottom: '16px' }}>
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                  </svg>
                  <Typography variant="h6" gutterBottom>
                    {ssgpFile ? ssgpFile.name : 'Upload SSGP Document (PDF only)'}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    component="span" 
                    disabled={status !== 'Not Applied' && status !== 'Disapproved'}
                    sx={{ mt: 1 }}
                  >
                    Select File
                  </Button>
                </label>
              </Box>
            </Box>

            <Box display="flex" justifyContent="center" gap={2}>
              <Button 
                type="submit"
                variant="contained" 
                color="success" 
                size="large"
                disabled={status !== 'Not Applied' && status !== 'Disapproved'}
                sx={{ py: 1.5, px: 6, fontSize: '1.1rem' }}
              >
                {status === 'Disapproved' ? 'Re-apply Clearance' : 'Apply Clearance'}
              </Button>
              {status !== 'Not Applied' && status !== 'Governor Approved' && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="large"
                  onClick={handleCancelClearance}
                  sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
                >
                  Cancel Application
                </Button>
              )}
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default StudentForm;