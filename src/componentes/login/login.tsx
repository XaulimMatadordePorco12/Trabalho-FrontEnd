import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import "./login.css"

function Login() {
    const navigate = useNavigate()
    //url   localhost:5123/login?mensagem=Token Inválido
    //para pegar a mensagem passada pela url usamos o useSearchParams()
    const [searchParams] = useSearchParams()
    //Dentro do searchParans eu consigo utilizar o get para pegar 
    // o valor da variável passada pela URL
    const mensagem = searchParams.get("mensagem")

    //Função chamada quando clicamos no botão do formulário
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        // Vamos pegar o que a pessoa digitou no formulário
        const formData = new FormData(event.currentTarget)
        const email = String(formData.get("email") || "")
        const senha = String(formData.get("senha") || "")

        console.log("Email:", email)
        console.log("Senha:", senha ? '*****' : '')

        try {
            // chamar a API.post para mandar o login e senha
            const resposta = await api.post("/login", {
                email,
                senha
            })

            console.debug('Resposta do login:', resposta)

            // aceitar vários nomes possíveis para o token (token, accessToken, access_token)
            const token = resposta?.data?.token || resposta?.data?.accessToken || resposta?.data?.access_token
            // A API pode retornar o tipo com nomes diferentes: tipo, tipoUsuario, role
            let tipo = resposta?.data?.tipo || resposta?.data?.tipoUsuario || resposta?.data?.role

            if (token) {
                localStorage.setItem("token", token)

                // Se o backend não retornou o tipo explicitamente, tentar decodificar o token (payload JWT) para extrair 'tipo'
                if (!tipo) {
                    try {
                        const payloadBase64 = token.split('.')[1]
                        const decodedJson = JSON.parse(window.atob(payloadBase64))
                        if (decodedJson && decodedJson.tipo) tipo = decodedJson.tipo
                    } catch (e) {
                        console.debug('Não foi possível decodificar JWT para extrair tipo', e)
                    }
                }
            } else {
                console.warn('Nenhum token retornado pela API de login', resposta?.data)
            }

            if (!tipo) tipo = 'cliente'

            // Salva os dados no localStorage
            localStorage.setItem("tipo", tipo)
            localStorage.setItem("email", email) // 'email' já foi pego do formulário
            const usuarioId = resposta?.data?.usuarioId;

            if (usuarioId) {
                // O Carrinho.tsx espera um objeto JSON com a chave '_id'
                const usuarioParaStorage = { _id: usuarioId };
                try {
                    localStorage.setItem('usuario', JSON.stringify(usuarioParaStorage));
                    console.log('Objeto usuario salvo no storage:', usuarioParaStorage);
                } catch (e) {
                    console.debug('Não foi possível salvar usuário no localStorage', e)
                }
            } else {
                console.warn('Backend de login não retornou usuarioId. O carrinho pode não funcionar.');
            }

            // (Nota: Se sua API também retorna o objeto 'usuario', 
            // é recomendado salvar ele inteiro também, como fizemos antes: 
            // localStorage.setItem("usuario", JSON.stringify(resposta.data.usuario))
            // redireciona baseado no tipo de usuário
            if (tipo === 'admin') {
                // A linha 'localStorage.getItem('usuario')' foi removida pois não tinha efeito.
                navigate("/admin/dashboard")
            } else {
                // Adicionado o redirecionamento para usuários comuns
                navigate("/")
            }

        } catch (error: any) {
            const msg = error?.response?.data?.mensagem ||
                error?.mensagem ||
                "Erro: Email ou senha inválidos!"
            navigate(`/login?mensagem=${encodeURIComponent(msg)}`)
            console.error("Erro ao fazer login:", error)
        }
    }


    return (
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