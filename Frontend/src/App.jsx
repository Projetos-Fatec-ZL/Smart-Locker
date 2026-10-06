import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/login/Login";
import PrimeiroAcesso from "./pages/PrimeiroAcesso/PrimeiroAcesso";


import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Armarios from "./pages/admin/Armarios/Armarios";
import Funcionarios from "./pages/admin/Funcionarios/Funcionarios";
import ListaEspera from "./pages/admin/ListaEspera/ListaEspera";
import AchadosPerdidos from "./pages/admin/AchadosPerdidos/AchadosPerdidos";

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

          <Route
            path="armarios"
            element={<Armarios />}
          />

          <Route
            path="funcionarios"
            element={<Funcionarios />}
          />
          <Route
  path="lista-espera"
  element={<ListaEspera />}
/>
 <Route
  path="achados-perdidos"
  element={<AchadosPerdidos />}
/>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;