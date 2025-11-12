import api from '../../api/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './GerenciarLivros.css';

// 📚 Tipagem para o Livro
interface LivroType {
    _id: string;
    titulo: string;
    autor: string;
    genero: string;
    preco: number;
    capaUrl: string;
    descricao: string;
    destaque: boolean;
}

export default function GerenciarLivrosPage() {
    // 1. Estados
    const [livros, setLivros] = useState<LivroType[]>([]);
    // Usamos 'livroEmEdicao' para armazenar o livro que está sendo editado, habilitando o formulário na linha
    const [livroEmEdicao, setLivroEmEdicao] = useState<LivroType | null>(null); 
    
    const email = localStorage.getItem('email');
    const tipoUsuario = localStorage.getItem('tipo');

    // 2. Funções de API (CRUD)

    // 🔄 Função para buscar a lista de livros (Read)
    async function fetchLivros() {
        try {
            const response = await api.get("/livros");
            // Mapeia os dados para garantir que o 'preco' é um número
            const livrosFormatados = response.data.map((livro: any) => ({
                ...livro,
                preco: parseFloat(livro.preco) // Garante que o preço é lido como número
            }));
            setLivros(livrosFormatados);
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
            alert("Erro ao carregar a lista de livros.");
        }
    }

    // 🗑️ Lógica para Excluir Livro (Delete)
    async function handleDelete(id: string) {
        if (!window.confirm("Tem certeza que deseja excluir este livro?")) {
            return;
        }

        try {
            // Chamada DELETE para a rota que criamos no backend: /livros/:id
            await api.delete(`/livros/${id}`);
            alert("Livro excluído com sucesso!");
            fetchLivros(); // Recarrega a lista após exclusão
        } catch (error) {
            console.error('Erro ao excluir livro:', error);
            const msg = (error as any)?.response?.data?.error || (error as any).message;
            alert('Erro ao excluir livro: ' + msg);
        }
    }

    // ✍️ Lógica para Abrir Edição
    function handleOpenEdit(livro: LivroType) {
        // Cria uma cópia profunda para evitar edição direta no estado principal
        setLivroEmEdicao({ ...livro }); 
    }

    // 💾 Lógica para Salvar Edição (Update)
    async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!livroEmEdicao) return;

        const form = event.currentTarget;
        const formData = new FormData(form);

        const data: Partial<LivroType> = {
            titulo: formData.get('titulo') as string,
            autor: formData.get('autor') as string,
            genero: formData.get('genero') as string,
            // Garante a conversão para número
            preco: parseFloat(formData.get('preco') as string || '0'),
            capaUrl: formData.get('capaUrl') as string,
            descricao: formData.get('descricao') as string,
            // Verifica se o checkbox 'destaque' foi marcado
            destaque: formData.has('destaque') 
        };

        try {
            // Chamada PUT para a rota que criamos no backend: /livros/:id
            await api.put(`/livros/${livroEmEdicao._id}`, data);
            alert("Livro atualizado com sucesso!");
            setLivroEmEdicao(null); // Fecha o formulário de edição
            fetchLivros(); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao atualizar livro:', error);
            const msg = (error as any)?.response?.data?.error || (error as any).message;
            alert('Erro ao atualizar livro: ' + msg);
        }
    }

    // ➕ Lógica de Cadastro (Create)
    function handleForm(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        const data = {
            titulo: formData.get('titulo') as string,
            autor: formData.get('autor') as string,
            genero: formData.get('genero') as string,
            preco: parseFloat(formData.get('preco') as string || '0'),
            capaUrl: formData.get('capaUrl') as string,
            descricao: formData.get('descricao') as string,
            destaque: formData.has('destaque') 
        };

        api.post("/livros", data)
            .then(() => {
                alert("Livro cadastrado com sucesso!");
                fetchLivros(); // Recarrega a lista após cadastro
                form.reset();
            })
            .catch((error) => {
                console.error('Erro ao adicionar livro:', error);
                const msg = (error as any)?.response?.data?.error || (error as any).message;
                alert('Erro ao adicionar livro: ' + msg);
            });
    }

    // 3. Efeito para carregar a lista de livros na montagem do componente
    useEffect(() => {
        fetchLivros();
    }, []);

    // 4. Renderização do Componente
    return (
        <div>
            {/* Navbar (mantido) */}
            <nav className="navbar">
                <span>Bem-vindo, {email} ({tipoUsuario})</span>
                <div className="navbar-links">
                    <Link to="/">Voltar para Loja</Link>
                    <Link to="/admin">Estatísticas</Link>
                    <Link to="/logout">Sair</Link>
                </div>
            </nav>

            <div className="gerenciar-livros-container">
                <h1>📚 Cadastrar Novo Livro</h1>
                
                {/* Formulário de Cadastro (Adicionar) */}
                <form onSubmit={handleForm} className="cadastro-form">
                    <input type="text" name="titulo" placeholder="Título do Livro" required />
                    <input type="text" name="autor" placeholder="Autor" required />
                    <input type="text" name="genero" placeholder="Gênero" required />
                    <input type="number" name="preco" placeholder="Preço (R$)" step="0.01" required />
                    <input type="text" name="capaUrl" placeholder="URL da Capa" required />
                    <textarea name="descricao" placeholder="Descrição do livro..." required />
                    <label>
                        <input type="checkbox" name="destaque" />
                        📌 Marcar como Destaque
                    </label>
                    <button type="submit">✨ Cadastrar Livro</button>
                </form>

                <h2>📋 Livros Cadastrados ({livros.length})</h2>
                
                {/* Lista de Livros (Listar) */}
                <div className="livros-grid-admin">
                    {livros.length === 0 ? (
                        <p className="lista-vazia">Nenhum livro cadastrado.</p>
                    ) : (
                        livros.map((livro) => (
                            <div key={livro._id} className="livro-card-admin">
                                {livroEmEdicao && livroEmEdicao._id === livro._id ? (
                                    // Form de Edição (se este livro estiver em edição)
                                    <form onSubmit={handleSaveEdit} className="form-edicao">
                                        <input 
                                            type="text" 
                                            name="titulo" 
                                            defaultValue={livroEmEdicao.titulo} 
                                            placeholder="Título" 
                                            required 
                                        />
                                        <input type="text" name="autor" defaultValue={livroEmEdicao.autor} placeholder="Autor" required />
                                        {/* toFixed(2) para garantir o formato de preço no input */}
                                        <input type="number" name="preco" defaultValue={livroEmEdicao.preco.toFixed(2)} step="0.01" placeholder="Preço" required />
                                        <input type="text" name="genero" defaultValue={livroEmEdicao.genero} placeholder="Gênero" required />
                                        <input type="text" name="capaUrl" defaultValue={livroEmEdicao.capaUrl} placeholder="URL da Capa" required />
                                        <textarea name="descricao" defaultValue={livroEmEdicao.descricao} placeholder="Descrição" required />
                                        <label>
                                            <input type="checkbox" name="destaque" defaultChecked={livroEmEdicao.destaque} />
                                            Em Destaque
                                        </label>
                                        <div className="acoes-edicao">
                                            <button type="submit" className="btn-salvar">Salvar</button>
                                            <button type="button" onClick={() => setLivroEmEdicao(null)} className="btn-cancelar">Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    // Visualização Normal (se não estiver em edição)
                                    <>
                                        <img 
                                            src={livro.capaUrl} 
                                            alt={livro.titulo} 
                                            className="livro-capa" 
                                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100x150?text=Sem+Capa')} 
                                        />
                                        <div className="livro-info">
                                            <h3>{livro.titulo} {livro.destaque && '⭐'}</h3>
                                            <p>Autor: {livro.autor}</p>
                                            <p>Gênero: {livro.genero}</p>
                                            <p className="preco-display">R$ {livro.preco.toFixed(2)}</p>
                                            <p className="livro-desc">{livro.descricao.substring(0, 100)}...</p>
                                        </div>
                                        <div className="livro-acoes">
                                            <button 
                                                onClick={() => handleOpenEdit(livro)} 
                                                className="btn-editar"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(livro._id)} 
                                                className="btn-excluir"
                                            >
                                                🗑️ Excluir
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}