import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/login/Login";
import PrimeiroAcesso from "./pages/PrimeiroAcesso/PrimeiroAcesso";

import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/primeiro-acesso"
          element={<PrimeiroAcesso />}
        />

        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            path="dashboard"
            element={<Dashboard />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;