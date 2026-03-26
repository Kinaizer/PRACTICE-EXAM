import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
      <div className="app-viewport"> {/* Centralized Wrapper */}
        {user && (
          <nav className="navbar">
            <div className="nav-container">
              <h1>Seait Clearance</h1>
              <div className="nav-links">
                <span>Hello, {user.fullName}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </div>
          </nav>
        )}

        <main className="main-content">
          <Routes>
            <Route path="/auth" element={!user ? <Auth setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/" element={user?.role === 'student' ? <StudentForm user={user} /> : user?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/auth" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;