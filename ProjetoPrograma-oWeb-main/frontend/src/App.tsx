import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login/Login'
import Hub from './pages/Hub/Hub'
import Produtos from './pages/Produtos/Produtos'
import VerDetalhes from './pages/VerDetalhes/VerDetalhes'
import Chat from './pages/Chat/Chat'
import Agenda from './pages/Agenda/Agenda'
import PIX from './pages/PIX/PIX'
import Pagamento from './pages/Pagamento/Pagamento'
import PagamentoRealizado from './pages/PagamentoRealizado/PagamentoRealizado'
import CadastroServico from './pages/CadastroServico/CadastroServico'
import Perfil from './pages/Perfil/Perfil'
import Admin from './pages/Admin/Admin'
import Profissionais from './pages/Profissionais/Profissionais'
import MeusPedidos from './pages/MeusPedidos/MeusPedidos'
import Configuracoes from './pages/Configuracoes/Configuracoes'
import SobreConectServ from './pages/SobreConectServ/SobreConectServ'
import AjudaSuporte from './pages/AjudaSuporte/AjudaSuporte'
import TornarSePrestador from './pages/TornarSePrestador/TornarSePrestador'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/meus-pedidos" element={<MeusPedidos />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/sobre" element={<SobreConectServ />} />
        <Route path="/ajuda" element={<AjudaSuporte />} />
        <Route path="/quem-somos" element={<Navigate to="/sobre" replace />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/explorar" element={<Produtos />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produtos/:id" element={<VerDetalhes />} />
        <Route path="/profissionais" element={<Profissionais />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/agenda/:serviceId" element={<Agenda />} />
        <Route path="/pix" element={<PIX />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/pagamento-realizado" element={<PagamentoRealizado />} />
        <Route path="/cadastrar-servico" element={<CadastroServico />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/tornar-se-prestador" element={<TornarSePrestador />} />
      </Routes>
    </AuthProvider>
  )
}
