import React, { useState, useEffect } from 'react';
import { getFacturaImpresion, getFacturas } from '../services/mediosPagoService';
import { useModal } from '../context/ModalContext';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';

// Caja para historial e impresion de comprobantes
const CajaPage = () => {
  const { mostrarError } = useModal();
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
      mostrarError({
        titulo: 'Factura No Encontrada',
        mensaje: 'No se encontro ninguna factura con el numero especificado.'
      });
    }
  };

  // Funcion de impresion que resetea el scroll antes de imprimir para evitar entrecortes en Chrome
  const imprimir = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.print();
    }, 120);
  };

  const facturasFiltradas = facturas.filter(f => {
    if (!fechaFiltro) return true;
    const fDate = new Date(f.FechaEmision).toISOString().split('T')[0];
    return fDate === fechaFiltro;
  });

  return (
    <div className="page-container">
      <h2 className="no-print">Caja e Impresion</h2>
      <p className="no-print" style={{ color: 'var(--tinta-suave)', marginBottom: '1.5rem' }}>
        Historial de facturas emitidas e impresion de comprobantes.
      </p>

      <div className="no-print">
        <h3>Historial de Facturas</h3>

        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 'bold' }}>Filtrar por Fecha:</label>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            style={{ padding: '6px 10px', border: '2px solid var(--tinta)' }}
          />
          <button
            onClick={() => setFechaFiltro('')}
            style={{ padding: '6px 14px', background: '#64748b', color: '#fff', border: '2px solid var(--tinta)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Ver Todas
          </button>
        </div>

        <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
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
                  <th style={{ textAlign: 'center' }}>Accion</th>
                </tr>
              </thead>
              <tbody>
                {facturasFiltradas.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No hay facturas en esta fecha</td></tr>
                ) : (
                  facturasFiltradas.map(f => (
                    <tr key={f.IdFactura}>
                      <td><strong>{f.IdFactura}</strong></td>
                      <td>{new Date(f.FechaEmision).toLocaleString()}</td>
                      <td>{f.NombreCliente}</td>
                      <td style={{ fontWeight: 'bold' }}>Q{Number(f.MontoTotal || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-ver-factura-tabla"
                          onClick={() => buscarParaImprimir(f.IdFactura)}
                        >
                          VER FACTURA
                        </button>
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
          {/* Documento formal de factura (con cuadros, bordes y sin colores al imprimir) */}
          <div className="factura-documento-recuadro">
            <div className="factura-header-caja">
              <h3>OMNI-SAZO</h3>
              <p className="factura-header-sub">FERRETERIA Y PINTURAS - COMPROBANTE FISCAL DE VENTA</p>
              <div className="factura-no-badge">FACTURA NO. {facturaImprimir.encabezado.IdFactura}</div>
            </div>

            <div className="factura-datos-caja">
              <div className="factura-dato-item">
                <span>Fecha de Emision:</span> <strong>{new Date(facturaImprimir.encabezado.FechaEmision).toLocaleString()}</strong>
              </div>
              <div className="factura-dato-item">
                <span>Cliente:</span> <strong>{facturaImprimir.encabezado.NombreCliente}</strong>
              </div>
              <div className="factura-dato-item">
                <span>NIT:</span> <strong>{facturaImprimir.encabezado.NITCliente}</strong>
              </div>
              <div className="factura-dato-item">
                <span>Cajero / Operador:</span> <strong>{facturaImprimir.encabezado.Cajero}</strong>
              </div>
            </div>

            <table className="factura-tabla-items">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Cant.</th>
                  <th>Descripcion del Producto</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>P.U.</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {facturaImprimir.detalle.map((d, index) => (
                  <tr key={d.IdFacturaDetalle || index}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.Cantidad}</td>
                    <td>{d.NombreProducto}</td>
                    <td style={{ textAlign: 'right' }}>Q{Number(d.PrecioUnitario).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Q{Number(d.Subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="factura-total-caja">
              <span>TOTAL A PAGAR:</span>
              <span>Q{Number(facturaImprimir.encabezado.MontoTotal).toFixed(2)}</span>
            </div>

            <div className="factura-pagos-caja">
              <h4>Forma(s) de Pago Utilizada(s):</h4>
              {facturaImprimir.pagos.map((p, index) => (
                <div key={p.IdFacturaPago || index} className="factura-pago-fila">
                  <span>{p.NombreMedioPago}</span>
                  <strong>Q{Number(p.Monto).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div className="factura-footer-caja">
              <p>Gracias por su preferencia</p>
              <small>Documento para control fiscal interno y constancia de adquisicion de bienes.</small>
            </div>
          </div>

          <div className="no-print" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-imprimir-factura-prominente" onClick={imprimir}>
              IMPRIMIR FACTURA
            </button>
            <button className="btn-cerrar-preview" onClick={() => setFacturaImprimir(null)}>
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajaPage;
