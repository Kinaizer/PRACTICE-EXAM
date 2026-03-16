import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [allReqs, setAllReqs] = useState([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [logs, setLogs] = useState([]); // State for Audit Logs

  const fetchData = async () => {
    try {
      // 1. Fetch Document Requests
      const reqs = await axios.get('http://localhost:5000/api/requests');
      setAllReqs(reqs.data);

      // 2. Fetch Unverified Users
      const users = await axios.get('http://localhost:5000/api/users/unverified');
      setUnverifiedUsers(users.data);

      // 3. Fetch Audit Logs
      const logRes = await axios.get('http://localhost:5000/api/audit-logs');
      setLogs(logRes.data);
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
      {/* SECTION 1: USER VERIFICATION */}
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

      {/* SECTION 2: DOCUMENT REQUESTS */}
      <section className="admin-section">
        <h2>Pending Document Approvals</h2>
        {allReqs.filter(r => r.status === 'Pending').length === 0 ? (
          <p className="no-data-msg">No document requests pending.</p>
        ) : (
          allReqs.filter(r => r.status === 'Pending').map(r => (
            <div key={r._id} className="card admin-card">
              <div className="request-info">
                <h4>{r.fullName} ({r.track})</h4>
                <p>ID: {r.studentId} | Request: {r.documentType}</p>
              </div>
              <div className="actions">
                <button onClick={() => handleRequestAction(r._id, 'Approved')} className="btn-approve">Approve</button>
                <button onClick={() => handleRequestAction(r._id, 'Denied')} className="btn-deny">Deny</button>
              </div>
            </div>
          ))
        )}
      </section>

      <hr style={{margin: '30px 0'}} />

      {/* SECTION 3: AUDIT LOGS */}
      <section className="admin-section">
        <h2>System Audit Logs</h2>
        <div className="audit-log-list" style={{maxHeight: '300px', overflowY: 'auto', background: '#f4f4f4', padding: '10px', borderRadius: '8px'}}>
          {logs.length === 0 ? <p>No logs available.</p> : logs.map(log => (
            <div key={log._id} style={{fontSize: '0.85rem', borderBottom: '1px solid #ddd', padding: '5px 0'}}>
              <span style={{color: '#666'}}>[{new Date(log.timestamp).toLocaleString()}]</span> 
              <strong> {log.action}</strong> - {log.details} (By: {log.performedBy})
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;