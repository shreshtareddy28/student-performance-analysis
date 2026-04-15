import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Students from "./components/Students";
import Marks from "./components/Marks";
import Performance from "./components/Performance";
import Navbar from "./components/Navbar";
import Faculty from "./components/Faculty";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#113c6b",
    },
    secondary: {
      main: "#e86f2d",
    },
    background: {
      default: "#eef3f8",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
});

const getStoredAuth = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = localStorage.getItem("user");
  return {
    token,
    role,
    user: user ? JSON.parse(user) : null,
  };
};

function ProtectedRoute({ auth, children, allowRoles }) {
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles && !allowRoles.includes(auth.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const [auth, setAuth] = React.useState(getStoredAuth);

  const handleAuthChange = React.useCallback((nextAuth) => {
    if (!nextAuth?.token) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      setAuth({ token: null, role: null, user: null });
      return;
    }

    localStorage.setItem("token", nextAuth.token);
    localStorage.setItem("role", nextAuth.role);
    localStorage.setItem("user", JSON.stringify(nextAuth.user || null));
    setAuth(nextAuth);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {auth.token && <Navbar auth={auth} setAuth={handleAuthChange} />}
        <Routes>
          <Route
            path="/login"
            element={!auth.token ? <Login setAuth={handleAuthChange} /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute auth={auth}>
                <Dashboard auth={auth} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute auth={auth} allowRoles={["admin", "faculty"]}>
                <Students auth={auth} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty"
            element={
              <ProtectedRoute auth={auth} allowRoles={["admin"]}>
                <Faculty auth={auth} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marks"
            element={
              <ProtectedRoute auth={auth}>
                <Marks auth={auth} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedRoute auth={auth}>
                <Performance auth={auth} />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={auth.token ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
