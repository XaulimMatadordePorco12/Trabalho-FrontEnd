import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('token');
        // remover a mesma chave que o App consulta ("tipo")
        localStorage.removeItem('tipo');
        localStorage.removeItem('email');
        navigate('/login');
    }, [navigate]);

    return null;
}

export default Logout;