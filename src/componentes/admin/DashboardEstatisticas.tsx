import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './DashboardEstatisticas.css';

interface RankingItem {
  _id: string;
  titulo: string;
  totalVendido: number;
}

interface Estatisticas {
  carrinhosAtivos: number;
  valorTotalGeral: number;
  rankingItens: RankingItem[];
}

export default function DashboardEstatisticas() {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const email = localStorage.getItem('email');

  useEffect(() => {
    async function fetchEstatisticas() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Você não está autenticado. Faça o login.');
          setLoading(false);
          return;
        }

        const tipoUsuario = localStorage.getItem('tipo');
        if (tipoUsuario !== 'admin') {
          setError('Acesso negado. Você precisa ser um administrador.');
          setLoading(false);
          return;
        }

        const config = { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        };

        console.log('🔍 Buscando estatísticas...');
        const response = await axios.get(
          'http://localhost:8000/admin/estatisticas',
          config
        );
        
        console.log('📊 Dados recebidos:', response.data);
        setEstatisticas(response.data);
        
      } catch (err: any) {
        console.error('❌ Erro ao buscar estatísticas:', err);
        let errorMessage = 'Erro ao carregar os dados do dashboard.';
        
        if (err?.response?.status === 403) {
          errorMessage = 'Acesso negado. Você precisa ser um administrador.';
        } else if (err?.response?.status === 401) {
          errorMessage = 'Você não está autenticado. Faça o login.';
        } else if (err?.response?.status === 404) {
          errorMessage = 'Endpoint de estatísticas não encontrado.';
        } else if (err?.response?.status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente.';
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEstatisticas();
  }, []);

  if (loading) {
    return (
      <div>
        <nav className="navbar">
          <span>Bem-vindo, {email}</span>
          <div className="navbar-links">
            <Link to="/">Voltar para Loja</Link>
            <Link to="/admin/gerenciar-livros">📚 Cadastrar</Link> {/* 🔥 NOVO LINK */}
            <Link to="/logout">Sair</Link>
          </div>
        </nav>
        <div className="dashboard-container">
          <div className="loading-spinner">Carregando estatísticas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <nav className="navbar">
          <span>Bem-vindo, {email}</span>
          <div className="navbar-links">
            <Link to="/">Voltar para Loja</Link>
            <Link to="/admin/gerenciar-livros">📚 Cadastrar</Link> {/* 🔥 NOVO LINK */}
            <Link to="/logout">Sair</Link>
          </div>
        </nav>
        <div className="dashboard-container">
          <div className="error-box">
            <h3>❌ Erro</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!estatisticas) {
    return (
      <div>
        <nav className="navbar">
          <span>Bem-vindo, {email}</span>
          <div className="navbar-links">
            <Link to="/">Voltar para Loja</Link>
            <Link to="/admin/gerenciar-livros">Cadastrar</Link>
            <Link to="/logout">Sair</Link>
          </div>
        </nav>
        <div className="dashboard-container">
          <div className="error-box">
            <p>Nenhum dado encontrado.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cabeçalho no mesmo padrão das outras páginas */}
      <nav className="navbar">
        <span>Bem-vindo, {email}</span>
        <div className="navbar-links">
          <Link to="/">Voltar para Loja</Link>
          <Link to="/admin/gerenciar-livros">Cadastrar</Link>
          <Link to="/logout">Sair</Link>
        </div>
      </nav>

      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>📊 Dashboard Administrativo</h1>
          <p>Estatísticas em tempo real dos carrinhos de compra</p>
        </header>

        <section className="dashboard-cards">
          <div className="card estatistica-card">
            <div className="card-icon">🛒</div>
            <div className="card-content">
              <h3>Carrinhos Ativos</h3>
              <p className="card-value">{estatisticas.carrinhosAtivos}</p>
              <span className="card-description">
                Usuários com itens no carrinho
              </span>
            </div>
          </div>

          <div className="card estatistica-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Valor Total em Carrinhos</h3>
              <p className="card-value">
                {estatisticas.valorTotalGeral.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
              <span className="card-description">
                Soma de todos os produtos
              </span>
            </div>
          </div>

          <div className="card estatistica-card">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>Itens no Ranking</h3>
              <p className="card-value">{estatisticas.rankingItens.length}</p>
              <span className="card-description">
                Produtos mais populares
              </span>
            </div>
          </div>
        </section>

        <section className="dashboard-ranking">
          <div className="ranking-header">
            <h2>🏆 Ranking de Itens nos Carrinhos</h2>
            <span className="ranking-subtitle">Top 10 produtos mais adicionados</span>
          </div>
          
          {estatisticas.rankingItens.length === 0 ? (
            <div className="empty-ranking">
              <p>📭 Nenhum item encontrado nos carrinhos no momento.</p>
            </div>
          ) : (
            <div className="ranking-list">
              {estatisticas.rankingItens.map((item, index) => (
                <div key={item._id} className="ranking-item">
                  <div className="rank-position">
                    <span className={`rank-badge ${index < 3 ? 'top-three' : ''}`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="rank-info">
                    <span className="rank-title">
                      {item.titulo || 'Item sem título'}
                    </span>
                    <span className="rank-quantity">
                      {item.totalVendido} {item.totalVendido === 1 ? 'unidade' : 'unidades'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="dashboard-footer">
          <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
}