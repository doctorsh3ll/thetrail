import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import MainContent from './MainContent'; // Componente principal do seu aplicativo

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula um tempo de carregamento
    setTimeout(() => {
      setLoading(false); // Marca o carregamento como concluído após 2 segundos
    }, 2000);
  }, []);

  return (
    <div className="app">
      {loading ? (
        <SplashScreen />
      ) : (
        <MainContent />
      )}
    </div>
  );
}

export default App;
