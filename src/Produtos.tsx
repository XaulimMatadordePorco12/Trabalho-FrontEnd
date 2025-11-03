import axios from "axios";
import { useEffect, useState } from "react";

interface Produto {
  _id: string;
  nome: string;
  preco: number;
  urlfoto: string;
  descricao: string;
}

function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    axios.get("http://localhost:8000/produtos")
      .then(res => setProdutos(res.data))
      .catch(err => console.error("Erro ao buscar produtos:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Produtos disponíveis</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {produtos.map(p => (
          <div key={p._id} style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            width: "200px",
            textAlign: "center"
          }}>
            <img src={p.urlfoto} alt={p.nome} width="150" height="150" />
            <h3>{p.nome}</h3>
            <p>{p.descricao}</p>
            <strong>R$ {p.preco.toFixed(2)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Produtos;

