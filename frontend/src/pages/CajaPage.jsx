import React from 'react';
import FacturaForm from '../components/FacturaForm';

const CajaPage = () => {
    // Carrito de compras de prueba para ver como se mira, son datos quedamos
    const carritoDummy = [
        { IdProducto: 1, Nombre: 'Pintura Blanca Cubeta', Cantidad: 2, Precio: 250.00, Subtotal: 500.00 },
        { IdProducto: 2, Nombre: 'Brocha 3 pulgadas', Cantidad: 1, Precio: 15.50, Subtotal: 15.50 }
    ];

    const totalFactura = carritoDummy.reduce((acc, item) => acc + item.Subtotal, 0);

    return (
        <div className="page-container">
            <h2>Módulo de Caja (Cobros)</h2>
            
            {}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' }}>
                
                {/* Arriba: El formulario */}
                <div>
                    <FacturaForm />
                </div>
                
                {/* Abajo: La tabla a full ancho */}
                <div className="table-container">
                    <h3>Detalle de la Venta actual</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Cant.</th>
                                <th>Descripción</th>
                                <th>Precio U.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carritoDummy.map(item => (
                                <tr key={item.IdProducto}>
                                    <td>{item.Cantidad}</td>
                                    <td>{item.Nombre}</td>
                                    <td>Q{item.Precio.toFixed(2)}</td>
                                    <td>Q{item.Subtotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colSpan="3" style={{ textAlign: 'right' }}>TOTAL A PAGAR:</th>
                                <th>Q{totalFactura.toFixed(2)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default CajaPage;