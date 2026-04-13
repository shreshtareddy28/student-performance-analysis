import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import api from '../api';

function Marks({ role }) {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [formData, setFormData] = useState({ student_id: '', subject: '', marks: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMarks();
    fetchStudents();
  }, []);

  const fetchMarks = async () => {
    try {
      const response = await api.get('/api/marks');
      setMarks(response.data.marks);
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/students');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleOpen = (mark = null) => {
    setEditingMark(mark);
    setFormData(mark ? {
      student_id: mark.student_id._id || mark.student_id,
      subject: mark.subject,
      marks: mark.marks,
    } : { student_id: '', subject: '', marks: '' });
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMark(null);
    setFormData({ student_id: '', subject: '', marks: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { ...formData, marks: Number(formData.marks) };

      if (editingMark) {
        await api.put(`/api/marks/${editingMark._id}`, payload);
      } else {
        await api.post('/api/marks', payload);
      }

      fetchMarks();
      window.dispatchEvent(new CustomEvent('marksUpdated'));
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mark record?')) {
      try {
        await api.delete(`/api/marks/${id}`);
        fetchMarks();
        window.dispatchEvent(new CustomEvent('marksUpdated'));
      } catch (error) {
        console.error('Error deleting mark:', error);
      }
    }
  };

  const normalizedRole = role?.toLowerCase();
  const canModify = ['admin', 'faculty'].includes(normalizedRole);
  const showFacultyColumn = ['admin', 'faculty'].includes(normalizedRole);
  const emptyColSpan = showFacultyColumn ? 5 : 4;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Marks
        </Typography>
        {canModify ? (
          <Button variant="contained" onClick={() => handleOpen()}>
            Add Marks
          </Button>
        ) : (
          <Typography variant="subtitle1" color="textSecondary">
            Students can only view marks.
          </Typography>
        )}
      </Box>

      {normalizedRole === 'student' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You can only view marks.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Marks</TableCell>
              {showFacultyColumn && <TableCell>Faculty</TableCell>}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marks.length > 0 ? (
              marks.map((mark) => (
                <TableRow key={mark._id}>
                  <TableCell>{mark.student_id?.name || 'Unknown'}</TableCell>
                  <TableCell>{mark.subject}</TableCell>
                  <TableCell>{mark.marks}</TableCell>
                  {showFacultyColumn && (
                    <TableCell>{mark.faculty_id?.email || 'Unknown'}</TableCell>
                  )}
                  <TableCell>
                    {canModify ? (
                      <>
                        <Button size="small" onClick={() => handleOpen(mark)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(mark._id)}>
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Read-only
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={emptyColSpan} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No marks found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMark ? 'Edit Marks' : 'Add Marks'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <FormControl fullWidth margin="dense">
              <InputLabel>Student</InputLabel>
              <Select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required
              >
                {students.map((student) => (
                  <MenuItem key={student._id} value={student._id}>
                    {student.name} ({student.rollNumber})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Subject"
              fullWidth
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Marks"
              type="number"
              fullWidth
              required
              inputProps={{ min: 0, max: 100 }}
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingMark ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default Marks;