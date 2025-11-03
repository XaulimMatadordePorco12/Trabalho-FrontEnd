import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('tipoUsuario');
        localStorage.removeItem('email');
        navigate('/login');
    }, [navigate]);

    return null;
}

export default Logout;