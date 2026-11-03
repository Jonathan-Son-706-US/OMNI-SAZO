import React, { useState, useEffect } from 'react';
import { getCotizaciones, getCotizacionDetalle, confirmarCotizacion, createCotizacion } from '../services/cotizacionesService';
import { getClientes } from '../services/clientesService';
import { getProductos } from '../services/productosService';
import { useModal } from '../context/ModalContext';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';
import { useNavigate } from 'react-router-dom';

const CotizacionPage = () => {
  const [activeTab, setActiveTab] = useState('nueva'); // 'nueva', 'historial', 'detalle'
  const { mostrarExito, mostrarError } = useModal();
  
  // estados para nueva cotizacion (los originales)
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [detallesCotizacion, setDetallesCotizacion] = useState([]);
  const [mensajeCotizacion, setMensajeCotizacion] = useState('');

  // estados para historial
  const [cotizaciones, setCotizaciones] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]); // @abner: filtro inicializado hoy
  
  // estados para detalle
  const [cotizacionDetalle, setCotizacionDetalle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const cl = await getClientes();
      const pr = await getProductos();
      setClientes(cl || []);
      setProductos(pr || []);
      
      const coti = await getCotizaciones();
      setCotizaciones(coti || []);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };

  // logica para nueva cotizacion
  const agregarDetalle = () => {
    if (!productoSeleccionado || cantidad <= 0) {
      setMensajeCotizacion('Selecciona un producto y cantidad valida.');
      return;
    }
    const productoObj = productos.find(p => p.IdProducto === parseInt(productoSeleccionado, 10));
    if (!productoObj) return;

    const subtotal = productoObj.PrecioVentaBase * cantidad;
    setDetallesCotizacion([...detallesCotizacion, {
      idProducto: productoObj.IdProducto,
      nombre: productoObj.NombreProducto,
      cantidad: cantidad,
      precioUnitario: productoObj.PrecioVentaBase,
      subtotal: subtotal
    }]);
    setMensajeCotizacion('');
    setProductoSeleccionado('');
    setCantidad(1);
  };

  const eliminarDetalle = (index) => {
    const nuevos = [...detallesCotizacion];
    nuevos.splice(index, 1);
    setDetallesCotizacion(nuevos);
  };

  const calcularTotal = () => {
    return detallesCotizacion.reduce((acc, curr) => acc + curr.subtotal, 0);
  };

  const handleCrearCotizacion = async (e) => {
    e.preventDefault();
    if (!clienteSeleccionado) {
      setMensajeCotizacion('Debes seleccionar un cliente.');
      return;
    }
    if (detallesCotizacion.length === 0) {
      setMensajeCotizacion('La cotizacion debe tener al menos un producto.');
      return;
    }
    
    try {
      const total = calcularTotal();
      const data = {
        idCliente: clienteSeleccionado,
        total: total,
        detalles: detallesCotizacion
      };
      
      await createCotizacion(data);
      setDetallesCotizacion([]);
      setClienteSeleccionado('');
      setMensajeCotizacion('');
      
      // recargar historial
      const coti = await getCotizaciones();
      setCotizaciones(coti || []);
      
      // Pop-up de exito
      mostrarExito({
        titulo: 'Cotizacion Creada',
        mensaje: `La cotizacion fue guardada exitosamente por un monto total de Q${total.toFixed(2)}.`,
        botonTexto: 'Ver en Historial',
        onConfirmar: () => setActiveTab('historial')
      });
    } catch (error) {
      console.error('Error al crear cotizacion:', error);
      mostrarError({
        titulo: 'Error al Guardar',
        mensaje: 'Ocurrio un problema al guardar la cotizacion en la base de datos.'
      });
    }
  };

  // logica para historial y detalle (@abner)
  const verDetalle = async (idCotizacion) => {
    try {
      const data = await getCotizacionDetalle(idCotizacion);
      setCotizacionDetalle(data);
      setActiveTab('detalle');
    } catch (error) {
      console.error('Error al ver detalle:', error);
    }
  };

  const handleConfirmar = async (idCotizacion) => {
    try {
      await confirmarCotizacion(idCotizacion);
      verDetalle(idCotizacion);
      const coti = await getCotizaciones();
      setCotizaciones(coti || []);

      mostrarExito({
        titulo: `Cotizacion #${idCotizacion} Confirmada`,
        mensaje: 'La cotizacion ha sido confirmada. Ahora se encuentra lista para ser facturada en Caja.',
        botonTexto: 'Aceptar',
        botonSecundarioTexto: 'Ir a Facturar',
        onAccionSecundaria: () => handleFacturar(idCotizacion)
      });
    } catch (error) {
      console.error('Error al confirmar:', error);
      mostrarError({
        titulo: 'Error al Confirmar',
        mensaje: 'No se pudo confirmar la cotizacion.'
      });
    }
  };

  const handleFacturar = (idCotizacion) => {
    navigate('/dashboard/facturacion', { state: { idCotizacion } });
  };

  // @abner: filtrar cotizaciones por fecha
  const cotizacionesFiltradas = cotizaciones.filter(c => {
    if (!fechaFiltro) return true;
    const fDate = new Date(c.Fecha).toISOString().split('T')[0];
    return fDate === fechaFiltro;
  });

  return (
    <div className="page-container">
      <h2>Modulo de Cotizaciones</h2>

      {/* pestañas */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'nueva' ? 'tab-activa' : ''}`}
          onClick={() => setActiveTab('nueva')}
        >
          Nueva Cotizacion
        </button>
        <button 
          className={`tab-btn ${activeTab === 'historial' ? 'tab-activa' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          Historial
        </button>
        {activeTab === 'detalle' && (
          <button className="tab-btn tab-activa">
            Detalle #{cotizacionDetalle?.encabezado?.IdCotizacion}
          </button>
        )}
      </div>

      {/* Pestaña: Nueva */}
      {activeTab === 'nueva' && (
        <div className="tab-contenido">
          <div className="form-container">
            <h3>Crear Nueva Cotizacion</h3>
            {mensajeCotizacion && <p style={{ color: 'red', fontWeight: 'bold' }}>{mensajeCotizacion}</p>}
            <form onSubmit={handleCrearCotizacion}>
              <div>
                <label>Cliente:</label>
                <select 
                  value={clienteSeleccionado} 
                  onChange={e => setClienteSeleccionado(e.target.value)}
                >
                  <option value="">Seleccione cliente...</option>
                  {clientes.map(c => (
                    <option key={c.IdCliente} value={c.IdCliente}>
                      {c.NIT} - {c.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Producto:</label>
                <select 
                  value={productoSeleccionado} 
                  onChange={e => setProductoSeleccionado(e.target.value)}
                >
                  <option value="">Seleccione producto...</option>
                  {productos.map(p => (
                    <option key={p.IdProducto} value={p.IdProducto}>
                      {p.NombreProducto} - Q{Number(p.PrecioVentaBase).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Cantidad:</label>
                <input 
                  type="number" 
                  min="1" 
                  value={cantidad} 
                  onChange={e => setCantidad(parseInt(e.target.value, 10) || 1)} 
                />
              </div>

              <button type="button" onClick={agregarDetalle} style={{ marginBottom: '1rem' }}>
                + Agregar a la Cotizacion
              </button>
            </form>

            {/* Tabla resumen de lo que va cotizando */}
            {detallesCotizacion.length > 0 && (
              <div className="table-container" style={{ marginTop: '1rem' }}>
                <h4>Detalle Temporal</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th>Subtotal</th>
                      <th>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detallesCotizacion.map((d, index) => (
                      <tr key={index}>
                        <td>{d.nombre}</td>
                        <td>{d.cantidad}</td>
                        <td>Q{Number(d.precioUnitario).toFixed(2)}</td>
                        <td>Q{Number(d.subtotal).toFixed(2)}</td>
                        <td>
                          <button 
                            type="button" 
                            onClick={() => eliminarDetalle(index)}
                            style={{ background: '#d32f2f' }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="3" style={{ textAlign: 'right' }}>Total:</th>
                      <th colSpan="2">Q{calcularTotal().toFixed(2)}</th>
                    </tr>
                  </tfoot>
                </table>

                <div style={{ marginTop: '1.5rem' }}>
                  <button onClick={handleCrearCotizacion} className="btn-submit">
                    Guardar Cotizacion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pestaña: Historial */}
      {activeTab === 'historial' && (
        <div className="tab-contenido">
          <div className="form-container" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label>Filtrar por Fecha:</label>
            <input 
              type="date" 
              value={fechaFiltro} 
              onChange={e => setFechaFiltro(e.target.value)} 
            />
            <button onClick={() => setFechaFiltro('')} style={{ background: '#555' }}>
              Ver Todas
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No hay cotizaciones para mostrar.</td>
                  </tr>
                ) : (
                  cotizacionesFiltradas.map(c => (
                    <tr key={c.IdCotizacion}>
                      <td>{c.IdCotizacion}</td>
                      <td>{new Date(c.Fecha).toLocaleDateString()}</td>
                      <td>{c.NombreCliente}</td>
                      <td>Q{Number(c.MontoTotal).toFixed(2)}</td>
                      <td>
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: c.Estado === 'CONFIRMADA' ? '#10b981' : '#f59e0b' 
                        }}>
                          {c.Estado}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => verDetalle(c.IdCotizacion)}>
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pestaña: Detalle */}
      {activeTab === 'detalle' && cotizacionDetalle && (
        <div className="tab-contenido">
          <div className="form-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3>Cotizacion #{cotizacionDetalle.encabezado.IdCotizacion}</h3>
                <p><strong>Cliente:</strong> {cotizacionDetalle.encabezado.NombreCliente}</p>
                <p><strong>Fecha:</strong> {new Date(cotizacionDetalle.encabezado.Fecha).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p>
                  <strong>Estado: </strong> 
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: cotizacionDetalle.encabezado.Estado === 'CONFIRMADA' ? '#10b981' : '#f59e0b' 
                  }}>
                    {cotizacionDetalle.encabezado.Estado}
                  </span>
                </p>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {cotizacionDetalle.encabezado.Estado === 'PENDIENTE' && (
                    <button 
                      onClick={() => handleConfirmar(cotizacionDetalle.encabezado.IdCotizacion)}
                      style={{ background: '#10b981' }}
                    >
                      Confirmar Cotizacion
                    </button>
                  )}
                  {cotizacionDetalle.encabezado.Estado === 'CONFIRMADA' && (
                    <button 
                      className="btn-imprimir"
                      onClick={() => handleFacturar(cotizacionDetalle.encabezado.IdCotizacion)}
                    >
                      Facturar y Cobrar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <hr />

            <div className="table-container" style={{ marginTop: 0, boxShadow: 'none', border: 'none' }}>
              <table style={{ minWidth: '100%' }}>
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Producto</th>
                    <th>Precio U.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cotizacionDetalle.detalle.map(d => (
                    <tr key={d.IdCotizacionDetalle}>
                      <td>{d.Cantidad}</td>
                      <td>{d.NombreProducto}</td>
                      <td>Q{Number(d.PrecioUnitario).toFixed(2)}</td>
                      <td>Q{Number(d.Subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3" style={{ textAlign: 'right' }}>TOTAL:</th>
                    <th>
                      Q{cotizacionDetalle.detalle.reduce((sum, item) => sum + Number(item.Subtotal), 0).toFixed(2)}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style={{ marginTop: '1.5rem' }}>
              <button onClick={() => setActiveTab('historial')} style={{ background: '#555' }}>
                Volver al historial
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CotizacionPage;
