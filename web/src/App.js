import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Header from "./compo/header";
import Home from "./compo/home";
import AdminDashboard from "./compo/admin_dashboard";
import { useState } from "react";

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="App">
      <Header
        onAdminClick={() => setShowAdmin((p) => !p)}
        isAdmin={showAdmin}
      />
      {showAdmin ? (
        <AdminDashboard onClose={() => setShowAdmin(false)} />
      ) : (
        <Home />
      )}
    </div>
  );
}

export default App;
