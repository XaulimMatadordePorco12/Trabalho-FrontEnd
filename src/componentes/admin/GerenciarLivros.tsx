import api from '../../api/api';
import React from 'react';
import { Link } from 'react-router-dom';
import './GerenciarLivros.css';

export default function GerenciarLivrosPage() {
    const email = localStorage.getItem('email');
    const tipoUsuario = localStorage.getItem('tipo');

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
            .then(() => alert("Livro cadastrado com sucesso!"))
            .catch((error) => {
                console.error('Erro ao adicionar livro:', error);
                const msg = error?.response?.data?.error || error.message;
                alert('Erro ao adicionar livro: ' + msg);
            });
        form.reset();
    }

    return (
        <div>
            {/* Cabeçalho no mesmo padrão das outras páginas */}
            <nav className="navbar">
                <span>Bem-vindo, {email}</span>
                <div className="navbar-links">
                    <Link to="/">Voltar para Loja</Link>
                    <Link to="/admin">Estatísticas</Link>
                    <Link to="/logout">Sair</Link>
                </div>
            </nav>

            <div className="gerenciar-livros-container">
                <h1>📚 Cadastrar Novo Livro</h1>
                
                <form onSubmit={handleForm}>
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

                <h2>📋 Lista de Livros Cadastrados</h2>
                <div className="lista-livros-placeholder">
                    <p>Funcionalidade em desenvolvimento...</p>
                </div>
            </div>
        </div>
    );
}