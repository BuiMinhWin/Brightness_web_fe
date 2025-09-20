import { createTheme } from "@mui/material/styles";

// Neutral theme: no CssBaseline, no global overrides to avoid visual changes.
const theme = createTheme({
  palette: {
    mode: "light",
  },
});

export default theme;
