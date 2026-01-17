import { useEffect, useState } from "react";
import { getData } from "./utils/storage";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const { user } = useAuth();
  const [experiment, setExperiment] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getData("experimentDetails").then((data) => {
        if (data) setExperiment(data);
      });
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  if (!experiment) {
    return <div className="p-6 text-center">Loading experiment details...</div>;
  }

  return <Dashboard experiment={experiment} />;
}

export default App;
