import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Auth from './pages/Auth';
import StudentForm from './pages/StudentForm';
import AdminDashboard from './pages/AdminDashboard';
import CheckerDashboard from './pages/checkerDashboard';
import OrgPresidentDashboard from './pages/orgpresidentDashboard';
import GovernorDashboard from './pages/governorDashboard';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#C3110C', // vivid red
      dark: '#740A03', // dark red
      light: '#E6501B', // orange-red
      contrastText: '#fff'
    },
    secondary: {
      main: '#280905', // very dark
      contrastText: '#fff'
    }
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
  }
});

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="app-viewport"> 
          {user && (
            <nav className="navbar">
              <div className="nav-container">
                <h1>Seait Clearance</h1>
                <div className="nav-links">
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              </div>
            </nav>
          )}

          <main className="main-content">
            <Routes>
              <Route path="/auth" element={!user ? <Auth setUser={setUser} /> : <Navigate to="/" />} />
              <Route path="/" element={
                !user ? <Navigate to="/auth" /> :
                user.role === 'student' ? <StudentForm user={user} /> :
                user.role === 'admin' ? <Navigate to="/admin" /> :
                user.role === 'ssgp checker' ? <Navigate to="/checker" /> :
                user.role === 'org president' ? <Navigate to="/orgpresident" /> :
                user.role === 'governor' ? <Navigate to="/governor" /> :
                <Navigate to="/auth" />
              } />
              <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/auth" />} />
              <Route path="/checker" element={user?.role === 'ssgp checker' ? <CheckerDashboard /> : <Navigate to="/auth" />} />
              <Route path="/orgpresident" element={user?.role === 'org president' ? <OrgPresidentDashboard /> : <Navigate to="/auth" />} />
              <Route path="/governor" element={user?.role === 'governor' ? <GovernorDashboard /> : <Navigate to="/auth" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;