import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getClientes } from '../services/clientesService';
import { getProductos } from '../services/productosService';
import { getMediosPago } from '../services/mediosPagoService';
import { getCotizaciones, getCotizacionDetalle } from '../services/cotizacionesService';
import { crearFactura, getStockDisponible } from '../services/facturasService';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';

// @Javi: Módulo de Facturación (Punto de Venta) con descuento PEPS
const FacturacionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const idCotizacionInit = location.state?.idCotizacion || null;

  // Catálogos
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);

  // Cotización previa (opcional)
  const [idCotizacion, setIdCotizacion] = useState(null);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState('');
  const [cotizacionInfo, setCotizacionInfo] = useState(null);

  // Cliente
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');

  // Carrito
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState([]);

  // Cierre de pago
  const [medioSeleccionado, setMedioSeleccionado] = useState('');
  const [montoPago, setMontoPago] = useState('');
  const [pagosSeleccionados, setPagosSeleccionados] = useState([]);

  // Estado global
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [facturaCreada, setFacturaCreada] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (idCotizacionInit) {
      cargarCotizacion(idCotizacionInit);
    }
  }, [idCotizacionInit]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [cli, prod, mp, cot, stock] = await Promise.all([
        getClientes(),
        getProductos(),
        getMediosPago(),
        getCotizaciones(),
        getStockDisponible()
      ]);
      setClientes(Array.isArray(cli) ? cli : []);
      setMediosPago(Array.isArray(mp) ? mp : []);
      setCotizaciones(Array.isArray(cot) ? cot : []);

      const stockMap = {};
      (Array.isArray(stock) ? stock : []).forEach(s => {
        stockMap[s.IdProducto] = Number(s.StockDisponible) || 0;
      });
      setProductos((Array.isArray(prod) ? prod : []).map(p => ({
        ...p,
        stockDisponible: stockMap[p.IdProducto] || 0
      })));
    } catch (err) {
      console.error('Error al cargar catálogos de facturación:', err);
      setError('No se pudieron cargar los datos. Verifica que el backend esté corriendo.');
    } finally {
      setCargando(false);
    }
  };

  const cargarCotizacion = async (idCot) => {
    try {
      const coti = await getCotizacionDetalle(idCot);
      if (!coti || !coti.encabezado) {
        setError('No se encontró la cotización seleccionada.');
        return;
      }
      setIdCotizacion(coti.encabezado.IdCotizacion);
      setCotizacionInfo(coti.encabezado);
      setClienteSeleccionado(coti.encabezado.IdCliente);
      setCarrito((coti.detalle || []).map(d => ({
        idProducto: d.IdProducto,
        nombre: d.NombreProducto,
        cantidad: d.Cantidad,
        precioUnitario: Number(d.PrecioUnitario),
        subtotal: Number(d.Subtotal)
      })));
      setPagosSeleccionados([]);
      setMensaje('');
      setError('');
    } catch (err) {
      console.error('Error al cargar la cotización:', err);
      setError('Error al cargar la cotización.');
    }
  };

  const handleCargarCotizacion = () => {
    if (!cotizacionSeleccionada) {
      setError('Seleccione una cotización para cargar.');
      return;
    }
    cargarCotizacion(cotizacionSeleccionada);
  };

  const quitarCotizacion = () => {
    setIdCotizacion(null);
    setCotizacionSeleccionada('');
    setCotizacionInfo(null);
    setCarrito([]);
    setPagosSeleccionados([]);
    setMensaje('');
    setError('');
  };

  const agregarDetalle = () => {
    setMensaje('');
    setError('');
    if (!productoSeleccionado) {
      setError('Seleccione un producto.');
      return;
    }
    const cant = parseInt(cantidad, 10);
    if (!cant || cant <= 0) {
      setError('La cantidad debe ser mayor a cero.');
      return;
    }
    const producto = productos.find(p => String(p.IdProducto) === String(productoSeleccionado));
    if (!producto) return;

    if (producto.stockDisponible < cant) {
      setError(`Stock insuficiente para "${producto.NombreProducto}". Disponible: ${producto.stockDisponible}.`);
      return;
    }

    const existente = carrito.find(d => d.idProducto === producto.IdProducto);
    if (existente) {
      const nuevaCant = existente.cantidad + cant;
      if (producto.stockDisponible < nuevaCant) {
        setError(`Stock insuficiente para "${producto.NombreProducto}". Disponible: ${producto.stockDisponible}.`);
        return;
      }
      setCarrito(carrito.map(d => d.idProducto === producto.IdProducto
        ? { ...d, cantidad: nuevaCant, subtotal: Number((nuevaCant * d.precioUnitario).toFixed(2)) }
        : d));
    } else {
      setCarrito([...carrito, {
        idProducto: producto.IdProducto,
        nombre: producto.NombreProducto,
        cantidad: cant,
        precioUnitario: Number(producto.PrecioVentaBase),
        subtotal: Number((cant * Number(producto.PrecioVentaBase)).toFixed(2))
      }]);
    }

    setProductoSeleccionado('');
    setCantidad(1);
  };

  const quitarDetalle = (index) => {
    const nuevos = [...carrito];
    nuevos.splice(index, 1);
    setCarrito(nuevos);
  };

  const agregarPago = () => {
    setMensaje('');
    setError('');
    if (!medioSeleccionado) {
      setError('Seleccione un medio de pago.');
      return;
    }
    const monto = parseFloat(montoPago);
    if (!monto || monto <= 0) {
      setError('El monto debe ser mayor a cero.');
      return;
    }
    const medio = mediosPago.find(m => String(m.IdMedioPago) === String(medioSeleccionado));
    if (!medio) return;

    setPagosSeleccionados([
      ...pagosSeleccionados,
      { idMedioPago: medio.IdMedioPago, nombre: medio.NombreMedioPago, monto }
    ]);
    setMedioSeleccionado('');
    setMontoPago('');
  };

  const quitarPago = (index) => {
    const nuevos = [...pagosSeleccionados];
    nuevos.splice(index, 1);
    setPagosSeleccionados(nuevos);
  };

  const resetForm = () => {
    setIdCotizacion(null);
    setCotizacionSeleccionada('');
    setCotizacionInfo(null);
    setClienteSeleccionado('');
    setCarrito([]);
    setPagosSeleccionados([]);
    setProductoSeleccionado('');
    setCantidad(1);
    setMedioSeleccionado('');
    setMontoPago('');
  };

  const procesarVenta = async () => {
    setMensaje('');
    setError('');
    if (!clienteSeleccionado) {
      setError('Seleccione un cliente.');
      return;
    }
    if (carrito.length === 0) {
      setError('Agregue al menos un producto.');
      return;
    }
    if (pagosSeleccionados.length === 0) {
      setError('Agregue al menos un medio de pago.');
      return;
    }
    if (totalPagado < totalFactura) {
      setError('El monto pagado no cubre el total de la factura.');
      return;
    }

    setProcesando(true);
    try {
      const data = {
        idCliente: clienteSeleccionado,
        idCotizacion: idCotizacion ? Number(idCotizacion) : null,
        detalle: carrito.map(d => ({
          idProducto: d.idProducto,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario
        })),
        mediosPago: pagosSeleccionados.map(p => ({
          idMedioPago: p.idMedioPago,
          monto: p.monto
        }))
      };

      const res = await crearFactura(data);
      if (res.ok) {
        setFacturaCreada(res.idFactura);
        setMensaje(`Factura #${res.idFactura} generada correctamente.`);
        resetForm();
      } else {
        setError(res.mensaje || 'No se pudo procesar la factura.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || err.response?.data?.error || 'Error al procesar la factura.');
    } finally {
      setProcesando(false);
    }
  };

  const totalFactura = carrito.reduce((a, b) => a + b.subtotal, 0);
  const totalPagado = pagosSeleccionados.reduce((a, b) => a + b.monto, 0);
  const faltante = totalPagado >= totalFactura ? 0 : totalFactura - totalPagado;

  const cotizacionesDisponibles = cotizaciones.filter(c => c.Estado === 'CONFIRMADA');

  return (
    <div className="page-container">
      <h2 className="no-print">Facturación (Punto de Venta)</h2>
      <p className="no-print" style={{ color: 'var(--tinta-suave)', marginBottom: '1.5rem' }}>
        Emisión de facturas con descuento de inventario por método PEPS y múltiples medios de pago.
      </p>

      {(mensaje || error) && (
        <div className="no-print" style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          border: `1px solid ${error ? '#c0392b' : '#0e9f5e'}`,
          color: error ? '#c0392b' : '#0e9f5e',
          background: error ? '#fdecea' : '#eafaf1',
          borderRadius: '4px'
        }}>
          {error || mensaje}
        </div>
      )}

      {facturaCreada && (
        <div className="no-print" style={{
          padding: '1rem', marginBottom: '1rem', border: '2px solid #0e9f5e',
          background: '#eafaf1', borderRadius: '4px', textAlign: 'center'
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem' }}>Factura #{facturaCreada} generada correctamente.</p>
          <button className="btn-imprimir" onClick={() => navigate('/dashboard/caja')}>
            Ver / Imprimir en Caja
          </button>
        </div>
      )}

      {cargando ? (
        <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos del módulo de facturación...</p>
      ) : (
        <div className="form-container no-print">
          {/* 1. Búsqueda / selección de cotización (opcional) */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '2px dashed var(--tinta-mod)', background: 'var(--papel-2)' }}>
            <h4 style={{ marginTop: 0 }}>Cotización previa (opcional)</h4>
            {cotizacionInfo ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>
                  Cotización <strong>#{cotizacionInfo.IdCotizacion}</strong> — Cliente: <strong>{cotizacionInfo.NombreCliente}</strong>
                </span>
                <button onClick={quitarCotizacion} style={{ background: '#555', padding: '0.4rem 1rem' }}>Quitar cotización</button>
              </div>
            ) : (
              <div className="buscador-factura">
                <label style={{ fontWeight: 'bold' }}>Seleccione cotización:</label>
                <select
                  style={{ padding: '0.55rem 0.7rem', minWidth: '280px' }}
                  value={cotizacionSeleccionada}
                  onChange={(e) => setCotizacionSeleccionada(e.target.value)}
                >
                  <option value="">Sin cotización (venta directa)</option>
                  {cotizacionesDisponibles.map(c => (
                    <option key={c.IdCotizacion} value={c.IdCotizacion}>
                      #{c.IdCotizacion} - {c.NombreCliente} (Q{Number(c.MontoTotal || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
                <button onClick={handleCargarCotizacion} disabled={!cotizacionSeleccionada}>
                  Cargar
                </button>
              </div>
            )}
          </div>

          {/* 2. Selección de cliente */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 'bold' }}>Cliente:</label>
            <select
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
              value={clienteSeleccionado}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
              disabled={!!cotizacionInfo}
            >
              <option value="">Seleccione cliente...</option>
              {clientes.map(c => (
                <option key={c.IdCliente} value={c.IdCliente}>{c.NIT || c.Nit || 'CF'} - {c.Nombre}</option>
              ))}
            </select>
          </div>

          <hr />

          {/* 3. Carrito de facturación */}
          <h4>Productos a facturar</h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              style={{ flex: 1, minWidth: '200px', padding: '0.5rem' }}
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
            >
              <option value="">Seleccione producto...</option>
              {productos.map(p => (
                <option key={p.IdProducto} value={p.IdProducto} disabled={p.stockDisponible <= 0}>
                  {p.NombreProducto} (Q{Number(p.PrecioVentaBase).toFixed(2)}) — Stock: {p.stockDisponible}
                </option>
              ))}
            </select>
            <input
              type="number" min="1" value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              style={{ width: '90px', padding: '0.5rem' }}
            />
            <button onClick={agregarDetalle}>+ Agregar</button>
          </div>

          {carrito.length > 0 && (
            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--tinta)', color: '#fff' }}>
                <tr>
                  <th style={{ padding: '0.5rem' }}>Producto</th>
                  <th style={{ padding: '0.5rem' }}>Cant.</th>
                  <th style={{ padding: '0.5rem' }}>P. Unit.</th>
                  <th style={{ padding: '0.5rem' }}>Subtotal</th>
                  <th style={{ padding: '0.5rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
                    <td style={{ padding: '0.5rem' }}>{d.nombre}</td>
                    <td style={{ padding: '0.5rem' }}>{d.cantidad}</td>
                    <td style={{ padding: '0.5rem' }}>Q{d.precioUnitario.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem' }}>Q{d.subtotal.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <button onClick={() => quitarDetalle(i)} style={{ background: 'red', padding: '2px 8px' }}>x</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="3" style={{ textAlign: 'right', padding: '0.5rem' }}>TOTAL A PAGAR:</th>
                  <th style={{ padding: '0.5rem' }}>Q{totalFactura.toFixed(2)}</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          )}

          <hr style={{ margin: '1.5rem 0' }} />

          {/* 4. Cierre de pago */}
          <h4>Medios de pago</h4>
          <div className="pagos-form">
            <div>
              <label>Medio:</label>
              <select value={medioSeleccionado} onChange={(e) => setMedioSeleccionado(e.target.value)}>
                <option value="">Seleccione...</option>
                {mediosPago.map(m => (
                  <option key={m.IdMedioPago} value={m.IdMedioPago}>{m.NombreMedioPago}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Monto (Q):</label>
              <input type="number" value={montoPago} onChange={(e) => setMontoPago(e.target.value)} style={{ width: '120px' }} />
            </div>
            <button onClick={agregarPago}>+ Añadir Pago</button>
          </div>

          {pagosSeleccionados.length > 0 && (
            <div className="pagos-lista">
              {pagosSeleccionados.map((p, i) => (
                <div key={i} className="pago-item">
                  <span>{p.nombre}</span>
                  <span>Q{p.monto.toFixed(2)}</span>
                  <button onClick={() => quitarPago(i)} style={{ background: 'red', padding: '2px 8px' }}>x</button>
                </div>
              ))}
              <div style={{ marginTop: '1rem', padding: '10px', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Recibido: Q{totalPagado.toFixed(2)}</span>
                <span style={{ fontWeight: 'bold', color: faltante === 0 ? 'green' : 'red' }}>
                  {faltante === 0 ? 'Pago completo' : `Faltante: Q${faltante.toFixed(2)}`}
                </span>
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <button
              className="btn-submit"
              onClick={procesarVenta}
              disabled={procesando || carrito.length === 0 || totalPagado < totalFactura}
            >
              {procesando ? 'Procesando...' : 'Procesar Venta (PEPS)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacturacionPage;
