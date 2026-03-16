import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const StudentForm = ({ user }) => {
  const [track, setTrack] = useState('STEM');
  const [doc, setDoc] = useState('Form 137 (SF10)'); // Set default dropdown value
  const [idNum, setIdNum] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  const fetchMyData = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/requests/${user._id}`);
      setMyRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  }, [user._id]);

  useEffect(() => { fetchMyData(); }, [fetchMyData]);

  const submitReq = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/requests', {
        userId: user._id, 
        fullName: user.fullName, 
        studentId: idNum, 
        track, 
        documentType: doc
      });
      alert("Request Submitted Successfully!");
      fetchMyData();
    } catch (err) {
      alert("Error submitting request.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={submitReq} className="request-form">
        <h3>New Document Request</h3>
        
        <label>Student ID Number:</label>
        <input type="text" placeholder="e.g. 2024-001" required value={idNum} onChange={e => setIdNum(e.target.value)} />
        
        <label>Academic Track:</label>
        <select value={track} onChange={e => setTrack(e.target.value)}>
          <option value="TVL">TVL</option>
          <option value="STEM">STEM</option>
          <option value="STEAM">STEAM</option>
          <option value="ABM">ABM</option>
        </select>

        <label>Document Type:</label>
        <select value={doc} onChange={e => setDoc(e.target.value)} required>
          <option value="Form 137 (SF10)">Form 137 (SF10) - Permanent Record</option>
          <option value="Form 138 (SF9)">Form 138 (SF9) - Report Card</option>
          <option value="Certificate of Good Moral Character">Certificate of Good Moral Character</option>
          <option value="Certificate of Graduation">Certificate of Graduation</option>
        </select>

        <button type="submit" className="btn-primary" style={{marginTop: '10px'}}>Submit Request</button>
      </form>

      <hr />
      
      <h3>My Request History</h3>
      <div className="history-container">
        {myRequests.length === 0 ? <p>No requests yet.</p> : myRequests.map(r => (
          <div key={r._id} className="card history-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <p><strong>{r.documentType}</strong></p>
              <small>Requested: {new Date(r.createdAt).toLocaleDateString()}</small>
            </div>
            <span className={`badge ${r.status.toLowerCase()}`} style={{
              padding: '4px 8px', 
              borderRadius: '4px',
              backgroundColor: r.status === 'Approved' ? '#d4edda' : r.status === 'Denied' ? '#f8d7da' : '#fff3cd'
            }}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentForm;