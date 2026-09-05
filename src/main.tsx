import React from "react";
import ReactDOM from "react-dom/client";
import EnhancedRoot from "./EnhancedRoot";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EnhancedRoot />
  </React.StrictMode>
);