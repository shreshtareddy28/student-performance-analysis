import React, { useCallback, useEffect, useState } from "react";
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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import api from "../api";

const examOptions = [
  { value: "mid1", label: "Mid 1", maxMarks: 30 },
  { value: "mid2", label: "Mid 2", maxMarks: 30 },
  { value: "endsem", label: "End Semester", maxMarks: 60 },
  { value: "quiz", label: "Quiz", maxMarks: 20 },
  { value: "assignment", label: "Assignment", maxMarks: 20 },
  { value: "lab", label: "Lab", maxMarks: 25 },
];

const initialForm = {
  studentRollNo: "",
  subject: "",
  examType: "mid1",
  marksObtained: 0,
  maxMarks: 30,
  semester: 1,
  academicYear: "2026",
  date: new Date().toISOString().split("T")[0],
};

function Marks({ auth }) {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [searchQuery, setSearchQuery] = useState("");

  const canModify = auth.role === "admin" || auth.role === "faculty";

  const loadData = useCallback(async () => {
    try {
      const marksResponse = await api.get("/api/marks");
      setMarks(marksResponse.data.marks || []);
      if (canModify) {
        const studentsResponse = await api.get("/api/students");
        setStudents(studentsResponse.data.students || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load marks");
    }
  }, [canModify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitMarks = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const payload = { ...form, marksObtained: Number(form.marksObtained), maxMarks: Number(form.maxMarks) };
      if (editing) {
        await api.put(`/api/marks/${editing._id}`, payload);
      } else {
        await api.post("/api/marks", payload);
      }
      setOpen(false);
      setEditing(null);
      setForm(initialForm);
      loadData();
      window.dispatchEvent(new CustomEvent("marksUpdated"));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save marks");
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setForm(initialForm);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Assessment Studio</Typography>
          <Typography color="text.secondary">
            Record every meaningful assessment touchpoint, not just final exams.
          </Typography>
        </Box>
        {canModify && (
          <Button
            variant="contained"
            onClick={() => {
              setEditing(null);
              setForm(initialForm);
              setOpen(true);
            }}
            sx={{ borderRadius: 999, px: 3 }}
          >
            Add Assessment
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!canModify && <Alert severity="info" sx={{ mb: 2 }}>Student view is read-only and shows only your own marks.</Alert>}

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by Student Roll No..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
        />
      </Box>

      {(() => {
        const filteredMarks = marks.filter((mark) =>
          mark.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (!searchQuery) {
          return (
            <Grid container spacing={2}>
              {filteredMarks.map((mark) => (
                <Grid item xs={12} md={6} lg={4} key={mark._id}>
                  <Card sx={{ height: "100%", background: "linear-gradient(180deg, #ffffff, #f9fbfd)" }}>
                    <CardContent>
                      <Typography variant="h6">{mark.subject}</Typography>
                      <Typography color="text.secondary">
                        {mark.studentRollNo} • {mark.examType.toUpperCase()} • Semester {mark.semester || 1}
                      </Typography>
                      <Typography sx={{ mt: 2 }} variant="h4">
                        {mark.marksObtained}/{mark.maxMarks}
                      </Typography>
                      <Typography color="text.secondary">
                        {(mark.percentage || ((mark.marksObtained / mark.maxMarks) * 100)).toFixed(1)}% • {new Date(mark.date).toLocaleDateString()}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>
                        <strong>Recorded by:</strong> {mark.faculty_id?.name || mark.faculty_id?.email || "System"}
                      </Typography>
                      {canModify && (
                        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                          <Button
                            size="small"
                            onClick={() => {
                              setEditing(mark);
                              setForm({
                                studentRollNo: mark.studentRollNo,
                                subject: mark.subject,
                                examType: mark.examType,
                                marksObtained: mark.marksObtained,
                                maxMarks: mark.maxMarks,
                                semester: mark.semester || 1,
                                academicYear: mark.academicYear || "",
                                date: new Date(mark.date).toISOString().split("T")[0],
                              });
                              setOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={async () => {
                              try {
                                await api.delete(`/api/marks/${mark._id}`);
                                loadData();
                                window.dispatchEvent(new CustomEvent("marksUpdated"));
                              } catch (err) {
                                setError(err.response?.data?.message || "Failed to delete marks");
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          );
        }

        const groupedMarks = filteredMarks.reduce((acc, mark) => {
          const sem = mark.semester || 1;
          if (!acc[sem]) acc[sem] = {};
          const subj = mark.subject;
          if (!acc[sem][subj]) acc[sem][subj] = [];
          acc[sem][subj].push(mark);
          return acc;
        }, {});

        return Object.keys(groupedMarks).sort((a, b) => Number(a) - Number(b)).map((sem) => (
          <Box key={`sem-${sem}`} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", borderBottom: "2px solid #eaeaea", pb: 1 }}>
              Semester {sem}
            </Typography>
            {Object.keys(groupedMarks[sem]).sort().map((subj) => (
              <Box key={`subj-${subj}`} sx={{ mb: 3 }}>
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  {subj}
                </Typography>
                <Grid container spacing={2}>
                  {groupedMarks[sem][subj].map((mark) => (
                    <Grid item xs={12} md={4} key={mark._id}>
                      <Card sx={{ background: "linear-gradient(180deg, #ffffff, #f9fbfd)" }}>
                        <CardContent>
                          <Typography color="text.secondary" sx={{ fontWeight: "bold" }}>
                            {mark.examType.toUpperCase()}
                          </Typography>
                          <Typography sx={{ mt: 1 }} variant="h5">
                            {mark.marksObtained}/{mark.maxMarks}
                          </Typography>
                          <Typography color="text.secondary">
                            {(mark.percentage || ((mark.marksObtained / mark.maxMarks) * 100)).toFixed(1)}%
                          </Typography>
                          {canModify && (
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                              <Button
                                size="small"
                                onClick={() => {
                                  setEditing(mark);
                                  setForm({
                                    studentRollNo: mark.studentRollNo,
                                    subject: mark.subject,
                                    examType: mark.examType,
                                    marksObtained: mark.marksObtained,
                                    maxMarks: mark.maxMarks,
                                    semester: mark.semester || 1,
                                    academicYear: mark.academicYear || "",
                                    date: new Date(mark.date).toISOString().split("T")[0],
                                  });
                                  setOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={async () => {
                                  try {
                                    await api.delete(`/api/marks/${mark._id}`);
                                    loadData();
                                    window.dispatchEvent(new CustomEvent("marksUpdated"));
                                  } catch (err) {
                                    setError(err.response?.data?.message || "Failed to delete marks");
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        ));
      })()}

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Update Assessment" : "Add Assessment"}</DialogTitle>
        <Box component="form" onSubmit={submitMarks}>
          <DialogContent sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Student Roll Number"
              value={form.studentRollNo}
              onChange={(e) => setForm({ ...form, studentRollNo: e.target.value })}
              helperText={students.length ? `Available: ${students.slice(0, 5).map((student) => student.rollNo).join(", ")}` : ""}
              required
            />
            <TextField label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            <TextField
              label="Exam Type"
              select
              value={form.examType}
              onChange={(e) => {
                const selected = examOptions.find((item) => item.value === e.target.value);
                setForm({ ...form, examType: e.target.value, maxMarks: selected?.maxMarks || form.maxMarks });
              }}
              required
            >
              {examOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Marks Obtained" type="number" value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: e.target.value })} required />
            <TextField label="Max Marks" type="number" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} required />
            <TextField label="Semester" type="number" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} />
            <TextField label="Academic Year" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
            <TextField label="Date" type="date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained">{editing ? "Update" : "Save"}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}

export default Marks;
