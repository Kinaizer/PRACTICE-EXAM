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
    role: 'ssgp checker'
  });

  const [editAccount, setEditAccount] = useState({
    id: '',
    fullName: '',
    idNumber: '',
    email: '',
    password: '',
    role: 'student',
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
      await axios.post('/api/admin/users', newAccount);
      alert("Account created successfully!");
      setOpenAddModal(false);
      setNewAccount({ fullName: '', email: '', password: '', role: 'ssgp checker' });
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
      isVerified: user.isVerified
    });
    setOpenEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.patch(`/api/users/${editAccount.id}`, {
        fullName: editAccount.fullName,
        idNumber: editAccount.idNumber,
        email: editAccount.email,
        password: editAccount.password,
        role: editAccount.role,
        isVerified: editAccount.isVerified
      });
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

  return (
    <div className="container admin-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Admin Dashboard</h2>
        <Button variant="contained" color="primary" onClick={() => setOpenAddModal(true)}>
          Add Account
        </Button>
      </Box>

      <section className="admin-section">
        <h3>All Registered Users</h3>
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name (Username)</strong></TableCell>
                <TableCell><strong>ID / Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Verified</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No users found.</TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.idNumber || user.email}</TableCell>
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