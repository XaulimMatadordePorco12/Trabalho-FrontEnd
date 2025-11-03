import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import "./login.css"

function Login(){
    const navigate = useNavigate()
    //url   localhost:5123/login?mensagem=Token Inválido
    //para pegar a mensagem passada pela url usamos o useSearchParams()
    const [searchParams] = useSearchParams()
    //Dentro do searchParans eu consigo utilizar o get para pegar 
    // o valor da variável passada pela URL
    const mensagem = searchParams.get("mensagem")

    //Função chamada quando clicamos no botão do formulário
    function handleSubmit(event:React.FormEvent<HTMLFormElement>){
        event.preventDefault()
        //Vamos pegar o que a pessoa digitou no formulário
        const formData = new FormData(event.currentTarget)
        const email = formData.get("email")
        const senha = formData.get("senha")

        //chamar a API.post para mandar o login e senha
        api.post("/login",{
            email,
            senha
        }).then(resposta=>{
            if(resposta.status===200){
                localStorage.setItem("token", resposta?.data?.token)
                localStorage.setItem("email", email as string)
                navigate("/")
            }
        }).catch((error:any)=>{
            const msg = error?.response?.data?.mensagem || 
                        error?.mensagem || 
                        "Erro: Email ou senha inválidos!"
            navigate(`/login?mensagem=${encodeURIComponent(msg)}`)
        })
    }


    return(
        <div className="login-page">
            <div className="login-card">
                <h1>Login</h1>
                {mensagem && <p className="login-message">{mensagem}</p>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            placeholder="Digite seu email"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="senha">Senha:</label>
                        <input 
                            type="password" 
                            name="senha" 
                            id="senha" 
                            placeholder="Digite sua senha"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">Entrar</button>
                </form>
            </div>
        </div>
    )
}
export default Login;