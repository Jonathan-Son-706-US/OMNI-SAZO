import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getMediosPago, getFacturaImpresion, getFacturas, crearFacturaCompleta } from '../services/mediosPagoService';
import { getCotizacionDetalle } from '../services/cotizacionesService';
import { getClientes } from '../services/clientesService';
import { getProductos } from '../services/productosService';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';

const CajaPage = () => {
  const location = useLocation();
  const idCotizacionInit = location.state?.idCotizacion || null;
  
  const [activeTab, setActiveTab] = useState('caja'); // 'caja', 'impresion'
  
  
  const [mediosPago, setMediosPago] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  
  const [idCotizacionUsada, setIdCotizacionUsada] = useState(idCotizacionInit);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [detallesFactura, setDetallesFactura] = useState([]);
  
  const [pagosSeleccionados, setPagosSeleccionados] = useState([]);
  const [medioSeleccionado, setMedioSeleccionado] = useState('');
  const [montoPago, setMontoPago] = useState('');

 
  const [facturas, setFacturas] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]); // @abner: filtro DDMMAA
  const [facturaImprimir, setFacturaImprimir] = useState(null);

  useEffect(() => {
    cargarDatosBasicos();
  }, [idCotizacionInit]);

  const cargarDatosBasicos = async () => {
    try {
      const mp = await getMediosPago();
      const cli = await getClientes();
      const prod = await getProductos();
      setMediosPago(mp);
      setClientes(cli);
      setProductos(prod);
      
      if (idCotizacionInit) {
        const coti = await getCotizacionDetalle(idCotizacionInit);
        setClienteSeleccionado(coti.encabezado.IdCliente);
        
        const detallesAdaptados = coti.detalle.map(d => ({
          idProducto: d.IdProducto,
          nombre: d.NombreProducto,
          cantidad: d.Cantidad,
          precioUnitario: d.PrecioUnitario,
          subtotal: d.Subtotal
        }));
        setDetallesFactura(detallesAdaptados);
      }
      
      cargarHistorialFacturas();
    } catch (error) {
      console.error('Error al cargar catalogo en caja:', error);
    }
  };

  const cargarHistorialFacturas = async () => {
    try {
      const data = await getFacturas();
      setFacturas(data);
    } catch (error) {
      console.error("Error obteniendo facturas", error);
    }
  };


  const agregarDetalle = () => {
    if (!productoSeleccionado || cantidad <= 0) return;
    const productoObj = productos.find(p => p.IdProducto === parseInt(productoSeleccionado));
    if (!productoObj) return;

    const subtotal = productoObj.PrecioVentaBase * cantidad;
    setDetallesFactura([...detallesFactura, {
      idProducto: productoObj.IdProducto,
      nombre: productoObj.NombreProducto,
      cantidad: cantidad,
      precioUnitario: productoObj.PrecioVentaBase,
      subtotal: subtotal
    }]);
    setProductoSeleccionado('');
    setCantidad(1);
  };

  const quitarDetalle = (index) => {
    const nuevos = [...detallesFactura];
    nuevos.splice(index, 1);
    setDetallesFactura(nuevos);
  };

  const totalFactura = detallesFactura.reduce((a, b) => a + b.subtotal, 0);

  const agregarPago = () => {
    if (!medioSeleccionado || !montoPago || montoPago <= 0) return;
    const medio = mediosPago.find(m => m.IdMedioPago === parseInt(medioSeleccionado));
    
    setPagosSeleccionados([
      ...pagosSeleccionados, 
      { idMedioPago: medio.IdMedioPago, nombre: medio.NombreMedioPago, monto: parseFloat(montoPago) }
    ]);
    
    setMedioSeleccionado('');
    setMontoPago('');
  };

  const quitarPago = (index) => {
    const nuevos = [...pagosSeleccionados];
    nuevos.splice(index, 1);
    setPagosSeleccionados(nuevos);
  };

  const totalPagado = pagosSeleccionados.reduce((a, b) => a + b.monto, 0);

  const procesarCobro = async () => {
    if (!clienteSeleccionado) return alert("Debe seleccionar un cliente.");
    if (detallesFactura.length === 0) return alert("Debe agregar al menos un producto.");
    if (pagosSeleccionados.length === 0) return alert("Debe agregar al menos un pago.");
    if (totalPagado < totalFactura) return alert("El monto pagado no cubre el total de la factura.");

    try {
      const data = {
        idCliente: clienteSeleccionado,
        idCotizacion: idCotizacionUsada,
        montoTotal: totalFactura,
        detalles: detallesFactura,
        pagos: pagosSeleccionados
      };

      const result = await crearFacturaCompleta(data);
      alert('¡Factura cobrada y guardada exitosamente!');
      
      setDetallesFactura([]);
      setPagosSeleccionados([]);
      setClienteSeleccionado('');
      setIdCotizacionUsada(null);
      
      await cargarHistorialFacturas();
      buscarParaImprimir(result.idFactura);
      
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.mensaje || error.response?.data?.error || error.message || 'Error desconocido';
      alert(`Error al registrar la factura: ${errMsg}`);
    }
  };

  
  const buscarParaImprimir = async (id) => {
    try {
      const data = await getFacturaImpresion(id);
      setFacturaImprimir(data);
      setActiveTab('impresion');
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
      <h2 className="no-print">Caja y Facturación</h2>

      <div className="tabs-container no-print">
        <button 
          className={`tab-btn ${activeTab === 'caja' ? 'tab-activa' : ''}`}
          onClick={() => setActiveTab('caja')}
        >
          Caja (Cobrar)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'impresion' ? 'tab-activa' : ''}`}
          onClick={() => setActiveTab('impresion')}
        >
          Historial / Impresión
        </button>
      </div>

      {activeTab === 'caja' && (
        <div className="tab-contenido no-print">
          <div className="form-container">
            {idCotizacionUsada ? (
              <h3 style={{color:'var(--tinta-mod)'}}>Viene de Cotización #{idCotizacionUsada}</h3>
            ) : (
              <h3>Nueva Factura (Venta Directa)</h3>
            )}
            
            <div style={{marginBottom:'1rem'}}>
              <label>Cliente (Obligatorio):</label>
              <select value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)}>
                <option value="">Seleccione...</option>
                {clientes.map(c => (
                  <option key={c.IdCliente} value={c.IdCliente}>{c.NIT} - {c.Nombre}</option>
                ))}
              </select>
            </div>

            <hr/>
            <h4>Productos a llevar</h4>
            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
              <select value={productoSeleccionado} onChange={e => setProductoSeleccionado(e.target.value)}>
                <option value="">Seleccione producto...</option>
                {productos.map(p => (
                  <option key={p.IdProducto} value={p.IdProducto}>{p.NombreProducto} (Q{p.PrecioVentaBase})</option>
                ))}
              </select>
              <input type="number" min="1" value={cantidad} onChange={e=>setCantidad(e.target.value)} style={{width:'80px'}}/>
              <button type="button" onClick={agregarDetalle}>+ Agregar</button>
            </div>

            {detallesFactura.length > 0 && (
              <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#eee' }}>
                  <tr><th>Producto</th><th>Cant.</th><th>P.U.</th><th>Subtotal</th><th>X</th></tr>
                </thead>
                <tbody>
                  {detallesFactura.map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #ccc' }}>
                      <td>{d.nombre}</td>
                      <td>{d.cantidad}</td>
                      <td>Q{d.precioUnitario}</td>
                      <td>Q{d.subtotal.toFixed(2)}</td>
                      <td>
                        <button onClick={() => quitarDetalle(i)} style={{ background: 'red', padding: '2px 8px' }}>x</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3" style={{ textAlign: 'right' }}>TOTAL A PAGAR:</th>
                    <th>Q{totalFactura.toFixed(2)}</th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            )}

            <hr style={{margin:'2rem 0'}}/>
            <h4>Medios de Pago (Caja)</h4>
            <div className="pagos-form">
              <div>
                <label>Medio:</label>
                <select value={medioSeleccionado} onChange={e => setMedioSeleccionado(e.target.value)}>
                  <option value="">Seleccione...</option>
                  {mediosPago.map(m => (
                    <option key={m.IdMedioPago} value={m.IdMedioPago}>{m.NombreMedioPago}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Monto a cancelar (Q):</label>
                <input type="number" value={montoPago} onChange={e => setMontoPago(e.target.value)} style={{ width: '120px' }} />
              </div>
              <button type="button" onClick={agregarPago}>+ Añadir Pago</button>
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
                
                <div style={{ marginTop: '1rem', padding:'10px', background:'#eee', display:'flex', justifyContent:'space-between'}}>
                  <span style={{fontWeight:'bold'}}>Recibido: Q{totalPagado.toFixed(2)}</span>
                  <span style={{fontWeight:'bold', color: totalPagado >= totalFactura ? 'green' : 'red'}}>
                    Faltante: Q{totalPagado >= totalFactura ? '0.00' : (totalFactura - totalPagado).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem' }}>
              <button 
                onClick={procesarCobro} 
                className="btn-submit" 
                disabled={detallesFactura.length === 0 || totalPagado < totalFactura}
              >
                Procesar Venta e Imprimir
              </button>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'impresion' && (
        <div className="tab-contenido">
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
                    <tr><td colSpan="5" style={{textAlign:'center'}}>No hay facturas en esta fecha</td></tr>
                  ) : (
                    facturasFiltradas.map(f => (
                      <tr key={f.IdFactura}>
                        <td>{f.IdFactura}</td>
                        <td>{new Date(f.FechaEmision).toLocaleString()}</td>
                        <td>{f.NombreCliente}</td>
                        <td>Q{f.MontoTotal.toFixed(2)}</td>
                        <td>
                          <button onClick={() => buscarParaImprimir(f.IdFactura)}>Ver/Imprimir</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                    {facturaImprimir.detalle.map(d => (
                      <tr key={d.IdFacturaDetalle}>
                        <td>{d.Cantidad}</td>
                        <td>{d.NombreProducto}</td>
                        <td>Q{d.PrecioUnitario.toFixed(2)}</td>
                        <td>Q{d.Subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="factura-total">
                  TOTAL: Q{facturaImprimir.encabezado.MontoTotal.toFixed(2)}
                </div>

                <div className="factura-pagos">
                  <h4>Forma de pago</h4>
                  {facturaImprimir.pagos.map(p => (
                    <p key={p.IdFacturaPago}>{p.NombreMedioPago}: Q{p.Monto.toFixed(2)}</p>
                  ))}
                </div>

                <div className="factura-footer">
                  ¡Gracias por su compra!
                </div>
              </div>

              <div className="no-print" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button className="btn-imprimir" onClick={imprimir}>🖨️ IMPRIMIR FACTURA</button>
                <button onClick={() => setFacturaImprimir(null)} style={{ marginLeft:'10px', background: '#555' }}>Cerrar Preview</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CajaPage;