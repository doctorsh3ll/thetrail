import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    // Faz uma solicitação HTTP para a API no backend para obter os dados
    axios.get('http://seu-backend.com/api/dados')
      .then(response => {
        setDados(response.data);
      })
      .catch(error => {
        console.error('Erro ao obter dados:', error);
      });
  }, []);

  return (
    <div>
      <h1>Minhas URLs personalizadas:</h1>
      <ul>
        {dados.map(item => (
          <li key={item.id}>
            {/* Gera as URLs personalizadas com base nos dados */}
            <a href={`http://thetrailproject.online/${item.slug}`}>{item.titulo}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
