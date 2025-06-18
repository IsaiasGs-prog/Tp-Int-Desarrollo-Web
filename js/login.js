document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');

    function showMessage(message, type) {
        loginMessage.textContent = message;
        loginMessage.className = `message ${type}`;
        loginMessage.style.display = 'block';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            
            const response = await fetch('https://dummyjson.com/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    
                })
            });

            const data = await response.json();

            if (response.ok) { 
                sessionStorage.setItem('accessToken', data.token);
                sessionStorage.setItem('currentUser', JSON.stringify({
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    gender: data.gender,
                    image: data.image
                }));
                const isAdmin = (data.username === 'lilyb'); 
                sessionStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');

                showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
                setTimeout(() => {
                    if (isAdmin) {
                        window.location.href = 'salones-crud.html'; 
                    } else {
                        alert('Acceso permitido, pero sin privilegios de administrador para esta sección.');
                        window.location.href = 'index.html'; 
                    }
                }, 1500); 
            } else {
                showMessage(`Error al iniciar sesión: ${data.message || 'Credenciales inválidas.'}`, 'error');
                console.error('Error de autenticación:', data);
            }
        } catch (error) {
            console.error('Error de red o del servidor:', error);
            showMessage('Error de conexión. Intente más tarde.', 'error');
        }
    });
});