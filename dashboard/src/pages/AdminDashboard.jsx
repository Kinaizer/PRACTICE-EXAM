import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, Button, FormControl, InputLabel, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, FormControlLabel
} from '@mui/material';
import './AdminDashboard.css';


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [newAccount, setNewAccount] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ssgp checker',
    organization: 'Engineering'
  });

  const [editAccount, setEditAccount] = useState({
    id: '',
    fullName: '',
    idNumber: '',
    email: '',
    password: '',
    role: 'student',
    organization: 'Engineering',
    isVerified: false
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddAccount = async () => {
    try {
      const payload = { ...newAccount };
      if (!payload.idNumber) delete payload.idNumber;
      if (!payload.email) delete payload.email;
      if (!['student', 'ssgp checker', 'org president'].includes(payload.role)) {
        delete payload.organization;
      }
      await axios.post('/api/admin/users', payload);
      alert("Account created successfully!");
      setOpenAddModal(false);
      setNewAccount({ fullName: '', email: '', password: '', role: 'ssgp checker', organization: 'Engineering' });
      fetchUsers();
    } catch (err) {
      alert("Error creating account. Email might already exist.");
    }
  };

  const handleEditOpen = (user) => {
    setEditAccount({
      id: user._id,
      fullName: user.fullName,
      idNumber: user.idNumber || '',
      email: user.email || '',
      password: user.password,
      role: user.role,
      organization: user.organization || 'Engineering',
      isVerified: user.isVerified
    });
    setOpenEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      const payload = {
        fullName: editAccount.fullName,
        password: editAccount.password,
        role: editAccount.role,
        isVerified: editAccount.isVerified
      };
      if (editAccount.idNumber) payload.idNumber = editAccount.idNumber;
      if (editAccount.email) payload.email = editAccount.email;
      if (['student', 'ssgp checker', 'org president'].includes(editAccount.role)) {
        payload.organization = editAccount.organization;
      }

      await axios.patch(`/api/users/${editAccount.id}`, payload);
      alert("User updated successfully!");
      setOpenEditModal(false);
      fetchUsers();
    } catch (err) {
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/users/${id}`);
        alert("User deleted successfully!");
        fetchUsers();
      } catch (err) {
        alert("Error deleting user");
      }
    }
  };

  const handleResetUser = async (id) => {
    if (window.confirm("Are you sure you want to reset this user's clearance applications?")) {
      try {
        await axios.delete(`/api/requests?userId=${id}`);
        alert("User's applications reset successfully!");
      } catch (err) {
        alert("Error resetting user applications");
      }
    }
  };

  const handleResetAll = async () => {
    if (window.confirm("WARNING: Are you sure you want to reset ALL clearance applications in the system?")) {
      try {
        await axios.delete('/api/requests');
        alert("All applications reset successfully!");
      } catch (err) {
        alert("Error resetting all applications");
      }
    }
  };

  const students = users.filter(u => u.role === 'student');
  const officials = users.filter(u => u.role !== 'student');

  return (
    <div className="container admin-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Admin Dashboard</h2>
        <Box>
          <Button variant="contained" color="error" onClick={handleResetAll} style={{ marginRight: '10px' }}>
            Reset All Applications
          </Button>
          <Button variant="contained" color="primary" onClick={() => setOpenAddModal(true)}>
            Add Account
          </Button>
        </Box>
      </Box>

      <section className="admin-section">
        <h3>Students</h3>
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name (Username)</strong></TableCell>
                <TableCell><strong>ID Number</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Verified</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No students found.</TableCell>
                </TableRow>
              ) : (
                students.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.idNumber}</TableCell>
                    <TableCell style={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
                    <TableCell>{user.isVerified ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color="primary" onClick={() => handleEditOpen(user)} style={{ marginRight: '8px' }}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" color="warning" onClick={() => handleResetUser(user._id)} style={{ marginRight: '8px' }}>
                        Reset
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteUser(user._id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      <section className="admin-section" style={{ marginTop: '40px' }}>
        <h3>System Officials</h3>
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name (Username)</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Verified</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {officials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No officials found.</TableCell>
                </TableRow>
              ) : (
                officials.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell style={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
                    <TableCell>{user.isVerified ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color="primary" onClick={() => handleEditOpen(user)} style={{ marginRight: '8px' }}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteUser(user._id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      {/* Add Account Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Official Account</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              value={newAccount.fullName}
              onChange={(e) => setNewAccount({ ...newAccount, fullName: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              value={newAccount.email}
              onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={newAccount.password}
              onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newAccount.role}
                label="Role"
                onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value })}
              >
                <MenuItem value="ssgp checker">SSGP Checker</MenuItem>
                <MenuItem value="org president">Organization President</MenuItem>
                <MenuItem value="governor">Governor</MenuItem>
              </Select>
            </FormControl>
            {['student', 'ssgp checker', 'org president'].includes(newAccount.role) && (
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={newAccount.organization}
                  label="Organization"
                  onChange={(e) => setNewAccount({ ...newAccount, organization: e.target.value })}
                >
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Architecture">Architecture</MenuItem>
                  <MenuItem value="Information Technology">Information Technology</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddAccount}>
            Create Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit User Account</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Name (Username)"
              variant="outlined"
              fullWidth
              value={editAccount.fullName}
              onChange={(e) => setEditAccount({ ...editAccount, fullName: e.target.value })}
            />
            {editAccount.role === 'student' ? (
              <TextField
                label="ID Number"
                type="text"
                variant="outlined"
                fullWidth
                value={editAccount.idNumber}
                onChange={(e) => setEditAccount({ ...editAccount, idNumber: e.target.value })}
              />
            ) : (
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={editAccount.email}
                onChange={(e) => setEditAccount({ ...editAccount, email: e.target.value })}
              />
            )}
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={editAccount.password}
              onChange={(e) => setEditAccount({ ...editAccount, password: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editAccount.role}
                label="Role"
                onChange={(e) => setEditAccount({ ...editAccount, role: e.target.value })}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="ssgp checker">SSGP Checker</MenuItem>
                <MenuItem value="org president">Organization President</MenuItem>
                <MenuItem value="governor">Governor</MenuItem>
              </Select>
            </FormControl>
            {['student', 'ssgp checker', 'org president'].includes(editAccount.role) && (
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={editAccount.organization}
                  label="Organization"
                  onChange={(e) => setEditAccount({ ...editAccount, organization: e.target.value })}
                >
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Architecture">Architecture</MenuItem>
                  <MenuItem value="Information Technology">Information Technology</MenuItem>
                </Select>
              </FormControl>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={editAccount.isVerified}
                  onChange={(e) => setEditAccount({ ...editAccount, isVerified: e.target.checked })}
                  color="primary"
                />
              }
              label="Verified Account"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;