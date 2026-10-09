import React, { useState, useEffect } from 'react';
import { getCotizaciones, getCotizacionDetalle, confirmarCotizacion, createCotizacion } from '../services/cotizacionesService';
import { getClientes } from '../services/clientesService';
import { getProductos } from '../services/productosService';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';
import { useNavigate } from 'react-router-dom';

const CotizacionPage = () => {
  const [activeTab, setActiveTab] = useState('nueva'); // 'nueva', 'historial', 'detalle'
  
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
      setClientes(cl);
      setProductos(pr);
      
      const coti = await getCotizaciones();
      setCotizaciones(coti);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };

  // --- logica para nueva cotizacion (la de tu colega) ---
  const agregarDetalle = () => {
    if (!productoSeleccionado || cantidad <= 0) {
      setMensajeCotizacion('Selecciona un producto y cantidad válida.');
      return;
    }
    const productoObj = productos.find(p => p.IdProducto === parseInt(productoSeleccionado));
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
      setMensajeCotizacion('La cotización debe tener al menos un producto.');
      return;
    }
    
    try {
      const data = {
        idCliente: clienteSeleccionado,
        total: calcularTotal(),
        detalles: detallesCotizacion
      };
      
      await createCotizacion(data);
      setMensajeCotizacion('Cotización creada con éxito.');
      setDetallesCotizacion([]);
      setClienteSeleccionado('');
      
      // recargar historial
      const coti = await getCotizaciones();
      setCotizaciones(coti);
      
      // ir al historial
      setTimeout(() => setActiveTab('historial'), 1500);
    } catch (error) {
      console.error('Error al crear cotización:', error);
      setMensajeCotizacion('Error al crear la cotización.');
    }
  };

  // --- logica para historial y detalle (@abner) ---
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
      // recargar detalle
      verDetalle(idCotizacion);
      // recargar historial
      const coti = await getCotizaciones();
      setCotizaciones(coti);
    } catch (error) {
      console.error('Error al confirmar:', error);
    }
  };

  const handleFacturar = (idCotizacion) => {
    navigate('/dashboard/caja', { state: { idCotizacion } });
  };

  // @abner: lógica para filtrar cotizaciones por la fecha
  const cotizacionesFiltradas = cotizaciones.filter(c => {
    if (!fechaFiltro) return true;
    const fDate = new Date(c.Fecha).toISOString().split('T')[0];
    return fDate === fechaFiltro;
  });

  return (
    <div className="page-container">
      <h2>Módulo de Cotizaciones</h2>

      {/* @abner: las sub-ventanas estilo pestañas */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'nueva' ? 'tab-activa' : ''}`}
          onClick={() => setActiveTab('nueva')}
        >
          Nueva Cotización
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

      {/* --- Pestaña: Nueva --- */}
      {activeTab === 'nueva' && (
        <div className="tab-contenido">
          <div className="form-container">
            <h3>Crear Nueva Cotización</h3>
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
                      {p.NombreProducto} (Q{p.PrecioVentaBase})
                    </option>
                  ))}
                </select>
                <input 
                  type="number" 
                  min="1"
                  placeholder="Cant." 
                  style={{ width: '80px', marginLeft: '10px' }}
                  value={cantidad}
                  onChange={e => setCantidad(parseInt(e.target.value))}
                />
                <button type="button" onClick={agregarDetalle} style={{ marginLeft: '10px' }}>
                  + Agregar
                </button>
              </div>

              {detallesCotizacion.length > 0 && (
                <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#eee' }}>
                    <tr>
                      <th style={{ padding: '8px' }}>Producto</th>
                      <th style={{ padding: '8px' }}>Cant.</th>
                      <th style={{ padding: '8px' }}>Precio U.</th>
                      <th style={{ padding: '8px' }}>Subtotal</th>
                      <th style={{ padding: '8px' }}>X</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detallesCotizacion.map((det, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
                        <td style={{ padding: '8px' }}>{det.nombre}</td>
                        <td style={{ padding: '8px' }}>{det.cantidad}</td>
                        <td style={{ padding: '8px' }}>Q{det.precioUnitario}</td>
                        <td style={{ padding: '8px' }}>Q{det.subtotal}</td>
                        <td style={{ padding: '8px' }}>
                          <button type="button" onClick={() => eliminarDetalle(i)} style={{ background: 'red', padding: '2px 8px' }}>
                            x
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <hr style={{ margin: '20px 0' }}/>
              <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>
                Total: Q{calcularTotal().toFixed(2)}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn-submit">
                  Guardar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Pestaña: Historial --- */}
      {activeTab === 'historial' && (
        <div className="tab-contenido table-container">
          {/* @abner: Filtro por fecha para que no sea bochornoso */}
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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

          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesFiltradas.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center'}}>No hay cotizaciones para esta fecha</td></tr>
              ) : (
                cotizacionesFiltradas.map(c => (
                  <tr key={c.IdCotizacion}>
                    <td>{c.IdCotizacion}</td>
                    <td>{new Date(c.Fecha).toLocaleDateString()}</td>
                    <td>{c.NombreCliente}</td>
                    <td>
                      <span className={`badge-estado badge-${c.Estado.toLowerCase()}`}>
                        {c.Estado}
                      </span>
                    </td>
                    <td>Q{c.MontoTotal.toFixed(2)}</td>
                    <td>
                      <button onClick={() => verDetalle(c.IdCotizacion)}>Ver Detalles</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Pestaña: Detalle --- */}
      {activeTab === 'detalle' && cotizacionDetalle && (
        <div className="tab-contenido">
          <div className="form-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3>Cotización #{cotizacionDetalle.encabezado.IdCotizacion}</h3>
                <p style={{ margin: '5px 0' }}><strong>Fecha:</strong> {new Date(cotizacionDetalle.encabezado.Fecha).toLocaleDateString()}</p>
                <p style={{ margin: '5px 0' }}><strong>Cliente:</strong> {cotizacionDetalle.encabezado.NombreCliente}</p>
                <p style={{ margin: '5px 0' }}><strong>NIT:</strong> {cotizacionDetalle.encabezado.NITCliente}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge-estado badge-${cotizacionDetalle.encabezado.Estado.toLowerCase()}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  {cotizacionDetalle.encabezado.Estado}
                </span>
                
                {/* botones de accion segun estado */}
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cotizacionDetalle.encabezado.Estado === 'PENDIENTE' && (
                    <button onClick={() => handleConfirmar(cotizacionDetalle.encabezado.IdCotizacion)}>
                      Confirmar Cotización
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
                      <td>Q{d.PrecioUnitario.toFixed(2)}</td>
                      <td>Q{d.Subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3" style={{ textAlign: 'right' }}>TOTAL:</th>
                    <th>
                      Q{cotizacionDetalle.detalle.reduce((sum, item) => sum + item.Subtotal, 0).toFixed(2)}
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