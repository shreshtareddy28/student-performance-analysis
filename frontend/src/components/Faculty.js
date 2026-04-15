import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import api from "../api";

const initialForm = {
  employeeId: "",
  name: "",
  department: "CSE",
  designation: "Faculty",
  email: "",
  password: "",
  phone: "",
  expertise: "",
  status: "active",
};

const departmentOptions = ["CSE", "ECE", "ME", "CE", "EE", "IT", "AIML", "DS"];
const statusOptions = ["active", "inactive"];

function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchFaculty = async () => {
    try {
      const response = await api.get("/api/users/faculty");
      setFaculty(response.data.faculty || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load faculty");
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      expertise: form.expertise
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/api/users/faculty/${editingId}`, payload);
      } else {
        await api.post("/api/users/faculty", payload);
      }
      setOpen(false);
      setEditingId(null);
      setForm(initialForm);
      fetchFaculty();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save faculty");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this faculty profile?")) return;
    try {
      await api.delete(`/api/users/faculty/${id}`);
      fetchFaculty();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete faculty");
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Faculty Command Center</Typography>
          <Typography color="text.secondary">
            Admin can onboard, update, and coordinate faculty ownership across departments.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            setEditingId(null);
            setForm(initialForm);
            setOpen(true);
          }}
          sx={{ borderRadius: 999, px: 3 }}
        >
          Add Faculty
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        {faculty.map((member) => (
          <Grid item xs={12} md={6} lg={4} key={member._id}>
            <Card sx={{ height: "100%", background: "linear-gradient(180deg, #ffffff, #f6fbff)" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                  <Box>
                    <Typography variant="h6">{member.name}</Typography>
                    <Typography color="text.secondary">{member.designation}</Typography>
                  </Box>
                  <Chip label={member.department} color="primary" />
                </Stack>
                <Typography sx={{ mt: 2 }}><strong>Employee ID:</strong> {member.employeeId}</Typography>
                <Typography><strong>Email:</strong> {member.user_id?.email}</Typography>
                <Typography><strong>Phone:</strong> {member.user_id?.phone || "Not set"}</Typography>
                <Typography><strong>Status:</strong> {member.user_id?.status || "active"}</Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Expertise:</strong> {member.expertise?.length ? member.expertise.join(", ") : "General mentoring"}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingId(member._id);
                      setForm({
                        employeeId: member.employeeId,
                        name: member.name,
                        department: member.department,
                        designation: member.designation,
                        email: member.user_id?.email || "",
                        password: "",
                        phone: member.user_id?.phone || "",
                        expertise: member.expertise?.join(", ") || "",
                        status: member.user_id?.status || "active",
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(member._id)}>
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Update Faculty" : "Add Faculty"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: "grid", gap: 2 }}>
            <TextField label="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required />
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField select label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required>
              {departmentOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingId} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Expertise (comma separated)" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}

export default Faculty;
