import { useState, useEffect } from "react";
import axios from "axios";
import "./Carrinho.css";

interface ItemCarrinho {
  id: string;
  titulo: string;
  precoUnitario: number;
  quantidade: number;
  capaUrl: string;
}

const API_URL = import.meta.env.VITE_API_URL;

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
    if (!USUARIO_ID) {
      alert("Usuário não logado. Faça o login para ver o carrinho.");
      setItens([]);
      return;
    }

    async function fetchCarrinho() {
      try {
        const response = await axios.get(`${API_URL}/carrinho/${USUARIO_ID}`);
        if (response.data && response.data.itens) {
          setItens(response.data.itens);
        } else if (Array.isArray(response.data)) {
          setItens(response.data);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setItens([]);
        } else {
          console.error("Erro ao buscar carrinho:", error);
          alert("Erro ao buscar seu carrinho.");
        }
      }
    }

    fetchCarrinho();
  }, [USUARIO_ID]);

  function removerItem(id: string) {
    alert(`(TAREFA B1) Implementar remoção do item: ${id}`);
  }

  function alterarQuantidade(id: string, novaQtd: number) {
    alert(`(TAREFA B2) Implementar alteração de qtd: ${id} para ${novaQtd}`);
  }

  async function excluirCarrinhoInteiro() {
    alert(`(TAREFA B3) Implementar exclusão do carrinho do usuário: ${USUARIO_ID}`);
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
