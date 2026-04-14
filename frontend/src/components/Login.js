import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { School, AdminPanelSettings, Person } from '@mui/icons-material';
import api from '../api';

function Login({ setToken, setRole }) {
  const [activeRole, setActiveRole] = useState('faculty');
  const [formData, setFormData] = useState({ email: '', password: '', role: 'faculty', rollno: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const roleConfig = {
    faculty: {
      icon: <School sx={{ fontSize: 40, marginRight: 1 }} />,
      label: 'Faculty Login',
      color: '#1976d2',
      description: 'Login to manage student marks and performance',
    },
    admin: {
      icon: <AdminPanelSettings sx={{ fontSize: 40, marginRight: 1 }} />,
      label: 'Admin Login',
      color: '#d32f2f',
      description: 'Login to manage system and users',
    },
    student: {
      icon: <Person sx={{ fontSize: 40, marginRight: 1 }} />,
      label: 'Student Login',
      color: '#388e3c',
      description: 'Login to view your performance data',
    },
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignup) {
        const payload = { ...formData, role: formData.role || activeRole };
        await api.post('/api/auth/signup', payload);
        setSuccess('Account created successfully! Please login with your credentials.');
        setFormData({ email: '', password: '', role: activeRole });
        setIsSignup(false);
      } else {
        const payload = { email: formData.email, password: formData.password };
        if (activeRole === 'student') {
          payload.rollno = formData.rollno;
        }
        const response = await api.post('/api/auth/login', payload);
        const userRole = response.data.role || 'student';
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', userRole);
        setToken(response.data.token);
        setRole(userRole);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = roleConfig[activeRole];

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
            Performance Analysis System
          </Typography>

          {/* Role Selection Tabs */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(roleConfig).map(([role, config]) => (
              <Chip
                key={role}
                icon={config.icon}
                label={config.label}
                onClick={() => {
                  setActiveRole(role);
                  setFormData({ email: '', password: '', role, rollno: '' });
                  setError('');
                  setSuccess('');
                  setIsSignup(false);
                }}
                variant={activeRole === role ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: activeRole === role ? config.color : 'transparent',
                  color: activeRole === role ? 'white' : config.color,
                  borderColor: config.color,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: '24px 16px',
                  height: 'auto',
                }}
              />
            ))}
          </Box>

          {/* Role Description */}
          <Typography variant="body2" align="center" sx={{ mb: 3, color: 'textSecondary' }}>
            {currentConfig.description}
          </Typography>

          {/* Alerts */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
            />

            {activeRole === 'student' && !isSignup && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="rollno"
                label="Roll Number"
                id="rollno"
                value={formData.rollno}
                onChange={handleChange}
                variant="outlined"
              />
            )}

            {isSignup && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="signup-role-label">Role</InputLabel>
                <Select
                  labelId="signup-role-label"
                  id="signup-role"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                backgroundColor: currentConfig.color,
                '&:hover': {
                  backgroundColor: currentConfig.color,
                  opacity: 0.9,
                }
              }}
              disabled={loading}
            >
              {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                {' '}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: currentConfig.color,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': { opacity: 0.8 },
                  }}
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setFormData({ email: '', password: '', role: activeRole });
                    setError('');
                    setSuccess('');
                  }}
                >
                  {isSignup ? 'Sign In' : 'Sign Up'}
                </Typography>
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" display="block" align="center" sx={{ mt: 4, color: 'textSecondary' }}>
            Note: When signing up, the selected role will be used for new accounts. Students will still be the default role unless you select Faculty or Admin.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;