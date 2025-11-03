import './App.css'
import api from './api/api'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './componentes/login/login'
import Logout from './componentes/login/logout'
import Carrinho from './componentes/carrinho/Carrinho'
import Erro from './componentes/erro/erro'
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
  const tipoUsuario = localStorage.getItem('tipo')
  const email = localStorage.getItem('email')

  useEffect(() => {
    api.get("/livros")
      .then((response) => setLivros(response.data))
      .catch((error) => console.error('Error fetching data:', error))
  }, [])

  function handleForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)



    const data = {
      titulo: formData.get('titulo') as string,
      autor: formData.get('autor') as string,
      genero: formData.get('genero') as string,
      preco: parseFloat(formData.get('preco') as string || '0'),
      capaUrl: formData.get('capaUrl') as string,
      descricao: formData.get('descricao') as string,
      destaque: formData.has('destaque')
    }


    api.post("/livros", data)
      .then((response) => setLivros([...Livros, response.data]))
      .catch((error) => {
        console.error('Erro ao adicionar livro:', error)
        const msg = error?.response?.data?.error || error.message
        alert('Erro ao adicionar livro: ' + msg)
      })

    form.reset()
  }

  function adicionarCarrinho(LivroId: string) {
    api.post('/adicionarItem', { LivroId, quantidade: 1 })
      .then(() => alert("Livro adicionado no carrinho!"))
      .catch((error) => {
        console.error('Error posting data:', error)
        alert('Error posting data:' + error?.mensagem)
      })
  }

  return (
    <div>
      <nav className="navbar">
        <span>Bem-vindo, {email}</span>
        <div>
          <Link to="/carrinho">Carrinho</Link>
          <Link to="/logout">Sair</Link>
        </div>
      </nav>

      {tipoUsuario === 'admin' && (
        <>
          <div>Cadastro de Livros</div>
          <form onSubmit={handleForm}>
            <input type="text" name="nome" placeholder="Nome" />
            <input type="number" name="preco" placeholder="Preço" />
            <input type="text" name="urlfoto" placeholder="URL da Foto" />
            <input type="text" name="descricao" placeholder="Descrição" />
            <button type="submit">Cadastrar</button>
          </form>
        </>
      )}

      <div>Lista de Livros</div>
      <div className="Livros-grid">

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