import React, { useState } from 'react';
import ProductoForm from '../components/ProductoForm';
import '../components/estilos/TablasCrud.css';

const InventarioPage = () => {
    const [mostrarForm, setMostrarForm] = useState(false);

    // Para @Javi de @Abner: Reemplazar esta data quemada por tu response de Axios (GET /api/productos)
    const productosDummy = [
        { IdProducto: 1, NombreProducto: 'Pintura Blanca Cubeta', PrecioVentaBase: 250.00, Marca: 'Corona', Categoria: 'Acrílica' },
        { IdProducto: 2, NombreProducto: 'Brocha 3 pulgadas', PrecioVentaBase: 15.50, Marca: 'Truper', Categoria: 'Herramientas' }
    ];

    return (
        <div className="page-container">
            <h2>Módulo de Ingreso de Datos (Productos)</h2>
            <button onClick={() => setMostrarForm(!mostrarForm)}>
                {mostrarForm ? 'Ocultar Formulario' : 'Nuevo Producto'}
            </button>

            {mostrarForm && <ProductoForm />}

            <div className="table-container mt-4">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Marca</th>
                            <th>Categoría</th>
                            <th>Precio Venta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosDummy.map(prod => (
                            <tr key={prod.IdProducto}>
                                <td>{prod.IdProducto}</td>
                                <td>{prod.NombreProducto}</td>
                                <td>{prod.Marca}</td>
                                <td>{prod.Categoria}</td>
                                <td>Q{prod.PrecioVentaBase.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventarioPage;