import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Chip } from "@mui/material";

function Navbar({ auth, setAuth }) {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Dashboard", path: "/dashboard", roles: ["admin", "faculty", "student"] },
    { label: "Students", path: "/students", roles: ["admin", "faculty"] },
    { label: "Faculty", path: "/faculty", roles: ["admin"] },
    { label: "Marks", path: "/marks", roles: ["admin", "faculty", "student"] },
    { label: "Performance", path: "/performance", roles: ["admin", "faculty", "student"] },
  ].filter((item) => item.roles.includes(auth.role));

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: "blur(18px)",
        background: "linear-gradient(135deg, rgba(17,60,107,0.94), rgba(18,113,143,0.88))",
        borderBottom: "1px solid rgba(255,255,255,0.14)",
      }}
    >
      <Toolbar sx={{ gap: 2, flexWrap: "wrap", py: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
          <Typography variant="h6">Performance Analysis</Typography>
          <Chip
            label={`${auth.role?.toUpperCase() || "USER"} MODE`}
            size="small"
            sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
            variant="outlined"
          />
          {auth.user?.name && (
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)" }}>
              {auth.user.name}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {items.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                color: "white",
                backgroundColor: location.pathname === item.path ? "rgba(255,255,255,0.16)" : "transparent",
                borderRadius: 999,
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            onClick={() => setAuth(null)}
            sx={{ color: "white", border: "1px solid rgba(255,255,255,0.24)", borderRadius: 999 }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
