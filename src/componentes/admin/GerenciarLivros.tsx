import api from '../../api/api';
import React from 'react';

export default function GerenciarLivrosPage() {

    function handleForm(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        // Prepara os dados conforme o backend espera
        const data = {
            titulo: formData.get('titulo') as string,
            autor: formData.get('autor') as string,
            genero: formData.get('genero') as string,
            preco: parseFloat(formData.get('preco') as string || '0'),
            capaUrl: formData.get('capaUrl') as string,
            descricao: formData.get('descricao') as string,
            // Certifique-se que o nome do campo é 'destaque' no backend
            destaque: formData.has('destaque') 
        };

        // Rota POST /livros (já existe no rotas-autenticadas.ts)
        api.post("/livros", data)
            .then(() => alert("Livro cadastrado com sucesso!"))
            .catch((error) => {
                console.error('Erro ao adicionar livro:', error);
                const msg = error?.response?.data?.error || error.message;
                alert('Erro ao adicionar livro: ' + msg);
            });
        form.reset(); // Limpa o formulário após a submissão
    }

    return (
        <div className="gerenciar-livros-container">
            <h1>Cadastrar Novo Livro</h1>
            <form onSubmit={handleForm}>
                <input type="text" name="titulo" placeholder="Título" required />
                <input type="text" name="autor" placeholder="Autor" required />
                <input type="text" name="genero" placeholder="Gênero" required />
                {/* Use step="0.01" para permitir centavos */}
                <input type="number" name="preco" placeholder="Preço" step="0.01" required /> 
                <input type="text" name="capaUrl" placeholder="URL da Capa" required />
                <textarea name="descricao" placeholder="Descrição" required />
                <label>
                    <input type="checkbox" name="destaque" />
                    Em Destaque
                </label>
                <button type="submit">Cadastrar Livro</button>
            </form>

            {/* Futuramente, você adicionará aqui a lista de livros para gerenciar (editar/excluir) */}
            <h2>Lista de Livros Cadastrados (A Fazer)</h2>
        </div>
    );
}