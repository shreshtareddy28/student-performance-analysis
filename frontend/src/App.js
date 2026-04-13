import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Marks from './components/Marks';
import Performance from './components/Performance';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [token, setToken] = React.useState(() => localStorage.getItem('token'));
  const [role, setRole] = React.useState(() => localStorage.getItem('role'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {token && <Navbar setToken={setToken} setRole={setRole} role={role} />}
        <Routes>
          <Route
            path="/login"
            element={!token ? <Login setToken={setToken} setRole={setRole} /> : <Navigate to="/dashboard" />}
          />
          <Route path="/dashboard" element={token ? <Dashboard role={role} /> : <Navigate to="/login" />} />
          <Route path="/students" element={token ? <Students role={role} /> : <Navigate to="/login" />} />
          <Route path="/marks" element={token ? <Marks role={role} /> : <Navigate to="/login" />} />
          <Route path="/performance" element={token ? <Performance role={role} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
