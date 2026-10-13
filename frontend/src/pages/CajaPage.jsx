import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  getMediosPago, 
  getFacturaImpresion, 
  getFacturas, 
  registrarPagosFactura 
} from '../services/mediosPagoService';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';

const CajaPage = () => {
  const location = useLocation();
  const idCotizacionInit = location.state?.idCotizacion || null;

  // Estados de datos generales
  const [facturas, setFacturas] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Filtros y busqueda en DataGrid
  const [busqueda, setBusqueda] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);

  // Factura seleccionada para cobro o impresion
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [cargandoFactura, setCargandoFactura] = useState(false);

  // Estados para el cobro con Medios de Pago
  const [pagosSeleccionados, setPagosSeleccionados] = useState([]);
  const [medioSeleccionado, setMedioSeleccionado] = useState('');
  const [montoPago, setMontoPago] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    try {
      const [listaFacturas, listaMedios] = await Promise.all([
        getFacturas(),
        getMediosPago()
      ]);
      setFacturas(listaFacturas || []);
      setMediosPago(listaMedios || []);
    } catch (error) {
      console.error('Error al cargar datos en Caja:', error);
      mostrarMensaje('error', 'No se pudieron cargar las facturas o medios de pago.');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  // Cargar una factura especifica para cobrar o imprimir
  const seleccionarFactura = async (idFactura) => {
    setCargandoFactura(true);
    setPagosSeleccionados([]);
    setMedioSeleccionado('');
    setMontoPago('');
    try {
      const data = await getFacturaImpresion(idFactura);
      if (data && data.encabezado) {
        setFacturaSeleccionada(data);
      } else {
        mostrarMensaje('error', 'No se encontro el detalle de la factura seleccionada.');
      }
    } catch (error) {
      console.error('Error al obtener factura:', error);
      mostrarMensaje('error', 'Error al consultar la factura.');
    } finally {
      setCargandoFactura(false);
    }
  };

  // Calculos monetarios de la factura seleccionada
  const montoTotalFactura = facturaSeleccionada?.encabezado?.MontoTotal ? parseFloat(facturaSeleccionada.encabezado.MontoTotal) : 0;
  const totalPagado = pagosSeleccionados.reduce((acc, p) => acc + p.monto, 0);
  const estaCubierto = totalPagado >= montoTotalFactura && montoTotalFactura > 0;
  const vuelto = estaCubierto ? (totalPagado - montoTotalFactura) : 0;
  const faltante = estaCubierto ? 0 : (montoTotalFactura - totalPagado);

  // Agregar un medio de pago al cobro actual
  const agregarPago = () => {
    if (estaCubierto) return;
    const montoNum = parseFloat(montoPago);
    if (!medioSeleccionado || isNaN(montoNum) || montoNum <= 0) {
      alert('Seleccione un medio de pago y coloque un monto valido mayor a 0.');
      return;
    }

    const medioObj = mediosPago.find(m => m.IdMedioPago === parseInt(medioSeleccionado, 10));
    if (!medioObj) return;

    setPagosSeleccionados([
      ...pagosSeleccionados,
      {
        idMedioPago: medioObj.IdMedioPago,
        nombre: medioObj.NombreMedioPago,
        monto: montoNum
      }
    ]);

    setMedioSeleccionado('');
    setMontoPago('');
  };

  const quitarPago = (index) => {
    const nuevos = [...pagosSeleccionados];
    nuevos.splice(index, 1);
    setPagosSeleccionados(nuevos);
  };

  // Confirmar el cobro registrando los pagos en la BD
  const procesarCobro = async () => {
    if (!facturaSeleccionada) return;
    if (pagosSeleccionados.length === 0) {
      alert('Debe agregar al menos un medio de pago.');
      return;
    }
    if (totalPagado < montoTotalFactura) {
      alert(`El monto ingresado (Q${totalPagado.toFixed(2)}) no cubre el total de la factura (Q${montoTotalFactura.toFixed(2)}).`);
      return;
    }

    setProcesandoPago(true);
    try {
      const payload = {
        idFactura: facturaSeleccionada.encabezado.IdFactura,
        pagos: pagosSeleccionados.map(p => ({
          idMedioPago: p.idMedioPago,
          monto: p.monto
        }))
      };

      await registrarPagosFactura(payload);
      mostrarMensaje('exito', '¡Pago registrado exitosamente! La factura ahora esta PAGADA.');
      
      // Recargar la factura seleccionada con su estado actualizado y sus pagos guardados
      await seleccionarFactura(facturaSeleccionada.encabezado.IdFactura);
      // Actualizar listado de facturas en segundo plano
      const listaFacturas = await getFacturas();
      setFacturas(listaFacturas || []);
    } catch (error) {
      console.error('Error al registrar cobro:', error);
      const errMsg = error.response?.data?.mensaje || error.response?.data?.error || error.message || 'Error desconocido';
      alert(`Error al registrar el cobro: ${errMsg}`);
    } finally {
      setProcesandoPago(false);
    }
  };

  const imprimir = () => {
    window.print();
  };

  // Filtrado de facturas en el DataGrid por fecha y texto de busqueda
  const facturasFiltradas = facturas.filter(f => {
    const coincideFecha = !fechaFiltro || new Date(f.FechaEmision).toISOString().split('T')[0] === fechaFiltro;
    const busqMin = busqueda.toLowerCase().trim();
    const coincideTexto = !busqMin ||
      (f.NombreCliente && f.NombreCliente.toLowerCase().includes(busqMin)) ||
      (f.IdFactura && f.IdFactura.toString().includes(busqMin));
    return coincideFecha && coincideTexto;
  });

  return (
    <div className="page-container">
      <h2 className="no-print">Modulo de Caja e Impresion</h2>
      <p className="no-print" style={{ color: 'var(--tinta-suave)', marginBottom: '1.5rem' }}>
        Seleccione una factura emitida por Facturacion para procesar su cobro por medios de pago o imprimir el comprobante.
      </p>

      {/* Alerta por si viene redirigido desde una Cotizacion */}
      {idCotizacionInit && (
        <div className="no-print" style={{ 
          background: 'var(--papel-2)', 
          border: '3px solid var(--tinta-mod)', 
          padding: '0.8rem 1.2rem', 
          marginBottom: '1.5rem',
          fontWeight: 600
        }}>
          Viene de confirmar la Cotizacion #{idCotizacionInit}. Busque abajo la factura emitida por Facturacion para cobrarla e imprimirla.
        </div>
      )}

      {/* Alertas de exito o error */}
      {mensaje.texto && (
        <div className={`no-print alerta-${mensaje.tipo}`} style={{
          padding: '0.8rem 1.2rem',
          marginBottom: '1.5rem',
          border: '3px solid var(--tinta)',
          background: mensaje.tipo === 'exito' ? '#bbf7d0' : '#fecaca',
          fontWeight: 'bold'
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* ========================================================
          SECCION 1: BUSCADOR Y DATAGRID DE FACTURAS EMITIDAS
         ======================================================== */}
      <div className="no-print" style={{ background: 'var(--papel)', border: '3px solid var(--tinta)', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--tinta)', paddingBottom: '0.5rem' }}>
          Facturas Emitidas
        </h3>

        {/* Barra de Filtros */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div style={{ flex: '2', minWidth: '220px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>
              Buscar por Cliente o No. Factura:
            </label>
            <input 
              type="text"
              placeholder="Escriba el nombre del cliente o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', border: '3px solid var(--tinta)', background: '#fff', fontWeight: 600 }}
            />
          </div>

          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>
              Filtrar por Fecha:
            </label>
            <input 
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', border: '3px solid var(--tinta)', background: '#fff', fontWeight: 600 }}
            />
          </div>

          <div>
            <button 
              type="button"
              onClick={() => { setFechaFiltro(''); setBusqueda(''); }}
              style={{ padding: '0.6rem 1rem', background: '#555', color: '#fff', border: '2px solid var(--tinta)' }}
            >
              Ver Todas
            </button>
          </div>
        </div>

        {/* DataGrid */}
        <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
          {cargando ? (
            <p style={{ textAlign: 'center', padding: '1rem' }}>Cargando facturas...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>No. Factura</th>
                  <th>Fecha de Emision</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th style={{ textAlign: 'center' }}>Accion</th>
                </tr>
              </thead>
              <tbody>
                {facturasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="info-vacia">No se encontraron facturas con el criterio seleccionado</td>
                  </tr>
                ) : (
                  facturasFiltradas.map(f => {
                    const estaSeleccionada = facturaSeleccionada?.encabezado?.IdFactura === f.IdFactura;
                    return (
                      <tr 
                        key={f.IdFactura} 
                        style={{ 
                          backgroundColor: estaSeleccionada ? 'var(--papel-2)' : 'inherit',
                          borderLeft: estaSeleccionada ? '6px solid var(--tinta-mod)' : 'none'
                        }}
                      >
                        <td><strong>#{f.IdFactura}</strong></td>
                        <td>{new Date(f.FechaEmision).toLocaleString()}</td>
                        <td>{f.NombreCliente}</td>
                        <td><strong>Q{f.MontoTotal.toFixed(2)}</strong></td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => seleccionarFactura(f.IdFactura)}
                            style={{ 
                              padding: '0.4rem 0.9rem',
                              background: estaSeleccionada ? 'var(--tinta-mod)' : 'var(--tinta)',
                              color: '#fff'
                            }}
                          >
                            {estaSeleccionada ? '✓ Seleccionada' : 'Seleccionar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================================
          SECCION 2: GESTION DE FACTURA SELECCIONADA (COBRO / IMPRESION)
         ======================================================== */}
      {cargandoFactura && (
        <div className="no-print" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>Cargando detalle de la factura...</h3>
        </div>
      )}

      {facturaSeleccionada && !cargandoFactura && (
        <div style={{ marginTop: '2rem' }}>
          
          {/* Tarjeta de Resumen y Cobro (Visible en pantalla, oculta al imprimir) */}
          <div className="no-print" style={{ background: '#fff', border: '3px solid var(--tinta)', padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--sombra-dura)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--tinta)', paddingBottom: '0.8rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>
                  Gestionando Factura #{facturaSeleccionada.encabezado.IdFactura}
                </h3>
                <p style={{ margin: '0.3rem 0 0', color: 'var(--tinta-suave)' }}>
                  Cliente: <strong>{facturaSeleccionada.encabezado.NombreCliente}</strong> (NIT: {facturaSeleccionada.encabezado.NITCliente})
                </p>
              </div>

              <div>
                <span className={`badge-estado ${facturaSeleccionada.encabezado.Estado === 'PAGADA' ? 'badge-pagada' : 'badge-pendiente'}`} style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
                  {facturaSeleccionada.encabezado.Estado}
                </span>
                <button 
                  onClick={() => setFacturaSeleccionada(null)} 
                  style={{ marginLeft: '1rem', background: '#777', color: '#fff', padding: '0.4rem 0.8rem' }}
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Resumen de Productos Facturados */}
            <h4 style={{ marginTop: '1.2rem', marginBottom: '0.5rem' }}>Productos Facturados</h4>
            <table style={{ width: '100%', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ background: 'var(--papel-2)' }}>
                  <th>Cant.</th>
                  <th>Producto</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {facturaSeleccionada.detalle.map((d, i) => (
                  <tr key={i}>
                    <td>{d.Cantidad}</td>
                    <td>{d.NombreProducto}</td>
                    <td>Q{d.PrecioUnitario.toFixed(2)}</td>
                    <td>Q{d.Subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="3" style={{ textAlign: 'right', fontSize: '1.1rem' }}>TOTAL A COBRAR:</th>
                  <th style={{ fontSize: '1.1rem', color: 'var(--tinta-mod)' }}>
                    Q{montoTotalFactura.toFixed(2)}
                  </th>
                </tr>
              </tfoot>
            </table>

            {/* SECCION COBRO EN CAJA (Si la factura esta PENDIENTE o faltan pagos) */}
            {facturaSeleccionada.encabezado.Estado !== 'PAGADA' ? (
              <div style={{ background: 'var(--papel-2)', border: '2px dashed var(--tinta)', padding: '1.2rem', marginTop: '1rem' }}>
                <h4 style={{ marginTop: 0, color: 'var(--tinta-mod)' }}>
                  Registrar Cobro en Caja (Medios de Pago)
                </h4>

                {/* Formulario de agregar pago */}
                <div className="pagos-form" style={{ marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ fontWeight: 'bold' }}>Medio de Pago:</label>
                    <select 
                      value={medioSeleccionado} 
                      onChange={e => setMedioSeleccionado(e.target.value)}
                      disabled={estaCubierto}
                    >
                      <option value="">Seleccione...</option>
                      {mediosPago.map(m => (
                        <option key={m.IdMedioPago} value={m.IdMedioPago}>
                          {m.NombreMedioPago}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold' }}>Monto a Cancelar (Q):</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0.01"
                      placeholder={faltante > 0 ? faltante.toFixed(2) : "0.00"}
                      value={montoPago} 
                      onChange={e => setMontoPago(e.target.value)} 
                      disabled={estaCubierto}
                      style={{ width: '140px' }} 
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={agregarPago}
                    disabled={estaCubierto}
                    style={{
                      background: estaCubierto ? '#9ca3af' : 'var(--tinta-mod)',
                      color: '#fff',
                      cursor: estaCubierto ? 'not-allowed' : 'pointer'
                    }}
                  >
                    + Anadir Pago
                  </button>
                </div>

                {/* Lista de pagos ingresados */}
                {pagosSeleccionados.length > 0 && (
                  <div className="pagos-lista" style={{ marginTop: '1rem' }}>
                    {pagosSeleccionados.map((p, i) => (
                      <div key={i} className="pago-item">
                        <span>{p.nombre}</span>
                        <span>Q{p.monto.toFixed(2)}</span>
                        <button 
                          onClick={() => quitarPago(i)} 
                          style={{ background: 'red', color: '#fff', padding: '2px 8px', border: 'none' }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Panel de Totales, Faltante y Vuelto */}
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  border: '2px solid var(--tinta)', 
                  background: estaCubierto ? '#dcfce7' : '#fef3c7',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.9rem', color: '#4b5563' }}>Monto Recibido:</span>
                    <strong style={{ fontSize: '1.2rem' }}>Q{totalPagado.toFixed(2)}</strong>
                  </div>

                  {estaCubierto ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.9rem', color: '#166534', fontWeight: 'bold' }}>
                        VUELTO A ENTREGAR:
                      </span>
                      <strong style={{ fontSize: '1.4rem', color: '#15803d' }}>
                        Q{vuelto.toFixed(2)}
                      </strong>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.9rem', color: '#991b1b', fontWeight: 'bold' }}>
                        Faltante por Cubrir:
                      </span>
                      <strong style={{ fontSize: '1.2rem', color: '#b91c1c' }}>
                        Q{faltante.toFixed(2)}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Aviso cuando ya se cubrio el total */}
                {estaCubierto && (
                  <p style={{ color: '#15803d', fontWeight: 'bold', margin: '0.5rem 0 0' }}>
                    ✓ El total de la factura ha sido cubierto. No es necesario agregar mas medios de pago.
                  </p>
                )}

                {/* Boton para asentar el cobro */}
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                  <button 
                    onClick={procesarCobro} 
                    className="btn-submit"
                    disabled={!estaCubierto || procesandoPago}
                    style={{
                      background: estaCubierto ? 'var(--tinta-mod)' : '#9ca3af',
                      cursor: estaCubierto ? 'pointer' : 'not-allowed',
                      padding: '0.8rem 2rem',
                      fontSize: '1rem'
                    }}
                  >
                    {procesandoPago ? 'Procesando Cobro...' : 'Confirmar Cobro en Caja'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: '#dcfce7', border: '2px solid #16a34a', padding: '1rem', marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#166534' }}>✓ Factura Pagada</h4>
                <p style={{ margin: 0 }}>
                  Esta factura ya fue cobrada y liquidada. Puede imprimir su comprobante a continuacion.
                </p>
              </div>
            )}
          </div>

          {/* ========================================================
              SECCION 3: AREA DE IMPRESION DE FACTURA
             ======================================================== */}
          <div className="factura-print-area">
            <div className="factura-preview">
              <div className="factura-header">
                <h3>OMNI-SAZO</h3>
                <p>Ferreteria y Pinturas</p>
                <p>Factura No. {facturaSeleccionada.encabezado.IdFactura}</p>
              </div>

              <div className="factura-info">
                <p><span>Fecha de Emision:</span> {new Date(facturaSeleccionada.encabezado.FechaEmision).toLocaleString()}</p>
                <p><span>Cliente:</span> {facturaSeleccionada.encabezado.NombreCliente}</p>
                <p><span>NIT:</span> {facturaSeleccionada.encabezado.NITCliente || 'CF'}</p>
                <p><span>Cajero / Usuario:</span> {facturaSeleccionada.encabezado.Cajero || 'Caja Central'}</p>
                {facturaSeleccionada.encabezado.IdCotizacion && (
                  <p><span>Ref. Cotizacion:</span> #{facturaSeleccionada.encabezado.IdCotizacion}</p>
                )}
                <p><span>Estado:</span> <strong>{facturaSeleccionada.encabezado.Estado}</strong></p>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Producto</th>
                    <th>P.U.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {facturaSeleccionada.detalle.map((d, idx) => (
                    <tr key={idx}>
                      <td>{d.Cantidad}</td>
                      <td>{d.NombreProducto}</td>
                      <td>Q{d.PrecioUnitario.toFixed(2)}</td>
                      <td>Q{d.Subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="factura-total">
                TOTAL: Q{montoTotalFactura.toFixed(2)}
              </div>

              {facturaSeleccionada.pagos && facturaSeleccionada.pagos.length > 0 && (
                <div className="factura-pagos">
                  <h4>Formas de Pago Registradas</h4>
                  {facturaSeleccionada.pagos.map((p, idx) => (
                    <p key={idx}>
                      <span>{p.NombreMedioPago}:</span> Q{p.Monto.toFixed(2)}
                    </p>
                  ))}
                </div>
              )}

              <div className="factura-footer">
                ¡Gracias por su compra!
              </div>
            </div>

            {/* Botones de accion para impresion */}
            <div className="no-print" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button 
                className="btn-imprimir" 
                onClick={imprimir}
                style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
              >
                IMPRIMIR FACTURA
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default CajaPage;