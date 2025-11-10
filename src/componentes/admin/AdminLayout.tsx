// src/components/admin/AdminLayout.tsx (Exemplo de caminho)
import { Outlet, NavLink } from 'react-router-dom';
import './DashboardEstatisticas.css'; // Importe o CSS aqui

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* 1. A Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              {/* Usamos NavLink. Ele automaticamente adiciona a classe 'active' 
                quando a URL bate. 'end' garante que ele só fica ativo no /admin exato.
              */}
              <NavLink to="/admin" end>
                Estatísticas de Carrinho
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/gerenciar-livros">
                Cadastrar Livro
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>


      <main className="main-content-area">
   
        <Outlet />
      </main>
    </div>
  );
}