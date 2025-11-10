import { useState, useEffect } from "react";
import api from "../../api/api";
import "./Carrinho.css";

interface ItemCarrinho {
  id: string; // corresponde a produtoId no backend
  titulo: string;
  precoUnitario: number;
  quantidade: number;
  capaUrl?: string;
}


function getUsuarioIdDoStorage(): string | null {
  const usuarioStorage = localStorage.getItem('usuario');
  if (usuarioStorage) {
    try {
      const usuario = JSON.parse(usuarioStorage);
      return usuario._id;
    } catch (e) {
      console.error("Erro ao parsear usuário do localStorage", e);
      return null;
    }
  }
  return null;
}

export default function Carrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const novoTotal = itens.reduce(
      (acc, item) => acc + (item.precoUnitario * item.quantidade),
      0
    );
    setTotal(novoTotal);
  }, [itens]);

  const USUARIO_ID = getUsuarioIdDoStorage();

  useEffect(() => {
    const Token = localStorage.getItem('token');
    if (!Token) {
      alert("Usuário não logado. Faça o login para ver o carrinho.");
      setItens([]);
      return;
    }

    async function fetchCarrinho() {
      try {
        const response = await api.get(`/carrinho/${USUARIO_ID}`);
        // Transformar itens do backend para o formato esperado no frontend
        const raw = response.data;
        let itensBackend: any[] = [];
        if (raw && raw.itens) itensBackend = raw.itens;
        else if (Array.isArray(raw)) itensBackend = raw;

        const mapped = itensBackend.map((it) => ({
          id: it.produtoId || it.id || it._id,
          titulo: it.nome || it.titulo || it.nomeProduto || '',
          precoUnitario: it.precoUnitario || it.preco || 0,
          quantidade: it.quantidade || it.qtd || 0,
          capaUrl: it.capaUrl || it.urlfoto || '',
        }));
        setItens(mapped);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 404) {
          setItens([]);
        } else {
          console.error("Erro ao buscar carrinho:", error);
          alert("Erro ao buscar seu carrinho.");
        }
      }
    }

    fetchCarrinho();
  }, [USUARIO_ID]);

  async function removerItem(id: string) {
    if (!USUARIO_ID) {
      alert('Usuário não logado. Faça o login para remover itens.');
      return;
    }

    // snapshot para rollback
    const prev = itens;

    // atualização otimista: remove do estado imediatamente
    setItens((cur) => cur.filter((it) => it.id !== id));

    try {
      // Usar o endpoint backend existente: POST /removerItem com { produtoId }
      await api.post('/removerItem', { produtoId: id });
    } catch (error) {
      // rollback em caso de falha
      setItens(prev);
      console.error('Erro ao remover item do carrinho:', error);
      alert('Não foi possível remover o item do carrinho. Tente novamente.');
    }
  }

  async function alterarQuantidade(id: string, novaQtd: number) {
    if (!USUARIO_ID) {
      alert('Usuário não logado. Faça o login para alterar o carrinho.');
      return;
    }

    // normalizar quantidade para inteiro não-negativo
    const novaQtdSanitizada = Math.max(0, Math.floor(novaQtd));

    // pegar snapshot para rollback em caso de erro
    const prevItens = itens;

    // atualização otimista do estado: apenas atualiza a quantidade (não remove)
    setItens((prev) => {
      const existe = prev.some((it) => it.id === id);
      if (!existe) return prev;
      return prev.map((it) => (it.id === id ? { ...it, quantidade: novaQtdSanitizada } : it));
    });

    try {
      // endpoint assumido: PATCH /carrinho/:usuarioId/item/:itemId com { quantidade }
      await api.patch(`/carrinho/${USUARIO_ID}/item/${id}`, {
        quantidade: novaQtdSanitizada,
      });
    } catch (error) {
      // rollback em caso de falha
      setItens(prevItens);
      console.error('Erro ao alterar quantidade do carrinho:', error);
      alert('Não foi possível atualizar a quantidade do item. Tente novamente.');
    }
  }

  async function excluirCarrinhoInteiro() {
    if (!USUARIO_ID) {
      alert('Usuário não logado.');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir TODO o carrinho?')) return;

    try {
      await api.delete(`/carrinho/${USUARIO_ID}`);
      setItens([]);
      alert('Carrinho excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir carrinho:', error);
      alert('Não foi possível excluir o carrinho. Tente novamente.');
    }
  }

  return (
    <div className="carrinho-container">
      <h1>🛒 Meu Carrinho</h1>

      {itens.length === 0 ? (
        <p className="vazio">Seu carrinho está vazio.</p>
      ) : (
        <>
          {itens.map((item) => (
            <div key={item.id} className="item-carrinho">
              <img src={item.capaUrl} alt={item.titulo} />
              <div className="info">
                <h2>{item.titulo}</h2>
                <p>R$ {item.precoUnitario.toFixed(2)}</p>
                <div className="quantidade">
                  <button onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}>-</button>
                  <span>{item.quantidade}</span>
                  <button onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}>+</button>
                </div>
                <button className="remover" onClick={() => removerItem(item.id)}>
                  Remover (B1)
                </button>
              </div>
            </div>
          ))}

          <div className="total">
            <h3>Total: R$ {total.toFixed(2)}</h3>
            <button className="finalizar">Finalizar Compra</button>
            <button 
              onClick={excluirCarrinhoInteiro}
              style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}
            >
              Excluir Carrinho (B3)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
