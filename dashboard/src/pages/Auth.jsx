import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const Auth = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const path = isLogin ? 'login' : 'signup';
      const res = await axios.post(`http://localhost:5000/api/${path}`, form);
      
      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
      } else {
        alert("Registration Successful! Please wait for Admin approval before logging in.");
        setIsLogin(true); // Move back to login page
      }
    } catch (err) { 
      // Handle the 403 status specifically
      const errorMsg = err.response?.data?.message || "Something went wrong";
      alert(errorMsg); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && <input type="text" placeholder="Full Name" required onChange={e => setForm({...form, fullName: e.target.value})} />}
          <input type="email" placeholder="Email" required onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" className="btn-primary">{isLogin ? "Enter" : "Register"}</button>
        </form>
        <p className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create an account" : "Back to Login"}
        </p>
      </div>
    </div>
  );
};

export default Auth;