import React from "react";
import Router from "./routes/Router";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./mui/theme";

const App: React.FC = () => {
  return <RootLayout />;
};

export default App;
