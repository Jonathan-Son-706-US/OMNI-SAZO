import React, { useState, useEffect } from 'react';
import '../components/estilos/MediosPago.css';
import { getProveedores } from '../services/proveedoresService';
import { getProductos } from '../services/productosService';
import { getBodegas, getUbicaciones } from '../services/catalogosService';
import {
  getOrdenesCompra,
  getOrdenesPendientes,
  getRecepcionOrden,
  crearOrdenCompra,
  registrarRecepcion
} from '../services/comprasService';
import { useModal } from '../context/ModalContext';

// Modulo de Compras e Ingreso a Bodega
const ComprasPage = () => {
  const [activeTab, setActiveTab] = useState('ordenes');
  const { mostrarExito, mostrarError } = useModal();

  // Catalogos y listados
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [errorOrden, setErrorOrden] = useState('');
  const [errorRecepcion, setErrorRecepcion] = useState('');

  // Fase 1: Orden de Compra
  const [idProveedor, setIdProveedor] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [detalleOrden, setDetalleOrden] = useState([]);
  const [guardandoOrden, setGuardandoOrden] = useState(false);

  // Fase 2: Ingreso a Bodega
  const [idOrdenCompraRecepcion, setIdOrdenCompraRecepcion] = useState('');
  const [detalleRecepcion, setDetalleRecepcion] = useState([]);
  const [cargandoRecepcion, setCargandoRecepcion] = useState(false);
  const [guardandoRecepcion, setGuardandoRecepcion] = useState(false);

  const hoy = new Date().toISOString().slice(0, 10);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prov, prod, bod, ub, ord, ordPen] = await Promise.all([
        getProveedores(),
        getProductos(),
        getBodegas(),
        getUbicaciones(),
        getOrdenesCompra(),
        getOrdenesPendientes()
      ]);
      setProveedores(Array.isArray(prov) ? prov : []);
      setProductos(Array.isArray(prod) ? prod : []);
      setBodegas(Array.isArray(bod) ? bod : []);
      setUbicaciones(Array.isArray(ub) ? ub : []);
      setOrdenes(Array.isArray(ord) ? ord : []);
      setOrdenesPendientes(Array.isArray(ordPen) ? ordPen : []);
    } catch (err) {
      console.error('Error al cargar datos del modulo de compras:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarMensajes = () => {
    setErrorOrden('');
    setErrorRecepcion('');
  };

  // Fase 1: Orden de compra
  const agregarProductoOrden = () => {
    setErrorOrden('');
    if (!productoSeleccionado) {
      setErrorOrden('Seleccione un producto.');
      return;
    }
    const cantidad = parseInt(cantidadProducto, 10);
    if (!cantidad || cantidad <= 0) {
      setErrorOrden('La cantidad debe ser mayor a cero.');
      return;
    }

    const producto = productos.find(p => String(p.IdProducto) === String(productoSeleccionado));
    const existente = detalleOrden.find(d => d.idProducto === producto.IdProducto);

    if (existente) {
      setDetalleOrden(detalleOrden.map(d =>
        d.idProducto === producto.IdProducto ? { ...d, cantidad: d.cantidad + cantidad } : d
      ));
    } else {
      setDetalleOrden([...detalleOrden, { idProducto: producto.IdProducto, nombreProducto: producto.NombreProducto, cantidad }]);
    }

    setProductoSeleccionado('');
    setCantidadProducto(1);
  };

  const eliminarProductoOrden = (idProducto) => {
    setDetalleOrden(detalleOrden.filter(d => d.idProducto !== idProducto));
  };

  const generarOrden = async () => {
    setErrorOrden('');
    if (!idProveedor) {
      setErrorOrden('Seleccione un proveedor.');
      return;
    }
    if (detalleOrden.length === 0) {
      setErrorOrden('Agregue al menos un producto al detalle.');
      return;
    }

    setGuardandoOrden(true);
    try {
      const payload = {
        idProveedor: Number(idProveedor),
        detalles: detalleOrden.map(d => ({ idProducto: d.idProducto, cantidad: d.cantidad }))
      };
      const res = await crearOrdenCompra(payload);
      if (res.ok) {
        setIdProveedor('');
        setDetalleOrden([]);
        cargarDatos();
        mostrarExito({
          titulo: 'Orden Generada',
          mensaje: res.mensaje || 'Orden de compra generada exitosamente.',
          botonTexto: 'Aceptar'
        });
      } else {
        mostrarError({
          titulo: 'Error al Generar',
          mensaje: res.mensaje || 'No se pudo generar la orden de compra.'
        });
      }
    } catch (err) {
      console.error(err);
      mostrarError({
        titulo: 'Fallo al Guardar',
        mensaje: err.response?.data?.mensaje || 'Error al generar la orden de compra.'
      });
    } finally {
      setGuardandoOrden(false);
    }
  };

  // Fase 2: Recepcion e ingreso a bodega
  const cargarDetalleRecepcion = async () => {
    setErrorRecepcion('');
    if (!idOrdenCompraRecepcion) {
      setErrorRecepcion('Seleccione una orden pendiente.');
      return;
    }

    setCargandoRecepcion(true);
    try {
      const detalle = await getRecepcionOrden(idOrdenCompraRecepcion);
      const items = (Array.isArray(detalle) ? detalle : []).map(linea => {
        const solicitada = Number(linea.CantidadSolicitada || 0);
        const yaRecibido = Number(linea.CantidadRecibida || 0);
        const pendiente = linea.CantidadPendiente !== undefined 
          ? Number(linea.CantidadPendiente) 
          : Math.max(0, solicitada - yaRecibido);
        return {
          idOrdenCompraDetalle: linea.IdOrdenCompraDetalle,
          idProducto: linea.IdProducto,
          nombreProducto: linea.NombreProducto,
          cantidadSolicitada: solicitada,
          yaRecibido: yaRecibido,
          cantidadPendiente: pendiente,
          cantidadRecibida: pendiente,
          idUbicacion: '',
          numeroLote: '',
          costoUnitario: '',
          manejaLote: linea.ManejaLote
        };
      });
      setDetalleRecepcion(items);
    } catch (err) {
      console.error(err);
      setErrorRecepcion('Error al cargar el detalle de la orden.');
    } finally {
      setCargandoRecepcion(false);
    }
  };

  const actualizarItemRecepcion = (index, campo, valor) => {
    setDetalleRecepcion(prev => prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)));
  };

  const confirmarIngreso = async () => {
    setErrorRecepcion('');
    if (!idOrdenCompraRecepcion) {
      setErrorRecepcion('Seleccione una orden pendiente.');
      return;
    }
    if (detalleRecepcion.length === 0) {
      setErrorRecepcion('Cargue el detalle de la orden antes de ingresar a bodega.');
      return;
    }

    for (const item of detalleRecepcion) {
      if (!item.idUbicacion) {
        setErrorRecepcion('Asigne la ubicacion (bodega) de todos los productos.');
        return;
      }
      if (!item.cantidadRecibida || Number(item.cantidadRecibida) <= 0) {
        setErrorRecepcion('Las cantidades recibidas deben ser mayores a cero.');
        return;
      }
      if (Number(item.cantidadRecibida) > item.cantidadPendiente) {
        setErrorRecepcion(`La cantidad a recibir de "${item.nombreProducto}" no puede superar el saldo pendiente (${item.cantidadPendiente}).`);
        return;
      }
      if (item.costoUnitario === '' || Number(item.costoUnitario) < 0) {
        setErrorRecepcion('Ingrese un costo unitario valido (0 o mayor).');
        return;
      }
    }

    setGuardandoRecepcion(true);
    try {
      const payload = {
        idOrdenCompra: Number(idOrdenCompraRecepcion),
        items: detalleRecepcion.map(item => ({
          idOrdenCompraDetalle: item.idOrdenCompraDetalle,
          idProducto: item.idProducto,
          cantidadRecibida: Number(item.cantidadRecibida),
          idUbicacion: Number(item.idUbicacion),
          numeroLote: item.numeroLote ? String(item.numeroLote) : null,
          costoUnitario: Number(item.costoUnitario)
        }))
      };
      const res = await registrarRecepcion(payload);
      if (res.ok) {
        setIdOrdenCompraRecepcion('');
        setDetalleRecepcion([]);
        cargarDatos();
        mostrarExito({
          titulo: 'Ingreso a Bodega Registrado',
          mensaje: res.mensaje || 'Los productos han sido ingresados al stock de bodega exitosamente.',
          botonTexto: 'Aceptar'
        });
      } else {
        mostrarError({
          titulo: 'Error en Ingreso',
          mensaje: res.mensaje || 'No se pudo registrar el ingreso.'
        });
      }
    } catch (err) {
      console.error(err);
      mostrarError({
        titulo: 'Fallo al Ingresar',
        mensaje: err.response?.data?.mensaje || 'Error al registrar el ingreso a bodega.'
      });
    } finally {
      setGuardandoRecepcion(false);
    }
  };

  const ubicacionesPorBodega = (idBodega) => ubicaciones.filter(u => String(u.IdBodega) === String(idBodega));

  return (
    <div className="page-container">
      <h2 className="no-print">Modulo de Compras e Ingreso a Bodega</h2>
      <p style={{ color: 'var(--tinta-suave)', marginBottom: '1.5rem' }}>
        Gestion de ordenes de compra, recepcion de mercaderia e ingreso a bodega por lotes.
      </p>

      {/* Pestañas */}
      <div className="tabs-container no-print">
        <button
          className={`tab-btn ${activeTab === 'ordenes' ? 'tab-activa' : ''}`}
          onClick={() => { setActiveTab('ordenes'); limpiarMensajes(); }}
        >
          Generar Orden de Compra
        </button>
        <button
          className={`tab-btn ${activeTab === 'ingreso' ? 'tab-activa' : ''}`}
          onClick={() => { setActiveTab('ingreso'); limpiarMensajes(); }}
        >
          Ingreso a Bodega (Lotes)
        </button>
        <button
          className={`tab-btn ${activeTab === 'historial' ? 'tab-activa' : ''}`}
          onClick={() => { setActiveTab('historial'); limpiarMensajes(); }}
        >
          Historial de Compras
        </button>
      </div>

      {cargando ? (
        <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos del modulo de compras...</p>
      ) : (
        <>
          {/* Pestaña 1: Orden de Compra */}
          {activeTab === 'ordenes' && (
            <div className="tab-contenido seccion-modulo">
              <h3>Generar Orden de Compra</h3>

              <div className="info-vacia" style={{ border: '2px dashed var(--tinta-mod)', padding: '2rem', textAlign: 'left', fontStyle: 'normal' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontWeight: 'bold' }}>Proveedor:</label>
                    <select
                      style={{ width: '100%', padding: '0.5rem' }}
                      value={idProveedor}
                      onChange={(e) => setIdProveedor(e.target.value)}
                    >
                      <option value="">Seleccione Proveedor</option>
                      {proveedores.map(p => (
                        <option key={p.IdProveedor} value={p.IdProveedor}>{p.NombreProveedor}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: 'bold' }}>Fecha de Emision:</label>
                    <input type="date" style={{ width: '100%', padding: '0.5rem' }} value={hoy} readOnly />
                  </div>
                </div>

                <h4 style={{ marginTop: '1rem', borderBottom: '1px solid #ccc' }}>Detalle de Productos a Comprar</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <select
                    style={{ flex: 1, minWidth: '200px', padding: '0.5rem' }}
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map(p => (
                      <option key={p.IdProducto} value={p.IdProducto}>{p.NombreProducto}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    min="1"
                    style={{ width: '100px', padding: '0.5rem' }}
                    value={cantidadProducto}
                    onChange={(e) => setCantidadProducto(e.target.value)}
                  />
                  <button
                    style={{ padding: '0.5rem 1rem', background: 'var(--tinta-mod)', color: '#fff', border: 'none' }}
                    onClick={agregarProductoOrden}
                  >
                    + Agregar
                  </button>
                </div>

                {errorOrden && (
                  <p style={{ color: '#c0392b', fontWeight: 'bold', margin: '0.5rem 0' }}>
                    {errorOrden}
                  </p>
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--papel-2)' }}>
                      <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Producto</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Cantidad</th>
                      <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleOrden.length === 0 ? (
                      <tr><td colSpan="3" className="info-vacia">No hay productos en el detalle</td></tr>
                    ) : (
                      detalleOrden.map(d => (
                        <tr key={d.idProducto}>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{d.nombreProducto}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{d.cantidad}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                            <button
                              onClick={() => eliminarProductoOrden(d.idProducto)}
                              style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '0.25rem 0.6rem', cursor: 'pointer' }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    className="btn-imprimir"
                    style={{ padding: '0.75rem 2rem', fontWeight: 'bold' }}
                    onClick={generarOrden}
                    disabled={guardandoOrden}
                  >
                    {guardandoOrden ? 'Generando...' : 'GENERAR ORDEN DE COMPRA'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña 2: Ingreso a Bodega */}
          {activeTab === 'ingreso' && (
            <div className="tab-contenido seccion-modulo">
              <h3>Recepcion de Mercaderia (Ingreso a Lotes)</h3>

              <div className="buscador-factura">
                <label style={{ fontWeight: 'bold' }}>Buscar Compra PENDIENTE / PARCIAL:</label>
                <select
                  style={{ padding: '0.55rem 0.7rem', width: '320px' }}
                  value={idOrdenCompraRecepcion}
                  onChange={(e) => { setIdOrdenCompraRecepcion(e.target.value); setDetalleRecepcion([]); }}
                >
                  <option value="">Seleccione la orden</option>
                  {ordenesPendientes.map(o => (
                    <option key={o.IdOrdenCompra} value={o.IdOrdenCompra}>
                      Orden #{o.IdOrdenCompra} - {o.NombreProveedor} ({o.Estado})
                    </option>
                  ))}
                </select>
                <button
                  style={{ padding: '0.55rem 1rem' }}
                  onClick={cargarDetalleRecepcion}
                  disabled={cargandoRecepcion}
                >
                  {cargandoRecepcion ? 'Cargando...' : 'Cargar Detalle'}
                </button>
              </div>

              {errorRecepcion && (
                <p style={{ color: '#c0392b', fontWeight: 'bold', margin: '0.6rem 0' }}>
                  {errorRecepcion}
                </p>
              )}

              {detalleRecepcion.length > 0 && (
                <div style={{ border: '2px solid var(--tinta)', padding: '1rem', background: 'var(--papel-2)', marginTop: '1rem' }}>
                  <p>
                    <strong>Instruccion:</strong> Asigne la cantidad a recibir, la ubicacion (bodega), el numero de lote y el costo unitario de compra.
                  </p>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: '#fff' }}>
                    <thead>
                      <tr style={{ background: 'var(--tinta)', color: '#fff' }}>
                        <th style={{ padding: '0.5rem' }}>Producto</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Cant. Pedida</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Ya Recibido</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Saldo Pendiente</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>A Recibir Hoy</th>
                        <th style={{ padding: '0.5rem' }}>Ubicacion (Bodega)</th>
                        <th style={{ padding: '0.5rem' }}>Numero de Lote</th>
                        <th style={{ padding: '0.5rem' }}>Costo Unit.</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Tipo Ingreso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleRecepcion.map((item, index) => (
                        <tr key={item.idOrdenCompraDetalle}>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{item.nombreProducto}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd', textAlign: 'center' }}>{item.cantidadSolicitada}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd', textAlign: 'center', color: '#666' }}>{item.yaRecibido}</td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: item.cantidadPendiente > 0 ? '#b54708' : '#027a48' }}>
                            {item.cantidadPendiente}
                          </td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              max={item.cantidadPendiente}
                              style={{ width: '70px', padding: '0.3rem', textAlign: 'center' }}
                              value={item.cantidadRecibida}
                              onChange={(e) => actualizarItemRecepcion(index, 'cantidadRecibida', e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                            <select
                              style={{ padding: '0.3rem', maxWidth: '170px' }}
                              value={item.idUbicacion}
                              onChange={(e) => actualizarItemRecepcion(index, 'idUbicacion', e.target.value)}
                            >
                              <option value="">Seleccione bodega</option>
                              {bodegas.map(b => (
                                <optgroup key={b.IdBodega} label={b.NombreBodega}>
                                  {ubicacionesPorBodega(b.IdBodega).map(u => (
                                    <option key={u.IdUbicacion} value={u.IdUbicacion}>
                                      {u.CodigoUbicacion || u.Descripcion || `Ubicación #${u.IdUbicacion}`}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                            <input
                              type="text"
                              placeholder={item.manejaLote ? 'Ej. L-2025-01' : 'Sin lote'}
                              style={{ width: '110px', padding: '0.3rem' }}
                              value={item.numeroLote}
                              onChange={(e) => actualizarItemRecepcion(index, 'numeroLote', e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              style={{ width: '80px', padding: '0.3rem' }}
                              value={item.costoUnitario}
                              onChange={(e) => actualizarItemRecepcion(index, 'costoUnitario', e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              background: Number(item.cantidadRecibida) === item.cantidadPendiente ? '#d1fae5' : '#fef3c7',
                              color: Number(item.cantidadRecibida) === item.cantidadPendiente ? '#065f46' : '#92400e'
                            }}>
                              {Number(item.cantidadRecibida) === item.cantidadPendiente ? 'Completo' : 'Parcial'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                      style={{ background: '#0e9f5e', color: 'white', padding: '0.75rem 2rem', fontWeight: 'bold', border: 'none' }}
                      onClick={confirmarIngreso}
                      disabled={guardandoRecepcion}
                    >
                      {guardandoRecepcion ? 'Procesando...' : 'INGRESAR A BODEGA (Crear Lotes)'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pestaña 3: Historial */}
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
                  {ordenes.length === 0 ? (
                    <tr><td colSpan="5" className="info-vacia">No hay ordenes de compra registradas</td></tr>
                  ) : (
                    ordenes.map(compra => (
                      <tr key={compra.IdOrdenCompra} style={{ borderBottom: '1px solid #ccc' }}>
                        <td style={{ padding: '0.75rem' }}>{compra.IdOrdenCompra}</td>
                        <td style={{ padding: '0.75rem' }}>{compra.NombreProveedor}</td>
                        <td style={{ padding: '0.75rem' }}>{compra.FechaEmision ? new Date(compra.FechaEmision).toLocaleDateString('es-GT') : '—'}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                          Q{Number(compra.MontoTotal || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span className={`badge-estado ${compra.Estado === 'RECIBIDO' ? 'badge-confirmada' : 'badge-pendiente'}`}>
                            {compra.Estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComprasPage;
