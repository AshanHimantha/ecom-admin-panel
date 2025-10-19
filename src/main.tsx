// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { ConfigProvider } from "./contexts/ConfigContext.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import "./utils/aws-config"; // Your Amplify config

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);