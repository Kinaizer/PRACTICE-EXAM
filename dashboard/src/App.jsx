import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Auth from './pages/Auth';
import StudentForm from './pages/StudentForm';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      {user && (
        <nav className="navbar">
          <h1>Campus Connect</h1>
          <div className="nav-links">
            <span>Hello, {user.fullName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/auth" element={!user ? <Auth setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/" element={user?.role === 'student' ? <StudentForm user={user} /> : user?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/auth" />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;