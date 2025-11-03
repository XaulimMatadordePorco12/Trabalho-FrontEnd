import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import { BrowserRouter , Routes , Route} from 'react-router-dom'
// import Login from './componentes/login/login.tsx'
// import Erro from './componentes/erro/erro.tsx'
// import Carrinho from './componentes/carrinho/Carrinho.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)
