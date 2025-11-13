import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import foto from '../assets/Niger.png';

function Home() {
  return (
    <div>
      <BarraBusqueda />
      <h1>BARKA DA ZUWA</h1>  
      

      <img src={foto} alt="Imagen de Inicio" />
    </div>
  );
}

export default Home;
