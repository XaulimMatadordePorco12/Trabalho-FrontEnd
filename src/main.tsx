import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";


const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); // sua chave pública
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        
        <Route path="/finalizar-compra" element={ <Elements stripe={stripe}><Componente que tenha o cartão/></Elements>} />
			

        
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)