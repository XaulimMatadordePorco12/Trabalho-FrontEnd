import { useState, useEffect } from "react";
import "./Carrinho.css";

interface ItemCarrinho {
  id: string;
  titulo: string;
  precoUnitario: number;
  quantidade: number;
  capaUrl: string;
}

export default function Carrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const carrinhoFake: ItemCarrinho[] = [
      {
        id: "1",
        titulo: "O Senhor dos Anéis: A Sociedade do Anel",
        precoUnitario: 59.9,
        quantidade: 1,
        capaUrl: "https://exemplo.com/imagens/sociedade-do-anel.jpg"
      },
      {
        id: "2",
        titulo: "1984",
        precoUnitario: 42.5,
        quantidade: 2,
        capaUrl: "https://exemplo.com/imagens/1984.jpg"
      }
    ];
    setItens(carrinhoFake);
  }, []);

  useEffect(() => {
    const novoTotal = itens.reduce(
      (acc, item) => acc + item.precoUnitario * item.quantidade,
      0
    );
    setTotal(novoTotal);
  }, [itens]);

  function removerItem(id: string) {
    setItens(itens.filter((item) => item.id !== id));
  }

  function alterarQuantidade(id: string, novaQtd: number) {
    setItens((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantidade: Math.max(1, novaQtd) } : item
      )
    );
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
                  Remover
                </button>
              </div>
            </div>
          ))}

          <div className="total">
            <h3>Total: R$ {total.toFixed(2)}</h3>
            <button className="finalizar">Finalizar Compra</button>
          </div>
        </>
      )}
    </div>
  );
}
