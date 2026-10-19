import React, { useState, useEffect } from 'react';
import { getFacturaImpresion, getFacturas } from '../services/mediosPagoService';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';

// @Javi: Caja queda como historial e impresión de facturas.
// La emisión de ventas se movió a FacturacionPage.jsx (PEPS).
const CajaPage = () => {
  const [facturas, setFacturas] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [facturaImprimir, setFacturaImprimir] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarHistorial = async () => {
    setCargando(true);
    try {
      const data = await getFacturas();
      setFacturas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error obteniendo facturas', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const buscarParaImprimir = async (id) => {
    try {
      const data = await getFacturaImpresion(id);
      setFacturaImprimir(data);
    } catch (error) {
      alert('No se encontró la factura.');
    }
  };

  const imprimir = () => {
    window.print();
  };

  const facturasFiltradas = facturas.filter(f => {
    if (!fechaFiltro) return true;
    const fDate = new Date(f.FechaEmision).toISOString().split('T')[0];
    return fDate === fechaFiltro;
  });

  return (
    <div className="page-container">
      <h2 className="no-print">Caja e Impresión</h2>
      <p className="no-print" style={{ color: 'var(--tinta-suave)', marginBottom: '1.5rem' }}>
        Historial de facturas emitidas e impresión de comprobantes.
      </p>

      <div className="no-print">
        <h3>Historial de Facturas</h3>

        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Filtrar por Fecha:</label>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            style={{ padding: '5px' }}
          />
          <button onClick={() => setFechaFiltro('')} style={{ padding: '5px 10px', background: '#888' }}>
            Ver Todas
          </button>
        </div>

        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {cargando ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando historial...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {facturasFiltradas.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No hay facturas en esta fecha</td></tr>
                ) : (
                  facturasFiltradas.map(f => (
                    <tr key={f.IdFactura}>
                      <td>{f.IdFactura}</td>
                      <td>{new Date(f.FechaEmision).toLocaleString()}</td>
                      <td>{f.NombreCliente}</td>
                      <td>Q{Number(f.MontoTotal || 0).toFixed(2)}</td>
                      <td>
                        <button onClick={() => buscarParaImprimir(f.IdFactura)}>Ver/Imprimir</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {facturaImprimir && (
        <div className="factura-print-area" style={{ marginTop: '2rem' }}>
          <div className="factura-preview">
            <div className="factura-header">
              <h3>OMNI-SAZO</h3>
              <p>Ferretería y Pinturas</p>
              <p>Factura No. {facturaImprimir.encabezado.IdFactura}</p>
            </div>

            <div className="factura-info">
              <p><span>Fecha:</span> {new Date(facturaImprimir.encabezado.FechaEmision).toLocaleString()}</p>
              <p><span>Cliente:</span> {facturaImprimir.encabezado.NombreCliente}</p>
              <p><span>NIT:</span> {facturaImprimir.encabezado.NITCliente}</p>
              <p><span>Cajero:</span> {facturaImprimir.encabezado.Cajero}</p>
            </div>

            <table>
              <thead>
                <tr><th>Cant.</th><th>Producto</th><th>P.U.</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {facturaImprimir.detalle.map((d, index) => (
                  <tr key={d.IdFacturaDetalle || index}>
                    <td>{d.Cantidad}</td>
                    <td>{d.NombreProducto}</td>
                    <td>Q{Number(d.PrecioUnitario).toFixed(2)}</td>
                    <td>Q{Number(d.Subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="factura-total">
              TOTAL: Q{Number(facturaImprimir.encabezado.MontoTotal).toFixed(2)}
            </div>

            <div className="factura-pagos">
              <h4>Forma de pago</h4>
              {facturaImprimir.pagos.map((p, index) => (
                <p key={p.IdFacturaPago || index}>{p.NombreMedioPago}: Q{Number(p.Monto).toFixed(2)}</p>
              ))}
            </div>

            <div className="factura-footer">
              ¡Gracias por su compra!
            </div>
          </div>

          <div className="no-print" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button className="btn-imprimir" onClick={imprimir}>🖨️ IMPRIMIR FACTURA</button>
            <button onClick={() => setFacturaImprimir(null)} style={{ marginLeft: '10px', background: '#555' }}>Cerrar Preview</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajaPage;