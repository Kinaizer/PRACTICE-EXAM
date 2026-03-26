import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './StudentForm.css';

const StudentForm = ({ user }) => {
  // Use 'Engineering' as default since 'SEAIT' isn't in your dropdown options
  const [track, setTrack] = useState('Engineering'); 
  const [idNum, setIdNum] = useState('');
  const [ssgpLink, setSsgpLink] = useState(''); 
  const [myRequests, setMyRequests] = useState([]); // Added back to avoid map errors

  // 1. THIS WAS MISSING - The function must be defined before use
  const fetchMyData = useCallback(async () => {
    if (!user?._id) return; // Guard clause
    try {
      const res = await axios.get(`http://localhost:5000/api/requests/${user._id}`);
      setMyRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  }, [user?._id]);

  useEffect(() => { 
    fetchMyData(); 
  }, [fetchMyData]);

  const submitReq = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/requests', {
        userId: user._id, 
        fullName: user.fullName, 
        studentId: idNum, 
        track, 
        ssgpLink: ssgpLink 
      });
      alert("Request Submitted Successfully!");
      
      setSsgpLink(''); 
      fetchMyData();
    } catch (err) {
      alert("Error submitting request.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={submitReq} className="request-form">
        <h3>Clearance Request</h3>
        
        <label>Student ID Number:</label>
        <input 
          type="text" 
          placeholder="e.g. 2024-001" 
          required 
          value={idNum} 
          onChange={e => setIdNum(e.target.value)} 
        />
        
        <label>Organization:</label>
        <select value={track} onChange={e => setTrack(e.target.value)}>
          <option value="Engineering">Engineering</option>
          <option value="Architecture">Architecture</option>
          <option value="Information Technology">Information Technology</option>
        </select>

        <label>SSGP Link:</label>
        <input 
          type="url" 
          placeholder="place your googledrive link here"
          required
          value={ssgpLink} 
          onChange={e => setSsgpLink(e.target.value)} 
        />

        <button type="submit" className="btn-primary" style={{marginTop: '10px'}}>Submit Request</button>
      </form>
      <hr />
      
      {/* 2. Added back the history display so the page isn't empty */}
      <h3>My Request History</h3>
      <div className="history-container">
        {myRequests.length === 0 ? <p>No requests yet.</p> : myRequests.map(r => (
          <div key={r._id} className="card" style={{padding: '10px', marginBottom: '10px', border: '1px solid #ccc'}}>
             <p>Track: {r.track}</p>
             <p>Status: {r.status}</p>
             <a href={r.ssgpLink} target="_blank" rel="noreferrer">View Link</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentForm;