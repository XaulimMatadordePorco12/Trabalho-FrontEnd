import { useState, useEffect } from 'react';
// 1. CORREÇÃO: Importar 'axios' diretamente em vez de um 'api' customizado
import axios from 'axios';
// 2. CORREÇÃO: O import do CSS foi removido para evitar erros de build.
// Os estilos serão injetados diretamente (veja abaixo).
import './DashboardAdmin.css';

// Interfaces para os dados que esperamos do backend
interface RankingItem {
  _id: string; // ID do livro
  titulo: string;
  totalVendido: number;
}

interface Estatisticas {
  carrinhosAtivos: number;
  valorTotalGeral: number;
  rankingItens: RankingItem[];
}

// 2. CORREÇÃO: Componente de estilos para injetar o CSS
// Isso corrige o erro "Could not resolve ./DashboardAdmin.css"



// Componente da Página/Área de Administração
export default function DashboardAdmin() {
  // Estado para armazenar os dados do backend
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect para buscar os dados da API
  useEffect(() => {
    async function fetchEstatisticas() {
      try {
        setLoading(true);
        setError(null);

        // --- INÍCIO DA CORREÇÃO 1 (axios e Token) ---
        // Isso corrige o erro "Could not resolve ../api/api"

        // 1. Buscar o token (JWT) salvo no localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Você não está autenticado. Faça o login.");
          setLoading(false);
          return;
        }

        // 2. (Verificação de segurança no Frontend)
        // Checa se o usuário logado é 'admin' antes de tentar a chamada
       const tipoUsuario = localStorage.getItem('tipo');
        
        // Se 'tipo' não existir
        if (!tipoUsuario) {
            setError("Dados de tipo de usuário não encontrados. Faça login novamente.");
            setLoading(false);
            return;
        }
        
        // Comparamos a string 'tipoUsuario' diretamente, sem JSON.parse
        if (tipoUsuario !== 'admin') {
            setError("Acesso negado. Você precisa ser um administrador.");
            setLoading(false);
            return;
        }

        // 3. Configurar os headers para enviar o token
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        // 4. Fazer a chamada com axios, a URL completa e os headers
        // (Presumindo que seu backend roda na porta 8000)
        const response = await axios.get(
          'http://localhost:8000/admin/dashboard/estatisticas', 
          config
        );
        // --- FIM DA CORREÇÃO 1 ---

        setEstatisticas(response.data);

      } catch (err: any) {
        console.error("Erro ao buscar estatísticas:", err);
        
        // --- INÍCIO DA MUDANÇA ---
        // Melhora a forma de reportar erros
        let errorMessage = "Erro ao carregar os dados do dashboard."; // Mensagem Padrão

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 403) {
            errorMessage = "Acesso negado. Você precisa ser um administrador.";
          } else if (err.response?.status === 401) {
            errorMessage = "Você não está autenticado. Faça o login.";
          } else if (err.message) {
            errorMessage = `Erro de rede: ${err.message}`;
          }
        } else if (err instanceof Error) {
            // Captura outros erros de JavaScript
            errorMessage = `Erro inesperado: ${err.message}`;
        }
        
        setError(errorMessage);
        // --- FIM DA MUDANÇA ---

      } finally {
        setLoading(false);
      }
    }

    fetchEstatisticas();
  }, []); 

  // Renderização
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
          {/* Formata o valor para Reais (R$) */}
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
                <span className="rank-titulo">{item.titulo || 'Item sem título'}</span>
                <span className="rank-qtd">{item.totalVendido} unidades</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}