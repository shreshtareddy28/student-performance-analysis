import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Container, Grid, Stack, TextField, Typography } from "@mui/material";
import { AdminPanelSettings, MenuBook, Person } from "@mui/icons-material";
import api from "../api";

const roles = {
  admin: {
    icon: <AdminPanelSettings sx={{ fontSize: 34 }} />,
    title: "Admin",
    description: "Owns the full academic command center, faculty operations, and student lifecycle.",
    accent: "#113c6b",
  },
  faculty: {
    icon: <MenuBook sx={{ fontSize: 34 }} />,
    title: "Faculty",
    description: "Records marks, monitors risk, and triggers intervention for students who need help.",
    accent: "#0d7a6f",
  },
  student: {
    icon: <Person sx={{ fontSize: 34 }} />,
    title: "Student",
    description: "Tracks score trends, badges, attendance, and an actionable study plan.",
    accent: "#e86f2d",
  },
};

function Login({ setAuth }) {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("admin");
  const [signupMode, setSignupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", rollno: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (signupMode) {
        const response = await api.post("/api/auth/signup", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setSuccess(response.data.message);
        setSignupMode(false);
        setForm({ name: "", email: "", password: "", rollno: "" });
      } else {
        const payload = { email: form.email, password: form.password };
        if (activeRole === "student") payload.rollno = form.rollno;
        const response = await api.post("/api/auth/login", payload);

        if (response.data.role !== activeRole) {
          throw new Error(`This account is registered as ${response.data.role}. Switch to that role and try again.`);
        }

        setAuth({
          token: response.data.token,
          role: response.data.role,
          user: response.data.user,
        });
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(17,60,107,0.18), transparent 35%), linear-gradient(135deg, #f2f8ff 0%, #fff6ef 52%, #edf7f6 100%)",
        display: "flex",
        alignItems: "center",
        py: 5,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="h3">Student Performance Analysis, upgraded for real academic decisions.</Typography>
              <Typography variant="h6" color="text.secondary">
                Early alerts, richer analytics, stronger faculty coordination, and focused student recovery plans.
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(roles).map(([key, role]) => (
                  <Grid item xs={12} key={key}>
                    <Card
                      onClick={() => setActiveRole(key)}
                      sx={{
                        cursor: "pointer",
                        border: key === activeRole ? `2px solid ${role.accent}` : "1px solid rgba(17,60,107,0.1)",
                        background: key === activeRole ? "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(224,239,249,0.9))" : "white",
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ color: role.accent }}>{role.icon}</Box>
                          <Box>
                            <Typography variant="h6">{role.title} Portal</Typography>
                            <Typography color="text.secondary">{role.description}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 6, overflow: "hidden" }}>
              <Box sx={{ p: 4, background: `linear-gradient(135deg, ${roles[activeRole].accent}, #1b95a6)`, color: "white" }}>
                <Typography variant="h4">{signupMode ? "Bootstrap Account" : `${roles[activeRole].title} Login`}</Typography>
                <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.82)" }}>
                  {signupMode
                    ? "The first signup becomes admin. Later signups create student accounts."
                    : "Use the correct role entry point for a cleaner and more secure workflow."}
                </Typography>
              </Box>
              <CardContent sx={{ p: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
                  {signupMode && (
                    <TextField label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  )}
                  <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  {!signupMode && activeRole === "student" && (
                    <TextField label="Roll Number" value={form.rollno} onChange={(e) => setForm({ ...form, rollno: e.target.value })} required />
                  )}
                  <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ borderRadius: 999 }}>
                    {loading ? "Please wait..." : signupMode ? "Create Account" : "Enter Portal"}
                  </Button>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                  <Typography color="text.secondary">
                    {signupMode ? "Already created the bootstrap account?" : "Need to initialize the system?"}
                  </Typography>
                  <Button variant="text" onClick={() => setSignupMode((current) => !current)}>
                    {signupMode ? "Back to login" : "Sign up"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Login;
