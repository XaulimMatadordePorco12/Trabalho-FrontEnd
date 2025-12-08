import './App.css'
import api from './api/api'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './componentes/login/login'
import Logout from './componentes/login/logout'
import Carrinho from './componentes/carrinho/Carrinho'
import Erro from './componentes/erro/erro'
import AdminLayout from './componentes/admin/AdminLayout';
import DashboardEstatisticas from './componentes/admin/DashboardEstatisticas';
import GerenciarLivrosPage from './componentes/admin/GerenciarLivros';
import {CheckoutForm} from './componentes/pagamento/CheckoutForm';
import {Return} from './componentes/pagamento/Return';

type LivroType = {
  _id: string,
  nome: string,
  preco: number,
  capaUrl: string,
  descricao: string
  titulo: string,
  autor: string,
  genero: string,
  destaque: boolean
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}


function LivrosPage() {
  const [Livros, setLivros] = useState<LivroType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const email = localStorage.getItem('email')
  const tipoUsuario = localStorage.getItem('tipo')

  // 1. useEffect: Apenas carrega os livros (Listagem)
  useEffect(() => {
    api.get("/livros")
      .then((response) => setLivros(response.data))
      .catch((error) => console.error('Error fetching data:', error))
  }, [])


  // 2. Lógica de Filtragem
  const livrosFiltrados = Livros.filter(livro => {
    // Converte o termo de busca e as propriedades do livro para minúsculas
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Filtra se o título OU o gênero inclui o termo de busca
    const tituloMatch = livro.titulo.toLowerCase().includes(lowerCaseSearchTerm);
    const generoMatch = livro.genero.toLowerCase().includes(lowerCaseSearchTerm);

    return tituloMatch || generoMatch;
  });


  // 3. adicionarCarrinho: Mantida (Funcionalidade do Cliente)
  function adicionarCarrinho(LivroId: string) {
    // O backend espera { produtoId, quantidade }
    api.post('/adicionarItem', { LivroId: LivroId, quantidade: 1 })
      .then(() => alert("Livro adicionado no carrinho!"))
      .catch((error) => {
        console.error('Error posting data:', error)
        const msg = error?.response?.data?.mensagem || error?.message || String(error)
        alert('Erro ao adicionar no carrinho: ' + msg)
      })
  }

  return (
    <div>
      {/* Navbar: usa a classe 'navbar' para layout principal */}
      <nav className="navbar">
        <span>Bem-vindo, {email}</span>

        {/* Campo de Busca: usa a classe 'navbar-search' */}
        <input
          type="text"
          placeholder="Buscar por Título ou Gênero..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="navbar-search"
        />

        {/* Container dos links: usa a classe 'navbar-links' */}
        <div className="navbar-links">
          <Link to="/carrinho">Carrinho</Link>
          {/* Adiciona link para Admin se for admin */}
          {tipoUsuario === 'admin' && <Link to="/admin">Admin</Link>}
          <Link to="/logout">Sair</Link>
        </div>
      </nav>

      <div className="page-title">Lista de Livros</div>
      <div className="Livros-grid">

        {/* Mapeia a lista FILTRADA */}
        {livrosFiltrados.map((livro) => (
          <div key={livro._id} className="Livro-card">
            <h2>{livro.titulo}</h2>
            <h3>{livro.autor}</h3>
            <p>R$ {livro.preco}</p>
            <img src={livro.capaUrl} alt={livro.titulo} width="200" />
            <p>{livro.descricao}</p>
            <p>Gênero: {livro.genero}</p>
            {livro.destaque && <p className="Livro-destaque">Em Destaque!</p>}
            <button onClick={() => adicionarCarrinho(livro._id)}>Adicionar ao carrinho</button>
          </div>
        ))}
      </div>
      {/* Mensagem se não houver resultados: usa a classe 'LivrosPage-mensagem-vazio' */}
      {livrosFiltrados.length === 0 && Livros.length > 0 && (
        <p className="LivrosPage-mensagem-vazio">
          Nenhum livro encontrado para o termo "{searchTerm}".
        </p>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/error" element={<Erro />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardEstatisticas />} />
          <Route path="gerenciar-livros" element={<GerenciarLivrosPage />} />
        </Route>
        <Route path="/carrinho" element={
          <ProtectedRoute>
            <Carrinho />
          </ProtectedRoute>
        } />
        <Route path="/pagamento" element={
          <ProtectedRoute>
            <CheckoutForm />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <LivrosPage />
          </ProtectedRoute>
        } />
        <Route path="/pagamento" element={
          <ProtectedRoute>
            <CheckoutForm />
          </ProtectedRoute>
        } />
        <Route path="/return" element={<Return />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App