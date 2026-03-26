import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [allReqs, setAllReqs] = useState([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);

  const fetchData = async () => {
    try {
      const reqs = await axios.get('http://localhost:5000/api/requests');
      setAllReqs(reqs.data);

      const users = await axios.get('http://localhost:5000/api/users/unverified');
      setUnverifiedUsers(users.data);
      
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequestAction = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/requests/${id}`, { status });
      fetchData();
    } catch (err) {
      alert("Error updating request status");
    }
  };

  const verifyUser = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/users/verify/${id}`);
      alert("User Verified Successfully!");
      fetchData();
    } catch (err) {
      alert("Error verifying user");
    }
  };

  return (
    <div className="container admin-container">
      <section className="admin-section">
        <h2>New Student Registrations</h2>
        {unverifiedUsers.length === 0 ? (
          <p className="no-data-msg">No new student accounts to verify.</p>
        ) : (
          unverifiedUsers.map(user => (
            <div key={user._id} className="card admin-card verification-card" style={{borderLeft: '5px solid #ffa500'}}>
              <div className="user-info">
                <h4>{user.fullName}</h4>
                <p>Email: {user.email}</p>
              </div>
              <button onClick={() => verifyUser(user._id)} className="btn-approve">Verify Account</button>
            </div>
          ))
        )}
      </section>

      <hr style={{margin: '30px 0'}} />

      <section className="admin-section">
        <h2>Pending Clearance Approvals</h2>
        {allReqs.filter(r => r.status === 'Pending').length === 0 ? (
          <p className="no-data-msg">No clearance requests pending.</p>
        ) : (
          allReqs.filter(r => r.status === 'Pending').map(r => (
            <div key={r._id} className="card admin-card">
              <div className="request-info">
                <h4>{r.fullName} ({r.track})</h4>
                <p>ID: {r.studentId} | Request: {r.documentType}</p>
                {r.ssgpLink && (
                  <p><a href={r.ssgpLink} target="_blank" rel="noreferrer" style={{color: '#007bff'}}>View SSGP Link</a></p>
                )}
              </div>
              <div className="actions">
                <button onClick={() => handleRequestAction(r._id, 'Approved')} className="btn-approve">Approve</button>
                <button onClick={() => handleRequestAction(r._id, 'Denied')} className="btn-deny">Deny</button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;