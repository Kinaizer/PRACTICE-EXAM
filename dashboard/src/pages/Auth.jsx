import React, { useState } from 'react';
import axios from 'axios';
import seaitLogo from '../assets/seaitlogo.png';
import './Auth.css';

const Auth = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    fullName: '',
    idNumber: '',
    password: '',
    role: 'student',
    organization: 'Engineering'
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup';

      const payload = isLogin
        ? {
          loginId: form.idNumber,
          password: form.password
        }
        : form;

      const res = await axios.post(endpoint, payload);

      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
      } else {
        alert(res.data.message || 'Registration successful! Wait for admin approval.');
        setIsLogin(true);
      }

    } catch (err) {
      console.error('Auth Error:', err);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Connection failed. Check backend or proxy.';

      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={seaitLogo} alt="SEAIT Logo" className="auth-logo" />
        <h2>{isLogin ? 'SEAIT Clearance System' : 'Sign Up'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                required
                value={form.fullName}
                onChange={handleChange}
              />
              <select
                name="organization"
                value={form.organization}
                onChange={handleChange}
                required
              >
                <option value="Engineering">Engineering</option>
                <option value="Architecture">Architecture</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </>
          )}

          <input
            type="text"
            name="idNumber"
            placeholder={isLogin ? "ID Number or Email" : "ID Number"}
            required
            value={form.idNumber}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" className="btn-primary">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p
          className="toggle-link"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Create an account' : 'Back to Login'}
        </p>
      </div>
    </div>
  );
};

export default Auth;