
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Pages/Login_page/Register';
import Login from './Pages/Login_page/Login';
import Dashboard from './Components/dashboard'


function App() {
  return (
    <div className="App">
       <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
