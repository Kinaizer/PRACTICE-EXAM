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
  const [ssgpLink, setSsgpLink] = useState('');
  const [track, setTrack] = useState('Engineering');
  const [status, setStatus] = useState('Not Applied'); 
  const [comment, setComment] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const fetchMyData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`/api/requests?userId=${user._id}`);
      if (res.data && res.data.length > 0) {
        const latestReq = res.data[0];
        setStatus(latestReq.status);
        setSsgpLink(latestReq.ssgpLink);
        setTrack(latestReq.track || 'Engineering');
        setComment(latestReq.comment || '');
        setUpdatedAt(latestReq.updatedAt || new Date().toISOString());
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
    if (!ssgpLink) {
      alert("Please provide SSGP Link");
      return;
    }
    try {
      await axios.post('/api/requests', {
        userId: user._id, 
        fullName: user.fullName, 
        studentId: user?.idNumber, 
        track, 
        ssgpLink
      });
      alert("Clearance Application Submitted Successfully!");
      fetchMyData();
    } catch (err) {
      alert("Error submitting request. Please try again.");
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
                Student ID: {user?.idNumber} | Track: {track}
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
          </Paper>
        ) : (
          <form onSubmit={handleApplyClearance}>
            <Box display="flex" flexDirection="column" gap={3} mb={4}>


              <FormControl fullWidth disabled={status !== 'Not Applied' && status !== 'Disapproved'}>
                <InputLabel>Organization / Track</InputLabel>
                <Select
                  value={track}
                  label="Organization / Track"
                  onChange={(e) => setTrack(e.target.value)}
                >
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Architecture">Architecture</MenuItem>
                  <MenuItem value="Information Technology">Information Technology</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="SSGP Google Drive Link"
                variant="outlined"
                fullWidth
                value={ssgpLink}
                onChange={(e) => setSsgpLink(e.target.value)}
                placeholder="Enter your Google Drive link here"
                required
                type="url"
                disabled={status !== 'Not Applied' && status !== 'Disapproved'}
              />
            </Box>

            <Box display="flex" justifyContent="center">
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
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default StudentForm;