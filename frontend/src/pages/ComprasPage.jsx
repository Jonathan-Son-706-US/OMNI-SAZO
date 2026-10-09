import React, { useState } from 'react';
import '../components/estilos/MediosPago.css';

const ComprasPage = () => {
  const [activeTab, setActiveTab] = useState('ordenes');

  // MOCK DATA (solo visual para el diseño)
  const mockProveedores = [
    { IdProveedor: 1, Nombre: 'Herramientas Global S.A.' },
    { IdProveedor: 2, Nombre: 'Pinturas de Occidente' }
  ];

  const mockProductos = [
    { IdProducto: 1, NombreProducto: 'Pintura Blanca 1 Galon' },
    { IdProducto: 2, NombreProducto: 'Brocha 3 pulgadas' }
  ];

  const mockCompras = [
    { IdCompra: 1, Proveedor: 'Herramientas Global S.A.', Fecha: '2026-10-01', Estado: 'PENDIENTE', Monto: 'Q2,500.00' },
    { IdCompra: 2, Proveedor: 'Pinturas de Occidente', Fecha: '2026-10-05', Estado: 'RECIBIDO', Monto: 'Q4,200.00' }
  ];

  return (
    <div className="page-container">
      <h2 className="no-print">Módulo de Compras e Ingreso a Bodega</h2>
      <p style={{ color: 'var(--tinta-suave)', marginBottom: '1.5rem' }}>
        // @abner (nota para el dev): Áreas correspondientes a las tablas COMPRAS_ENCABEZADO, COMPRAS_DETALLE e INVENTARIO_LOTES.
      </p>

      {/* Navegacion por pestañas */}
      <div className="tabs-container no-print">
        <button 
          className={`tab-btn ${activeTab === 'ordenes' ? 'tab-activa' : ''}`}
          onClick={() => setActiveTab('ordenes')}
        >
          Generar Orden de Compra
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ingreso' ? 'tab-activa' : ''}`}
          onClick={() => setActiveTab('ingreso')}
        >
          Ingreso a Bodega (Lotes)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'historial' ? 'tab-activa' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          Historial de Compras
        </button>
      </div>

      {/* PESTAÑA 1: Orden de Compra */}
      {activeTab === 'ordenes' && (
        <div className="tab-contenido seccion-modulo">
          <h3>Generar Orden de Compra</h3>
          <div className="info-vacia" style={{ border: '2px dashed var(--tinta-mod)', padding: '2rem', textAlign: 'left', fontStyle: 'normal' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontWeight: 'bold' }}>Proveedor:</label>
                <select style={{ width: '100%', padding: '0.5rem' }}>
                  <option value="">Seleccione Proveedor</option>
                  {mockProveedores.map(p => <option key={p.IdProveedor} value={p.IdProveedor}>{p.Nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Fecha de Emisión:</label>
                <input type="date" style={{ width: '100%', padding: '0.5rem' }} defaultValue="2026-10-08" readOnly />
              </div>
            </div>

            <h4 style={{ marginTop: '1rem', borderBottom: '1px solid #ccc' }}>Detalle de Productos a Comprar</h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <select style={{ flex: 1, padding: '0.5rem' }}>
                <option value="">Seleccione un producto</option>
                {mockProductos.map(p => <option key={p.IdProducto} value={p.IdProducto}>{p.NombreProducto}</option>)}
              </select>
              <input type="number" placeholder="Cantidad" style={{ width: '100px', padding: '0.5rem' }} />
              <input type="number" placeholder="Costo Unit." step="0.01" style={{ width: '120px', padding: '0.5rem' }} />
              <button style={{ padding: '0.5rem 1rem', background: 'var(--tinta-mod)', color: '#fff', border: 'none' }}>+ Agregar</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ background: 'var(--papel-2)' }}>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Producto</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Cantidad</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Costo U.</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Subtotal</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan="5" className="info-vacia">No hay productos en el detalle</td></tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-imprimir" style={{ padding: '0.75rem 2rem', fontWeight: 'bold' }}>GENERAR ORDEN DE COMPRA</button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: Ingreso a Bodega */}
      {activeTab === 'ingreso' && (
        <div className="tab-contenido seccion-modulo">
          <h3>Recepción de Mercadería (Ingreso a Lotes)</h3>
          
          <div className="buscador-factura">
            <label style={{ fontWeight: 'bold' }}>Buscar Compra PENDIENTE:</label>
            <select style={{ padding: '0.55rem 0.7rem', width: '250px' }}>
              <option value="">Seleccione la orden</option>
              <option value="1">Orden #1 - Herramientas Global</option>
            </select>
            <button style={{ padding: '0.55rem 1rem' }}>Cargar Detalle</button>
          </div>

          <div style={{ border: '2px solid var(--tinta)', padding: '1rem', background: 'var(--papel-2)' }}>
            <p><strong>// @abner (nota para el dev):</strong> Al confirmar el ingreso, acá se debe insertar en la tabla <code>INVENTARIO_LOTES</code> asignando la bodega y el correlativo del lote.</p>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: '#fff' }}>
              <thead>
                <tr style={{ background: 'var(--tinta)', color: '#fff' }}>
                  <th style={{ padding: '0.5rem' }}>Producto</th>
                  <th style={{ padding: '0.5rem' }}>Cant. Pedida</th>
                  <th style={{ padding: '0.5rem' }}>Cant. Recibida</th>
                  <th style={{ padding: '0.5rem' }}>Ubicación (Bodega)</th>
                  <th style={{ padding: '0.5rem' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Pintura Blanca 1 Galon</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>100</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                    <input type="number" defaultValue="100" style={{ width: '80px' }} />
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                    <select>
                      <option value="1">Estante E1 - Nivel N1</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                    <span className="badge-estado badge-pendiente">En Proceso</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button style={{ background: '#0e9f5e', color: 'white', padding: '0.75rem 2rem', fontWeight: 'bold', border: 'none' }}>INGRESAR A BODEGA (Crear Lotes)</button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: Historial */}
      {activeTab === 'historial' && (
        <div className="tab-contenido seccion-modulo">
          <h3>Historial General de Compras</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ background: 'var(--tinta)', color: '#fff' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}># Compra</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Proveedor</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Monto Total</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {mockCompras.map(compra => (
                <tr key={compra.IdCompra} style={{ borderBottom: '1px solid #ccc' }}>
                  <td style={{ padding: '0.75rem' }}>{compra.IdCompra}</td>
                  <td style={{ padding: '0.75rem' }}>{compra.Proveedor}</td>
                  <td style={{ padding: '0.75rem' }}>{compra.Fecha}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>{compra.Monto}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span className={`badge-estado ${compra.Estado === 'RECIBIDO' ? 'badge-confirmada' : 'badge-pendiente'}`}>
                      {compra.Estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComprasPage;

