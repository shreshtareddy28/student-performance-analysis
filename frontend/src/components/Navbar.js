import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';

function Navbar({ setToken, setRole, role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
          <Typography variant="h6" component="div">
            Performance Analysis System
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Role: {role || 'Unknown'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate('/students')}>
            Students
          </Button>
          <Button color="inherit" onClick={() => navigate('/marks')}>
            Marks
          </Button>
          <Button color="inherit" onClick={() => navigate('/performance')}>
            Performance
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;