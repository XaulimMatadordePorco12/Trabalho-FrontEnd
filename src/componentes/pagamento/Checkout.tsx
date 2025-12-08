import { useCallback } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import api from "../../api/api"; // Certifique-se que o caminho está correto
import { Navigate } from "react-router-dom"; // Necessário se você usa Navigate

// Chave pública de teste do Stripe
const stripePromise = loadStripe("pk_test_51SXjkNHa7pIQBocuzN8V37uF5GVvMMDdvvM2wrYF2CWH8IvFcbPHQimY9kddMFOVT2Wpz2KW6ve9DzdJQx2NUoYU00OfQVQ2ba");

// O nome do componente pode ser Pagamento, Checkout, ou CheckoutForm
export default function CheckoutForm() {
  
  // FUNÇÃO CORRIGIDA que busca o Client Secret no seu backend
  const fetchClientSecret = useCallback(async () => {
    // 1. Pega o token de autenticação
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        // Lança erro para impedir que o Stripe tente carregar sem o secret
        throw new Error("Usuário não logado. Redirecionando."); 
    }

    try {
        // 2. Chama a NOVA rota do seu backend com o token
        const response = await api.post(
            "/pagamento/checkout-session", // ROTA CORRETA
            {}, 
            {
                headers: { Authorization: `Bearer ${token}` } // TOKEN OBRIGATÓRIO
            }
        );
        
        // 3. Retorna o clientSecret
        return response.data.clientSecret;

    } catch (error) {
        // Isso é o que estava em torno da linha 84, agora com o erro correto
        console.error("Erro ao iniciar o pagamento:", error);
        alert("Erro ao preparar o pagamento. Verifique se seu carrinho está vazio.");
        throw error;
    }
  }, []);

  const options = { fetchClientSecret };

  // Verifica login básico antes de renderizar
  if (!localStorage.getItem('token')) {
      return <Navigate to="/login" />;
  }

  return (
    <div id="checkout" style={{ padding: "20px" }}>
      <h2>Finalizar Compra</h2>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        {/* Este componente renderiza o formulário do Stripe */}
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}