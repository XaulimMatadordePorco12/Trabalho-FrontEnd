import { useState, useEffect, type FormEvent } from "react"; // IMPORT QUE FALTAVA
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement
} from "@stripe/react-stripe-js";
import api from "../../api/api"; // Ajuste o caminho conforme sua estrutura
import "./Checkout.css"; // Certifique-se de ter o CSS

// Inicializa o Stripe fora dos componentes para evitar recriação
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || "pk_test_51SXjkNHa7pIQBocuzN8V37uF5GVvMMDdvvM2wrYF2CWH8IvFcbPHQimY9kddMFOVT2Wpz2KW6ve9DzdJQx2NUoYU00OfQVQ2ba");

// Componente interno que contém o formulário e o botão de pagar
const CheckoutInner = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redireciona para sua rota de sucesso após o pagamento
        return_url: `${window.location.origin}/return`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "Erro no pagamento.");
    } else {
      setMessage("Ocorreu um erro inesperado.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner">Processando...</div> : "Pagar Agora"}
        </span>
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
};

// Componente Principal exportado
export const CheckoutForm = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // 1. Recupera o token salvo no login
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Você precisa estar logado.");
        return;
    }

    // 2. Envia o token no header para o backend identificar o usuário e o carrinho
    api.post('/pagamento/cartao', {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
      .then((res) => {
          setClientSecret(res.data.clientSecret);
      })
      .catch((err) => {
        console.error('Erro ao criar pagamento', err);
        // Se der erro 400 ou 404, geralmente é carrinho vazio ou inválido
        if (err.response) {
            alert(`Erro: ${err.response.data.mensagem || "Falha ao iniciar pagamento"}`);
        }
      });
  }, []);

  if (!clientSecret) {
    return <p>Carregando pagamento...</p>;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div id="checkout">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutInner />
      </Elements>
    </div>
  )
}

export default CheckoutForm;