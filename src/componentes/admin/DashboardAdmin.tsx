import { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardAdmin.css'; // O CSS atualizado está abaixo

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

export default function DashboardAdmin() {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect para buscar os dados da API (sem alterações)
  useEffect(() => {
    async function fetchEstatisticas() {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar o token (JWT) salvo no localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Você não está autenticado. Faça o login.');
          setLoading(false);
          return;
        }

        // 2. (Verificação de segurança no Frontend)
        const tipoUsuario = localStorage.getItem('tipo');
        if (!tipoUsuario) {
          setError(
            'Dados de tipo de usuário não encontrados. Faça login novamente.'
          );
          setLoading(false);
          return;
        }
        if (tipoUsuario !== 'admin') {
          setError('Acesso negado. Você precisa ser um administrador.');
          setLoading(false);
          return;
        }

        // 3. Configurar os headers para enviar o token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // 4. Fazer a chamada com axios
        const response = await axios.get(
          'http://10.10.65.39:8000/admin/estatisticas',
          config
        );

        setEstatisticas(response.data);
      } catch (err: any) {
        console.error('Erro ao buscar estatísticas:', err);
        let errorMessage = 'Erro ao carregar os dados do dashboard.';
        if (err && err.response) {
          if (err.response.status === 403) {
            errorMessage = 'Acesso negado. Você precisa ser um administrador.';
          } else if (err.response.status === 401) {
            errorMessage = 'Você não está autenticado. Faça o login.';
          }
        } else if (err && err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchEstatisticas();
  }, []);

  // --- MUDANÇA ---
  // Criamos uma função separada para renderizar o conteúdo principal
  // Isso limpa o layout principal e nos permite mostrar a sidebar
  // mesmo durante o loading ou em caso de erro.
  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="dashboard-container">
          <p>Carregando estatísticas...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="dashboard-container error-box">
          <p>{error}</p>
        </div>
      );
    }

    if (!estatisticas) {
      return (
        <div className="dashboard-container">
          <p>Nenhum dado encontrado.</p>
        </div>
      );
    }

    // Renderização principal com os dados
    return (
      <div className="dashboard-container">
        <h1>Dashboard do Administrador</h1>

        {/* Seção com os cards de dados gerais (C2) */}
        <section className="dashboard-cards">
          <div className="card">
            <h3>Carrinhos Ativos</h3>
            <p>{estatisticas.carrinhosAtivos}</p>
            <span>Usuários com pelo menos um item no carrinho.</span>
          </div>
          <div className="card">
            <h3>Valor Total em Carrinhos</h3>
            <p>
              {estatisticas.valorTotalGeral.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
            <span>Soma de todos os produtos em todos os carrinhos.</span>
          </div>
        </section>

        {/* Seção com o Ranking de Itens (C2) */}
        <section className="dashboard-ranking">
          <h2>Ranking de Itens nos Carrinhos (Top 10)</h2>
          {estatisticas.rankingItens.length === 0 ? (
            <p>Nenhum item encontrado nos carrinhos.</p>
          ) : (
            <ol>
              {estatisticas.rankingItens.map((item, index) => (
                <li key={item._id}>
                  <span className="rank-pos">{index + 1}.</span>
                  <span className="rank-titulo">
                    {item.titulo || 'Item sem título'}
                  </span>
                  <span className="rank-qtd">{item.totalVendido} unidades</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    );
  };

  // --- MUDANÇA PRINCIPAL ---
  // O 'return' agora foca no LAYOUT da página (Sidebar + Conteúdo)
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
              {/* Link está "ativo" por ser a única opção */}
              <a href="#" className="active" onClick={(e) => e.preventDefault()}>
                Estatísticas de Carrinho
              </a>
            </li>
            {/* Você pode adicionar mais <li> aqui no futuro */}
          </ul>
        </nav>
      </aside>

      {/* 2. A Área de Conteúdo Principal */}
      <main className="main-content-area">
        {/* Chamamos a função que renderiza o conteúdo */}
        {renderDashboardContent()}
      </main>
    </div>
  );
}