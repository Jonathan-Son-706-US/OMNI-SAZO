import React from 'react';

const ProductoForm = () => {
    const handleGuardar = (e) => {
        e.preventDefault();
        // @Javi: Aquí tenes que armar el objeto y mandarlo con Axios a tu POST /api/productos
        console.log("¡Qué onda Javi! Aquí tenés que atrapar los datos y mandarlos al backend.");
        alert("Simulación: Producto guardado (Falta backend de Javi)");
    };

    return (
        <div className="form-container">
            <h3>Registrar Nuevo Producto</h3>
            <form onSubmit={handleGuardar}>
                <div>
                    <label>Nombre del Producto:</label>
                    <input type="text" placeholder="Ej. Pintura Azul Galón" required />
                </div>
                
                <div>
                    <label>Precio de Venta Base (Q):</label>
                    <input type="number" step="0.01" placeholder="0.00" required />
                </div>

                <div>
                    <label>¿Maneja Lote y Caducidad?</label>
                    <input type="checkbox" /> Sí
                </div>

                {/* @Javi: Estos selects los tenés que llenar haciendo un GET a las tablas Categoria, Marca, Presentacion y Color */}
                <div>
                    <label>Marca:</label>
                    <select><option>Seleccione Marca...</option></select>
                </div>
                <div>
                    <label>Presentación:</label>
                    <select><option>Seleccione Presentación...</option></select>
                </div>
                <div>
                    <label>Categoría:</label>
                    <select><option>Seleccione Categoría...</option></select>
                </div>

                <button type="submit">Guardar Producto</button>
            </form>
        </div>
    );
};

export default ProductoForm;