import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getClientes } from '../services/clientesService';
import { getProductos } from '../services/productosService';
import { getMediosPago } from '../services/mediosPagoService';
import { getCotizaciones, getCotizacionDetalle } from '../services/cotizacionesService';
import { crearFactura, getStockDisponible } from '../services/facturasService';
import { useModal } from '../context/ModalContext';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';

// @Javi: Modulo de Facturacion (Punto de Venta)
const FacturacionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useModal();
  const idCotizacionInit = location.state?.idCotizacion || null;

  // Catalogos
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);

  // Cotizacion previa
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

  // Estados de carga y validaciones
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorInline, setErrorInline] = useState('');
  const [errorPago, setErrorPago] = useState('');

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
      console.error('Error al cargar catalogos de facturacion:', err);
      setErrorInline('No se pudieron cargar los catalogos. Revisa la conexion.');
    } finally {
      setCargando(false);
    }
  };

  const cargarCotizacion = async (idCot) => {
    try {
      const coti = await getCotizacionDetalle(idCot);
      if (!coti || !coti.encabezado) {
        setErrorInline('No se encontro la cotizacion seleccionada.');
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
      setErrorInline('');
    } catch (err) {
      console.error('Error al cargar la cotizacion:', err);
      setErrorInline('Error al cargar la cotizacion.');
    }
  };

  const handleCargarCotizacion = () => {
    if (!cotizacionSeleccionada) {
      setErrorInline('Seleccione una cotizacion para cargar.');
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
    setErrorInline('');
  };

  const agregarDetalle = () => {
    setErrorInline('');
    if (!productoSeleccionado) {
      setErrorInline('Seleccione un producto para agregar.');
      return;
    }
    const cant = parseInt(cantidad, 10);
    if (isNaN(cant) || cant <= 0) {
      setErrorInline('La cantidad debe ser mayor a cero.');
      return;
    }
    const producto = productos.find(p => String(p.IdProducto) === String(productoSeleccionado));
    if (!producto) return;

    const precio = parseFloat(producto.PrecioVentaBase);
    if (isNaN(precio) || precio <= 0) {
      setErrorInline('El producto no tiene un precio valido mayor a cero.');
      return;
    }

    if (producto.stockDisponible < cant) {
      setErrorInline(`Stock insuficiente para "${producto.NombreProducto}". Disponible: ${producto.stockDisponible}.`);
      return;
    }

    const existente = carrito.find(d => d.idProducto === producto.IdProducto);
    if (existente) {
      const nuevaCant = existente.cantidad + cant;
      if (producto.stockDisponible < nuevaCant) {
        setErrorInline(`Stock insuficiente para "${producto.NombreProducto}". Disponible: ${producto.stockDisponible}.`);
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
    setErrorPago('');
    if (!medioSeleccionado) {
      setErrorPago('Seleccione un medio de pago.');
      return;
    }
    const monto = parseFloat(montoPago);
    if (isNaN(monto) || monto <= 0) {
      setErrorPago('El monto debe ser un numero mayor a cero.');
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
    setErrorInline('');
    setErrorPago('');
  };

  const totalFactura = carrito.reduce((a, b) => a + b.subtotal, 0);
  const totalPagado = pagosSeleccionados.reduce((a, b) => a + b.monto, 0);
  const faltante = totalPagado >= totalFactura ? 0 : totalFactura - totalPagado;

  const procesarVenta = async () => {
    setErrorInline('');
    if (!clienteSeleccionado) {
      setErrorInline('Seleccione un cliente.');
      return;
    }
    if (carrito.length === 0) {
      setErrorInline('Agregue al menos un producto al carrito.');
      return;
    }
    if (pagosSeleccionados.length === 0) {
      setErrorPago('Agregue al menos un medio de pago.');
      return;
    }
    if (totalPagado < totalFactura) {
      setErrorPago('El monto pagado no cubre el total de la factura.');
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
        const idGenerado = res.idFactura;
        const totalVenta = totalFactura.toFixed(2);
        resetForm();
        // Pop-up con ilustracion de exito (cuadro 2)
        mostrarExito({
          titulo: `Factura #${idGenerado} Generada`,
          mensaje: `La venta se registro exitosamente por un total de Q${totalVenta}. El stock de inventario fue actualizado.`,
          botonTexto: 'Aceptar',
          botonSecundarioTexto: 'Ver en Caja',
          onAccionSecundaria: () => navigate('/dashboard/caja')
        });
      } else {
        mostrarError({
          titulo: 'Error al Facturar',
          mensaje: res.mensaje || 'No se pudo procesar la factura.'
        });
      }
    } catch (err) {
      console.error(err);
      mostrarError({
        titulo: 'Fallo de Transaccion',
        mensaje: err.response?.data?.mensaje || err.response?.data?.error || 'Error al procesar la factura.'
      });
    } finally {
      setProcesando(false);
    }
  };

  const cotizacionesDisponibles = cotizaciones.filter(c => c.Estado === 'CONFIRMADA');

  return (
    <div className="page-container">
      <h2 className="no-print">Facturacion (Punto de Venta)</h2>
      <p className="no-print" style={{ color: 'var(--tinta-suave)', marginBottom: '1.5rem' }}>
        Emision de facturas y registro de pagos con multiples medios de pago.
      </p>

      {cargando ? (
        <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos de facturacion...</p>
      ) : (
        <div className="form-container no-print">
          {/* 1. Cotizacion previa */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '2px dashed var(--tinta-mod)', background: 'var(--papel-2)' }}>
            <h4 style={{ marginTop: 0 }}>Cotizacion previa (opcional)</h4>
            {cotizacionInfo ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>
                  Cotizacion <strong>#{cotizacionInfo.IdCotizacion}</strong> — Cliente: <strong>{cotizacionInfo.NombreCliente}</strong>
                </span>
                <button onClick={quitarCotizacion} style={{ background: '#555', padding: '0.4rem 1rem' }}>Quitar cotizacion</button>
              </div>
            ) : (
              <div className="buscador-factura">
                <label style={{ fontWeight: 'bold' }}>Seleccione cotizacion:</label>
                <select
                  style={{ padding: '0.55rem 0.7rem', minWidth: '280px' }}
                  value={cotizacionSeleccionada}
                  onChange={(e) => setCotizacionSeleccionada(e.target.value)}
                >
                  <option value="">Sin cotizacion (venta directa)</option>
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

          {/* 2. Cliente */}
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

          {/* 3. Carrito */}
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

          {errorInline && (
            <p style={{ color: '#c0392b', fontWeight: 'bold', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              {errorInline}
            </p>
          )}

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

          {/* 4. Medios de pago */}
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
              <input type="number" step="0.01" min="0.01" placeholder="0.01" value={montoPago} onChange={(e) => setMontoPago(e.target.value)} style={{ width: '120px' }} />
            </div>
            <button onClick={agregarPago}>+ Anadir Pago</button>
          </div>

          {errorPago && (
            <p style={{ color: '#c0392b', fontWeight: 'bold', margin: '0.4rem 0 0 0', fontSize: '0.9rem' }}>
              {errorPago}
            </p>
          )}

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
              className="btn-submit btn-facturar-prominente"
              onClick={procesarVenta}
              disabled={procesando || carrito.length === 0 || totalPagado < totalFactura}
            >
              {procesando ? 'PROCESANDO FACTURA...' : 'EMITIR FACTURA (REGISTRAR VENTA)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacturacionPage;
