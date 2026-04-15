import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import api from "../api";

const initialForm = {
  name: "",
  rollNo: "",
  email: "",
  password: "",
  branch: "CSE",
  semester: 1,
  section: "A",
  attendancePercentage: 0,
  guardianName: "",
  guardianPhone: "",
  cgpaTarget: 8,
};

const branchOptions = ["CSE", "ECE", "ME", "CE", "EE", "IT", "AIML", "DS"];

function Students({ auth }) {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const isAdmin = auth.role === "admin";

  const fetchStudents = async () => {
    try {
      const response = await api.get("/api/students");
      setStudents(response.data.students || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openDialog = (student = null) => {
    setEditingStudent(student);
    setForm(
      student
        ? {
            name: student.name,
            rollNo: student.rollNo,
            email: student.user_id?.email || "",
            password: "",
            branch: student.branch,
            semester: student.semester || 1,
            section: student.section || "A",
            attendancePercentage: student.attendancePercentage || 0,
            guardianName: student.guardianName || "",
            guardianPhone: student.guardianPhone || "",
            cgpaTarget: student.cgpaTarget || 8,
          }
        : initialForm
    );
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editingStudent) {
        await api.put(`/api/students/${editingStudent.rollNo}`, form);
      } else {
        await api.post("/api/students", form);
      }
      setOpen(false);
      setEditingStudent(null);
      setForm(initialForm);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rollNo) => {
    if (!window.confirm("Delete this student record?")) return;
    try {
      await api.delete(`/api/students/${rollNo}`);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student");
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setEditingStudent(null);
    setForm(initialForm);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Student Success Profiles</Typography>
          <Typography color="text.secondary">
            Rich student records with attendance, targets, guardians, and intervention-aware updates.
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" onClick={() => openDialog()} sx={{ borderRadius: 999, px: 3 }}>
            Add Student
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        {students.map((student) => (
          <Grid item xs={12} md={6} lg={4} key={student._id}>
            <Card sx={{ height: "100%", background: "linear-gradient(180deg, #ffffff, #f9fbfd)" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                  <Box>
                    <Typography variant="h6">{student.name}</Typography>
                    <Typography color="text.secondary">
                      {student.rollNo} • {student.branch} • Semester {student.semester}
                    </Typography>
                  </Box>
                  <Typography fontWeight={700}>{student.attendancePercentage || 0}%</Typography>
                </Stack>
                <LinearProgress
                  value={student.attendancePercentage || 0}
                  variant="determinate"
                  color={(student.attendancePercentage || 0) < 75 ? "warning" : "success"}
                  sx={{ mt: 1.5, mb: 2, height: 8, borderRadius: 99 }}
                />
                <Typography><strong>Email:</strong> {student.user_id?.email}</Typography>
                <Typography><strong>Section:</strong> {student.section || "A"}</Typography>
                <Typography><strong>Guardian:</strong> {student.guardianName || "Not assigned"}</Typography>
                <Typography><strong>Target CGPA:</strong> {student.cgpaTarget || 8}</Typography>
                <Typography><strong>Advisor:</strong> {student.advisorFacultyId?.name || "Not assigned"}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                  <Button size="small" onClick={() => openDialog(student)}>Edit</Button>
                  {isAdmin && (
                    <Button size="small" color="error" onClick={() => handleDelete(student.rollNo)}>
                      Delete
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStudent ? "Update Student" : "Add Student"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: "grid", gap: 2 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField label="Roll Number" value={form.rollNo} disabled={Boolean(editingStudent)} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} required />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            {!editingStudent && (
              <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            )}
            <TextField select label="Branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
              {branchOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Semester" type="number" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} />
            <TextField label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
            <TextField label="Attendance %" type="number" value={form.attendancePercentage} onChange={(e) => setForm({ ...form, attendancePercentage: Number(e.target.value) })} />
            <TextField label="Guardian Name" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
            <TextField label="Guardian Phone" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
            <TextField label="Target CGPA" type="number" value={form.cgpaTarget} onChange={(e) => setForm({ ...form, cgpaTarget: Number(e.target.value) })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Saving..." : editingStudent ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}

export default Students;
