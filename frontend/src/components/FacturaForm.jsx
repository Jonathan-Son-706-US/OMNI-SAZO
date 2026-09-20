import React from 'react';

const FacturaForm = () => {
    const handleFacturar = (e) => {
        e.preventDefault();
        // @Javi: aca tenes que hacer el POST a FACTURAS_ENCABEZADO y luego a FACTURAS_DETALLE
        console.log("Javi, aquí tenés que guardar el encabezado y el detalle de la factura.");
        alert("Simulación: Factura generada con éxito");
    };

    return (
        <div className="form-container">
            <h3>Generar Nueva Factura</h3>
            <form onSubmit={handleFacturar}>
                {/* @Javi: Llenar con GET a CLIENTES */}
                <div>
                    <label>Cliente (NIT o Nombre):</label>
                    <select><option>Consumidor Final (CF)</option></select>
                </div>

                {/* @Javi: Llenar con GET a PRODUCTOS (que tengan stock en BODEGAS) */}
                <div>
                    <label>Agregar Producto al Carrito:</label>
                    <select><option>Seleccione producto...</option></select>
                    <input type="number" placeholder="Cantidad" style={{ width: '110px', marginLeft: '10px' }}/>
                    <button type="button" style={{ marginLeft: '10px' }}>+ Agregar</button>
                </div>

                <hr style={{ margin: '20px 0' }}/>
                
                {/* @Javi: Llenar con GET a MEDIOS_PAGO */}
                <div>
                    <label>Medio de Pago:</label>
                    <select><option>Efectivo</option></select>
                </div>

                <button type="submit">Generar Factura y Cobrar</button>
            </form>
        </div>
    );
};

export default FacturaForm;