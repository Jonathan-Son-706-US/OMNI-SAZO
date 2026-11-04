import React, { useState } from 'react';
import { getFacturaParaAnulacion, anularFactura } from '../services/anulacionService';
import { useModal } from '../context/ModalContext';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';

// Modulo de Anulacion de Facturas
const AnulacionPage = () => {
  const { mostrarModal, mostrarError, mostrarConfirmacion } = useModal();
  const [idFacturaBusqueda, setIdFacturaBusqueda] = useState('');
  const [factura, setFactura] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [errorMotivo, setErrorMotivo] = useState('');

  const handleBuscar = async (e) => {
    if (e) e.preventDefault();
    const id = parseInt(idFacturaBusqueda, 10);
    if (!id || isNaN(id) || id <= 0) {
      setErrorBusqueda('Ingresa un numero de factura valido (mayor o igual a 1).');
      setFactura(null);
      return;
    }

    setCargando(true);
    setErrorBusqueda('');
    setErrorMotivo('');
    setFactura(null);
    setMotivo('');

    try {
      const res = await getFacturaParaAnulacion(id);
      if (res.ok && res.data) {
        setFactura(res.data);
      } else {
        setErrorBusqueda(res.mensaje || 'No se encontro la factura.');
      }
    } catch (err) {
      console.error('Error al buscar factura:', err);
      const msg = err.response?.data?.mensaje || 'No se encontro ninguna factura con ese numero.';
      setErrorBusqueda(msg);
    } finally {
      setCargando(false);
    }
  };

  const ejecutarAnulacion = async () => {
    if (!factura || !factura.encabezado) return;
    const idFactura = factura.encabezado.IdFactura;
    setProcesando(true);
    setErrorMotivo('');

    try {
      const res = await anularFactura(idFactura, motivo.trim());
      if (res.ok) {
        // Recargar datos para mostrar factura en Q 0.00 y ANULADA
        const recarga = await getFacturaParaAnulacion(idFactura);
        if (recarga.ok) {
          setFactura(recarga.data);
        }
        // Pop-up con ilustracion de anulacion (cuadro 3 deadlock)
        mostrarModal({
          tipo: 'danger',
          titulo: `Factura #${idFactura} Anulada`,
          mensaje: 'La factura fue anulada exitosamente en el sistema. Los productos correspondientes retornaron a su bodega y el monto quedo en Q 0.00.',
          botonTexto: 'Entendido'
        });
      } else {
        mostrarError({
          titulo: 'Error al Anular',
          mensaje: res.mensaje || 'Ocurrio un error al intentar anular la factura.'
        });
      }
    } catch (err) {
      console.error('Error al anular:', err);
      const msg = err.response?.data?.mensaje || 'Error al anular la factura.';
      mostrarError({
        titulo: 'Fallo al Anular',
        mensaje: msg
      });
    } finally {
      setProcesando(false);
    }
  };

  const solicitarConfirmacion = () => {
    if (!motivo.trim()) {
      setErrorMotivo('Debes ingresar el motivo de anulacion antes de proceder.');
      return;
    }
    setErrorMotivo('');

    mostrarConfirmacion({
      titulo: 'Confirmar Anulacion',
      mensaje: `Estas a punto de anular la Factura #${factura.encabezado.IdFactura} por un total de Q${Number(factura.encabezado.MontoTotal).toFixed(2)}. Motivo: "${motivo.trim()}". Esta accion devolvera el stock a bodega y no se puede deshacer.`,
      botonTexto: 'Si, Anular Factura',
      botonSecundarioTexto: 'Cancelar',
      onConfirmar: ejecutarAnulacion
    });
  };

  return (
    <div className="page-container">
      <h2>Anulacion de Facturas</h2>
      <p style={{ color: 'var(--tinta-suave)', marginBottom: '1.5rem' }}>
        Busqueda por numero de factura, devuelve el producto a bodega y deja el monto en cero.
      </p>

      {/* Barra de busqueda */}
      <div className="buscador-factura" style={{ maxWidth: '600px', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>
            Numero de Factura:
          </label>
          <input
            type="number"
            min="1"
            placeholder="Ej. 1, 2, 3..."
            value={idFacturaBusqueda}
            onChange={(e) => setIdFacturaBusqueda(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); }}
            style={{ width: '100%', padding: '0.65rem', border: '3px solid var(--tinta)', fontFamily: 'var(--fuente-texto)' }}
          />
        </div>
        <button
          onClick={handleBuscar}
          disabled={cargando}
          style={{
            padding: '0.65rem 1.4rem',
            background: 'var(--tinta-mod, #dc2626)',
            color: '#fff',
            border: '3px solid var(--tinta)',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {cargando ? 'Buscando...' : 'Buscar Factura'}
        </button>
      </div>

      {errorBusqueda && (
        <div style={{
          padding: '0.8rem 1rem',
          backgroundColor: '#fee2e2',
          border: '3px solid #991b1b',
          color: '#991b1b',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          maxWidth: '600px'
        }}>
          {errorBusqueda}
        </div>
      )}

      {/* Resultado de la busqueda */}
      {factura && factura.encabezado && (
        <div className="tab-contenido" style={{ marginTop: '1rem' }}>
          {/* Tarjeta de Encabezado */}
          <div style={{
            background: 'var(--papel)',
            border: '3px solid var(--tinta)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '4px 4px 0px var(--tinta)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid var(--tinta)', paddingBottom: '0.8rem' }}>
              <div>
                <h3 style={{ margin: 0, textTransform: 'uppercase' }}>
                  Factura #{factura.encabezado.IdFactura}
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--tinta-suave)' }}>
                  Fecha: {new Date(factura.encabezado.FechaEmision).toLocaleString()}
                </span>
              </div>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '0.4rem 0.9rem',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  border: '2px solid var(--tinta)',
                  background: factura.encabezado.Estado === 'ANULADA' ? '#fee2e2' : '#d1fae5',
                  color: factura.encabezado.Estado === 'ANULADA' ? '#991b1b' : '#065f46'
                }}>
                  {factura.encabezado.Estado}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <strong>Cliente:</strong> {factura.encabezado.NombreCliente}
              </div>
              <div>
                <strong>NIT:</strong> {factura.encabezado.NITCliente || 'C/F'}
              </div>
              <div>
                <strong>Atendido por:</strong> {factura.encabezado.NombreUsuario || 'Cajero'}
              </div>
              <div>
                <strong>Total Factura:</strong> Q {Number(factura.encabezado.MontoTotal).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Tabla de Productos Detalle */}
          <h4 style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>Detalle de Productos Vendidos</h4>
          <div className="table-container" style={{ marginBottom: '1.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {factura.detalle && factura.detalle.map((item, idx) => (
                  <tr key={item.IdFacturaDetalle || idx}>
                    <td>{idx + 1}</td>
                    <td>{item.NombreProducto}</td>
                    <td>{item.Cantidad}</td>
                    <td>Q {Number(item.PrecioUnitario).toFixed(2)}</td>
                    <td>Q {Number(item.Subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Medios de Pago Utilizados */}
          <h4 style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>Medios de Pago Utilizados</h4>
          <div className="table-container" style={{ marginBottom: '1.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medio de Pago</th>
                  <th>Monto Cancelado</th>
                </tr>
              </thead>
              <tbody>
                {factura.mediosPago && factura.mediosPago.map((pago, idx) => (
                  <tr key={pago.IdFacturaMedioPago || idx}>
                    <td>{pago.NombreMedioPago}</td>
                    <td>Q {Number(pago.Monto).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Seccion de Anulacion */}
          {factura.encabezado.Estado !== 'ANULADA' ? (
            <div style={{
              background: '#fff',
              border: '3px solid #dc2626',
              padding: '1.5rem',
              boxShadow: '4px 4px 0px #dc2626',
              marginTop: '1rem'
            }}>
              <h4 style={{ margin: '0 0 0.8rem 0', color: '#dc2626', textTransform: 'uppercase' }}>
                Zona de Anulacion
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--tinta-suave)', margin: '0 0 1rem 0' }}>
                Al anular esta factura se generara un movimiento de devolucion en KARDEX para devolver los productos a su lote original, y el monto total quedara en Q 0.00.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                  Motivo de Anulacion (Obligatorio):
                </label>
                <textarea
                  rows="3"
                  placeholder="Explica la razon de la anulacion (ej. error en producto, cancelacion de cliente, etc.)..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    border: '3px solid var(--tinta)',
                    fontFamily: 'var(--fuente-texto)',
                    boxSizing: 'border-box'
                  }}
                />
                {errorMotivo && (
                  <p style={{ color: '#dc2626', fontWeight: 'bold', margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
                    {errorMotivo}
                  </p>
                )}
              </div>

              <button
                onClick={solicitarConfirmacion}
                disabled={procesando}
                style={{
                  padding: '0.8rem 1.6rem',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: '3px solid var(--tinta)',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px var(--tinta)'
                }}
              >
                {procesando ? 'Procesando...' : 'Anular Factura y Devolver Producto'}
              </button>
            </div>
          ) : (
            <div style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              border: '2px dashed #9ca3af',
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#4b5563'
            }}>
              Esta factura ya se encuentra anulada. Su monto total es Q 0.00 y los productos regresaron a bodega.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnulacionPage;
