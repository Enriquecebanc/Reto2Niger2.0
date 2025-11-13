import BarraBusqueda from '../componentes/barraBusqueda.jsx';
import logoNiger from '../assets/Niger.png';



const Ventas = () => {
    

    return (
        
        <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 10 }}>
                <img src={logoNiger} alt="Niger Logo" style={{ width: 80, height: 'auto' }} />
                <div style={{ flex: 1 }}>
                    <BarraBusqueda />
                </div>
            </div>
            <h1>Ventas</h1>
        </div>
    );
};

export default Ventas;