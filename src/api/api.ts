import axios from 'axios'

// Fallback: se VITE_API_URL não estiver definida, usar http://localhost:8000
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL
})
// Nós vamos criar um middleware para adicionar o token na requisição

api.interceptors.request.use((config) =>{
    const token = localStorage.getItem("token")
    // garantir que headers existe (algumas chamadas podem vir sem)
    config.headers = config.headers || {}
    if(token)
        (config.headers as any).Authorization = `Bearer ${token}`
    return config
})

// Redirecionar para o LOGIN quando o usuário não tiver permissão.
api.interceptors.response.use(
    (response)=>response,
    (error)=>{
        // detectar erro de rede de forma mais robusta
        const isNetworkError = error?.code === "ERR_NETWORK" ||
                               error?.message?.toLowerCase()?.includes('network error') ||
                               !error?.response

        if(isNetworkError){
            // mantém a mesma UX atual: direcionar para /error com mensagem clara
            window.location.href = `/error?mensagem=${encodeURIComponent("Ligue o Servidor-> NPM RUN DEV")}`
            return Promise.reject(error)
        }

        const status = error?.response?.status;
        // proteger contra falta de response/config
        const reqUrl = error?.response?.config?.url || ''
        if(status===401 && !reqUrl.endsWith("/login")){
            localStorage.removeItem("token")
            window.location.href = `/login?mensagem=${encodeURIComponent("Token inválido")}`
        }
        return Promise.reject(error)
    }
)


export default api