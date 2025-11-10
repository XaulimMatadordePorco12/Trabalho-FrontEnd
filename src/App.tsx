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
  const email = localStorage.getItem('email')

  // 1. useEffect: Apenas carrega os livros (Listagem)
  useEffect(() => {
    api.get("/livros")
      .then((response) => setLivros(response.data))
      .catch((error) => console.error('Error fetching data:', error))
  }, [])


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
      {/* Navbar mantida */}
      <nav className="navbar">
        <span>Bem-vindo, {email}</span>
        <div>
          <Link to="/carrinho">Carrinho</Link>
          <Link to="/logout">Sair</Link>
        </div>
      </nav>

      <div>Lista de Livros</div>
      <div className="Livros-grid">

        {/* Lógica de Listagem mantida */}
        {Livros.map((livro) => (
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
            {/* 1. O Layout principal (AdminLayout) que contém a Sidebar e o <Outlet /> */}
            <AdminLayout /> 
          </ProtectedRoute>
        }>
            {/* 2. Rota Index: Conteúdo que aparece em http://localhost:5173/admin */}
            <Route index element={<DashboardEstatisticas />} /> 

            {/* 3. Nova Rota: Conteúdo que aparece em http://localhost:5173/admin/gerenciar-livros */}
            <Route path="gerenciar-livros" element={<GerenciarLivrosPage />} /> 
        </Route>
        <Route path="/carrinho" element={
          <ProtectedRoute>
            <Carrinho />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <LivrosPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App