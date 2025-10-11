import React from "react";
import Router from "./routes/Router";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import theme from "./mui/theme";
import { store } from "./store/store";
import AuthInitializer from "./components/AuthInitializer";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AuthInitializer />
        <Router />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
