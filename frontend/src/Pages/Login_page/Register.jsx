import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate,Link } from 'react-router-dom';
import './../Login_page/Login.css'

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/register', formData);
      alert("Registered successfully");
      navigate('/login');
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="login-con">
     <div className="form-container">
    <p className="title">Create Account</p>
    <form onSubmit={handleSubmit}>
      <input name="username" type='email' onChange={handleChange} required placeholder="Username" /> 
       <input name="password" type="password" onChange={handleChange} required placeholder="Password" />
       <button type="submit"  className="form-btn" id="btn"  >Register</button>
       <Link to='/login' >Already have a account</Link>
       </form>
  </div>
  </div>
  );
};

export default Register;
