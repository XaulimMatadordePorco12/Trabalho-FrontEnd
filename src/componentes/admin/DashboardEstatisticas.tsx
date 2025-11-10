// src/pages/admin/DashboardEstatisticas.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardEstatisticas.css'; // O CSS já é importado pelo Layout, mas pode manter

// ... (Suas interfaces RankingItem e Estatisticas aqui) ...
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

  // ... (Seu useEffect e fetchEstatisticas EXATAMENTE como estava) ...
  useEffect(() => {
    async function fetchEstatisticas() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) { /* ... (etc) */
          setError('Você não está autenticado. Faça o login.');
          setLoading(false);
          return;
        }
        const tipoUsuario = localStorage.getItem('tipo');
        if (tipoUsuario !== 'admin') { /* ... (etc) */
          setError('Acesso negado. Você precisa ser um administrador.');
          setLoading(false);
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          'http://localhost:8000/admin/estatisticas',
          config
        );
        setEstatisticas(response.data);
      } catch (err: any) {
        console.error('Erro ao buscar estatísticas:', err);
        let errorMessage = 'Erro ao carregar os dados do dashboard.';
        if (err?.response?.status === 403) {
          errorMessage = 'Acesso negado. Você precisa ser um administrador.';
        } else if (err?.response?.status === 401) {
          errorMessage = 'Você não está autenticado. Faça o login.';
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


  // O 'return' agora é SÓ o conteúdo
  if (loading) {
    return <div className="dashboard-container"><p>Carregando estatísticas...</p></div>;
  }

  if (error) {
    return <div className="dashboard-container error-box"><p>{error}</p></div>;
  }

  if (!estatisticas) {
    return <div className="dashboard-container"><p>Nenhum dado encontrado.</p></div>;
  }

  // Renderização principal com os dados
  return (
    <div className="dashboard-container">
      <h1>Estatísticas dos Carrinhos</h1>
      {/* ... (Toda a sua <section> de cards e ranking aqui) ... */}
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
}