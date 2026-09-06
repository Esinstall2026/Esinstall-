import React from "react";
import ReactDOM from "react-dom/client";
import EnhancedRoot from "./EnhancedRoot";
import UserPortal from "./UserPortal";
import { AccessGate, getSession } from "./Auth";
import "./styles.css";

function RoleRoot() {
  const session = getSession();
  return session?.role === "User" ? <UserPortal /> : <EnhancedRoot />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccessGate>
      <RoleRoot />
    </AccessGate>
  </React.StrictMode>
);