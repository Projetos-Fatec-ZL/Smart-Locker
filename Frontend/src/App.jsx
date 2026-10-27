import { BrowserRouter, Routes, Route } from "react-router-dom";

// IMPORTAÇÃO NOVO COMPONENTE DE LIBRAS
import VLibras from "./components/VLibras/VLibras";

// Páginas públicas
import Login from "./pages/login/Login";
import PrimeiroAcesso from "./pages/PrimeiroAcesso/PrimeiroAcesso";
import EsqueciSenha from "./pages/EsqueciSenha/EsqueciSenha";

// Layout administrativo
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Armarios from "./pages/admin/Armarios/Armarios";
import Funcionarios from "./pages/admin/Funcionarios/Funcionarios";
import ListaEspera from "./pages/admin/ListaEspera/ListaEspera";
import AchadosPerdidos from "./pages/admin/AchadosPerdidos/AchadosPerdidos";
import Chaves from "./pages/admin/Chaves/Chaves";

// Área do funcionário
import FuncionarioLayout from "./layouts/FuncionarioLayout";
import InicioFuncionario from "./pages/funcionario/Inicio/Inicio";
import MeuArmario from "./pages/funcionario/MeuArmario/MeuArmario";
import ListaEsperaFuncionario from "./pages/funcionario/ListaEspera/ListaEspera";
import AchadosPerdidosFuncionario from "./pages/funcionario/AchadosPerdidos/AchadosPerdidos";

function App() {
  return (
    <BrowserRouter>
      <VLibras />

      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Login />} />

        <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />

        <Route path="/esqueci-senha" element={<EsqueciSenha />} />

        {/* Área administrativa */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="armarios" element={<Armarios />} />

          <Route path="funcionarios" element={<Funcionarios />} />

          <Route path="lista-espera" element={<ListaEspera />} />

          <Route path="achados-perdidos" element={<AchadosPerdidos />} />

          <Route path="chaves" element={<Chaves />} />
        </Route>
        {/* Área do funcionário */}
        <Route path="/funcionario" element={<FuncionarioLayout />}>
          <Route path="inicio" element={<InicioFuncionario />} />

          <Route path="meu-armario" element={<MeuArmario />} />

          <Route path="lista-espera" element={<ListaEsperaFuncionario />} />
          <Route
            path="achados-perdidos"
            element={<AchadosPerdidosFuncionario />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
