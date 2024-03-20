    // Função para verificar se um token JWT está armazenado no localStorage
    function checkTokenOnLoad() {
        const token = localStorage.getItem('token');
        if (token) {
            // Se o token existe, obter as informações do usuário
            getUsername(token);
        }
    }

    // Chamar a função de verificação ao carregar a página
    checkTokenOnLoad();

    async function getUsername(token) {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await axios.get('https://auth.thetrailproject.online/get_username', config);
            const username = response.data.username;
            document.getElementById('username').innerText = username;
            // Exibir as informações do usuário após o login automático
            document.getElementById('userInfo').style.display = 'block';
        } catch (error) {
            console.error('Error getting username:', error.response.data.message);
        }
    }