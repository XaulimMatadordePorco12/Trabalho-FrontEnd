import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import api from "../../api/api"; // Sua api
// import "./Carrinho.css"; // Reaproveitando estilos se necessário

export const Return = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      // Chama a nova rota do backend que criamos no passo 1
      api.get(`/pagamento/session-status?session_id=${sessionId}`)
        .then((res) => {
          setStatus(res.data.status);
          setCustomerEmail(res.data.customer_email);
        })
        .catch((err) => {
            console.error("Erro ao verificar status", err);
        })
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, []);

  if (loading) {
      return <div className="carrinho-container"><p>Verificando pagamento...</p></div>;
  }

  if (status === 'open') {
    // Se o pagamento ainda está aberto, volta para o checkout
    return <Navigate to="/pagamento" />;
  }

  if (status === 'complete') {
    return (
      <div className="carrinho-container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <section id="success">
          <h1 style={{ color: '#28a745' }}>Pagamento Concluído! 🎉</h1>
          <p style={{ fontSize: '18px', margin: '20px 0' }}>
            Agradecemos sua compra{customerEmail ? `, um email de confirmação será enviado para ${customerEmail}` : ''}.
          </p>
          
          <Link to="/">
            <button className="finalizar">Voltar para a Loja</button>
          </Link>
        </section>
      </div>
    )
  }

  return <Navigate to="/" />;
}