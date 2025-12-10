import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./Pagamento.css";

// Interface atualizada para receber a capaUrl do backend
interface ItemCarrinho {
  produtoId: string;
  nome: string;
  titulo?: string;
  precoUnitario: number;
  quantidade: number;
  capaUrl?: string; 
}

export default function Pagamento() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  // Estados da Tela
  const [loadingPay, setLoadingPay] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro">("sucesso");
  
  // Estados do Dados
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingDados, setLoadingDados] = useState(true);

  // Estilo interno dos inputs do Stripe para combinar com a fonte do site
  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#2d3748',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        '::placeholder': {
          color: '#a0aec0',
        },
      },
      invalid: {
        color: '#e53e3e',
      },
    },
  };

  useEffect(() => {
    const fetchCarrinho = async () => {
      try {
        const usuarioStorage = localStorage.getItem('usuario');
        if (!usuarioStorage) return;
        const usuarioId = JSON.parse(usuarioStorage)._id;

        const response = await api.get(`/carrinho/${usuarioId}`);
        setItens(response.data.itens || []);
        setTotal(response.data.total || 0);

      } catch (error: any) {
        // Se for 404, apenas significa carrinho vazio, não é erro crítico
        if (error.response?.status === 404) {
             setItens([]);
             setTotal(0);
        } else {
             console.error("Erro ao buscar resumo", error);
             setMensagem("Não foi possível carregar o resumo do pedido.");
             setTipoMensagem("erro");
        }
      } finally {
        setLoadingDados(false);
      }
    };

    fetchCarrinho();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoadingPay(true);
    setMensagem("");

    try {
      // 1. Criar Intent no Backend
      const { data } = await api.post("/criar-pagamento-cartao");
      const { clientSecret } = data;

      // 2. Confirmar no Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
          billing_details: {
            name: localStorage.getItem('email') || 'Cliente', 
          },
        },
      });

      if (result.error) {
        setMensagem(result.error.message || "Erro desconhecido no pagamento");
        setTipoMensagem("erro");
      } else if (result.paymentIntent?.status === "succeeded") {
        setMensagem("Pagamento aprovado!");
        setTipoMensagem("sucesso");
        
        // Limpar carrinho
        const usuarioId = JSON.parse(localStorage.getItem('usuario') || '{}')._id;
        if(usuarioId) {
            await api.delete(`/carrinho/${usuarioId}`); 
        }

        alert("Compra realizada com sucesso! Você será redirecionado.");
        navigate("/"); 
      }
    } catch (error: any) {
      console.error(error);
      setMensagem(error.response?.data?.mensagem || "Erro ao processar pagamento.");
      setTipoMensagem("erro");
    }
    setLoadingPay(false);
  };

  if (loadingDados) {
    return <div className="pagamento-loading">Carregando detalhes do pedido...</div>;
  }

  return (
    <div className="pagamento-page fade-in">
        <h1 className="page-title">Finalizar Pagamento</h1>
        
        <div className="pagamento-layout">
            
            {/* --- SEÇÃO DA ESQUERDA: RESUMO --- */}
            <div className="pagamento-card resumo-card">
                <div className="card-header">
                    <h2>Resumo do Pedido</h2>
                </div>
                
                <div className="card-body">
                    {itens.length === 0 ? (
                        <p className="carrinho-vazio-msg">Seu carrinho está vazio.</p>
                    ) : (
                        <ul className="lista-itens">
                            {itens.map((item, index) => (
                                <li key={index} className="item-resumo">
                                    <div className="item-img-wrapper">
                                        {item.capaUrl ? (
                                            <img src={item.capaUrl} alt={item.nome} />
                                        ) : (
                                            <div className="placeholder-img">Sem Foto</div>
                                        )}
                                    </div>
                                    <div className="item-detalhes">
                                        <h3>{item.titulo || item.nome}</h3>
                                        <div className="item-valores">
                                            <span className="qtd-preco">{item.quantidade}x R$ {item.precoUnitario.toFixed(2)}</span>
                                            <span className="subtotal">R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="card-footer">
                    <div className="total-row">
                        <span>Total a Pagar</span>
                        <span className="valor-total">R$ {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* --- SEÇÃO DA DIREITA: FORMULÁRIO --- */}
            <div className="pagamento-card form-card">
                <div className="card-header">
                    <h2>Dados do Cartão</h2>
                </div>
                
                <div className="card-body">
                    <form onSubmit={handleSubmit} id="payment-form">
                        <div className="form-group">
                            <label>Número do Cartão</label>
                            <div className="stripe-input-container">
                                <CardNumberElement options={cardStyle} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Validade</label>
                                <div className="stripe-input-container">
                                    <CardExpiryElement options={cardStyle} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>CVC</label>
                                <div className="stripe-input-container">
                                    <CardCvcElement options={cardStyle} />
                                </div>
                            </div>
                        </div>

                        {mensagem && (
                            <div className={`mensagem-alerta ${tipoMensagem}`}>
                                {mensagem}
                            </div>
                        )}

                        <div className="botoes-acao">
                            {/* Botão de Cancelar */}
                            <button 
                                type="button" 
                                className="btn-cancelar"
                                onClick={() => navigate("/carrinho")} // Volta para o carrinho
                                disabled={loadingPay} // Desabilita se estiver pagando
                            >
                                Cancelar
                            </button>

                            {/* Botão de Pagar */}
                            <button 
                                type="submit" 
                                className="btn-pagar"
                                disabled={!stripe || loadingPay || total <= 0}
                            >
                                {loadingPay ? "Processando..." : `Pagar R$ ${total.toFixed(2)}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    </div>
  );
}