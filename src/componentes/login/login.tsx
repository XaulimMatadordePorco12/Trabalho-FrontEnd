import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import "./login.css"

function Login() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const mensagem = searchParams.get("mensagem")

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = String(formData.get("email") || "")
        const senha = String(formData.get("senha") || "")

        console.log("Email:", email)
        console.log("Senha:", senha ? '*****' : '')

        try {
            const resposta = await api.post("/login", {
                email,
                senha
            })

            console.debug('Resposta do login:', resposta)

            const token = resposta?.data?.token || resposta?.data?.accessToken || resposta?.data?.access_token
            let tipo = resposta?.data?.tipo || resposta?.data?.tipoUsuario || resposta?.data?.role

            if (token) {
                localStorage.setItem("token", token)

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

            localStorage.setItem("tipo", tipo)
            localStorage.setItem("email", email)
            const usuarioId = resposta?.data?.usuarioId;

            if (usuarioId) {
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

            if (tipo === 'admin') {
                navigate("/admin")
            } else {
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
                <h1>Bookly</h1>
                <p className="subtitle">Sua livraria digital</p>
                {mensagem && <p className="login-message">{mensagem}</p>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Digite seu email"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="senha">Senha</label>
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