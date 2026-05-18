import { createTheme } from "@mui/material";

// --- Beautiful Light Theme ---
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4f46e5" }, // Indigo 600
    secondary: { main: "#0891b2" }, // Cyan 600
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    background: { default: "#f8fafc", paper: "#ffffff" }, // Slate 50 & White
    divider: "#e2e8f0", // Slate 200
    text: { primary: "#0f172a", secondary: "#475569", disabled: "#94a3b8" },
  },
  typography: { fontFamily: "'Inter', -apple-system, sans-serif" },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, minHeight: 44 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#f8fafc",
          fontWeight: 700,
          color: "#475569",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          borderBottom: "1px solid #e2e8f0",
        },
        body: { borderBottom: "1px solid #e2e8f0", fontSize: "0.875rem" },
      },
    },
  },
});

// --- Beautiful Dark Theme ---
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6366f1" }, // Indigo 500
    secondary: { main: "#06b6d4" }, // Cyan 500
    success: { main: "#22c55e" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    background: { default: "#0f172a", paper: "#111827" }, // Slate 900 & 800
    divider: "#1e293b", // Slate 800
    text: { primary: "#e2e8f0", secondary: "#94a3b8", disabled: "#475569" },
  },
  typography: { fontFamily: "'Inter', -apple-system, sans-serif" },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, minHeight: 44 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#0f172a",
          fontWeight: 700,
          color: "#94a3b8",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          borderBottom: "1px solid #1e293b",
        },
        body: { borderBottom: "1px solid #1e293b", fontSize: "0.875rem" },
      },
    },
  },
});

export const currentTheme = lightTheme;
