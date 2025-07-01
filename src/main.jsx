import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./Root";
import "./index.css";
import { Provider } from 'react-redux';
import { store } from "./redux/store";
import { setSubdomain } from "./redux/features/slice/subdomainSlice";


const getSubdomain = () => {
  const host = window.location.hostname; // e.g., school1.example.com
  const parts = host.split(".");
  if (parts.length > 2) {
    return parts[0]; // subdomain
  }
  return null;
};

store.dispatch(setSubdomain(getSubdomain()));


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <Root />
    </Provider>
  </React.StrictMode>
);