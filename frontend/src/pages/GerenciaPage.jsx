import React, { useState, useEffect } from 'react';
import {
  getReporteKPIs,
  getReporteMediosPago,
  getReporteRotacionProductos,
  getReporteStockCritico,
  getReporteVentasCajeros
} from '../services/reportesService';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';

const GerenciaPage = () => {
  const [tabActiva, setTabActiva] = useState('mediosPago'); // 'mediosPago', 'rotacion', 'stock', 'cajeros'
  const hoyStr = new Date().toISOString().slice(0, 10);
  
  // Primer dia del mes actual por defecto
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  const [fechaFin, setFechaFin] = useState(hoyStr);

  const [kpis, setKpis] = useState({
    TotalVentas: 0,
    FacturasEmitidas: 0,
    FacturasAnuladas: 0,
    TotalClientes: 0,
    ProductosCriticos: 0
  });

  const [mediosPago, setMediosPago] = useState([]);
  const [rotacion, setRotacion] = useState([]);
  const [stockCritico, setStockCritico] = useState([]);
  const [ventasCajeros, setVentasCajeros] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarReportes = async () => {
    setCargando(true);
    setError('');
    try {
      const [resKpis, resMedios, resRot, resStock, resCajeros] = await Promise.all([
        getReporteKPIs(fechaInicio, fechaFin),
        getReporteMediosPago(fechaInicio, fechaFin),
        getReporteRotacionProductos(fechaInicio, fechaFin),
        getReporteStockCritico(),
        getReporteVentasCajeros(fechaInicio, fechaFin)
      ]);

      if (resKpis.ok) setKpis(resKpis.data);
      if (resMedios.ok) setMediosPago(resMedios.data || []);
      if (resRot.ok) setRotacion(resRot.data || []);
      if (resStock.ok) setStockCritico(resStock.data || []);
      if (resCajeros.ok) setVentasCajeros(resCajeros.data || []);
    } catch (err) {
      console.error('Error al cargar reporteria gerencial:', err);
      setError('No se pudieron consultar los reportes. Verifica la conexion con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReportes();
    // eslint-disable-next-line
  }, []);

  // Filtros rapidos
  const aplicarFiltroHoy = () => {
    setFechaInicio(hoyStr);
    setFechaFin(hoyStr);
  };

  const aplicarFiltroMes = () => {
    setFechaInicio(primerDiaMes);
    setFechaFin(hoyStr);
  };

  const aplicarFiltroTodo = () => {
    setFechaInicio('');
    setFechaFin('');
  };

  const calcularPorcentaje = (monto) => {
    const total = Number(kpis.TotalVentas) || 0;
    if (total <= 0) return '0.0%';
    const pct = (Number(monto) / total) * 100;
    return `${pct.toFixed(1)}%`;
  };

  // Funcion de impresion que resetea el scroll para evitar entrecortes en Chrome
  const imprimirReporte = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.print();
    }, 120);
  };

  // Calculos de totales consolidados para el reporte impreso unificado
  const totalTransaccionesMedios = mediosPago.reduce((acc, m) => acc + (Number(m.CantidadTransacciones) || 0), 0);
  const totalRecaudadoMedios = mediosPago.reduce((acc, m) => acc + (Number(m.TotalRecaudado) || 0), 0);

  const totalUnidadesRotacion = rotacion.reduce((acc, p) => acc + (Number(p.UnidadesVendidas) || 0), 0);
  const totalIngresosRotacion = rotacion.reduce((acc, p) => acc + (Number(p.TotalIngresos) || 0), 0);

  const totalEmitidasCajeros = ventasCajeros.reduce((acc, u) => acc + (Number(u.FacturasEmitidas) || 0), 0);
  const totalAnuladasCajeros = ventasCajeros.reduce((acc, u) => acc + (Number(u.FacturasAnuladas) || 0), 0);
  const totalFacturadoCajeros = ventasCajeros.reduce((acc, u) => acc + (Number(u.TotalFacturado) || 0), 0);

  const periodoTexto = (fechaInicio && fechaFin)
    ? `${fechaInicio} al ${fechaFin}`
    : fechaInicio
    ? `Desde ${fechaInicio}`
    : fechaFin
    ? `Hasta ${fechaFin}`
    : 'Historial Completo Registrado';

  return (
    <div className="page-container">
      {/* ========================================================
          VISTA EN PANTALLA (INTERACTIVA POR PESTANAS)
          Se oculta automaticamente al imprimir mediante CSS
          ======================================================== */}
      <div className="gerencia-vista-pantalla">
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>Reportes de Gerencia</h2>
            <p style={{ color: 'var(--tinta-suave)', margin: '0.4rem 0 0' }}>
              Indicadores de ventas, medios de pago, productos y cajeros.
            </p>
          </div>

          <button
            onClick={imprimirReporte}
            className="btn-imprimir-reporte-prominente"
          >
            IMPRIMIR REPORTE UNIFICADO
          </button>
        </div>

        {/* Barra de Filtros por Fechas */}
        <div className="no-print" style={{
          background: 'var(--papel-2)',
          border: '3px solid var(--tinta)',
          padding: '1.2rem',
          marginBottom: '1.8rem',
          boxShadow: '4px 4px 0px var(--tinta)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Fecha Inicial:
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                style={{ padding: '0.5rem', border: '2px solid var(--tinta)', fontFamily: 'var(--fuente-texto)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Fecha Final:
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{ padding: '0.5rem', border: '2px solid var(--tinta)', fontFamily: 'var(--fuente-texto)' }}
              />
            </div>

            <button
              onClick={cargarReportes}
              disabled={cargando}
              style={{
                padding: '0.55rem 1.4rem',
                backgroundColor: 'var(--tinta)',
                color: '#fff',
                border: '2px solid var(--tinta)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {cargando ? 'Consultando...' : 'Aplicar Filtro'}
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
              <button
                onClick={() => { aplicarFiltroHoy(); setTimeout(cargarReportes, 50); }}
                style={{ padding: '0.45rem 0.8rem', background: '#e5e7eb', border: '2px solid var(--tinta)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Hoy
              </button>
              <button
                onClick={() => { aplicarFiltroMes(); setTimeout(cargarReportes, 50); }}
                style={{ padding: '0.45rem 0.8rem', background: '#e5e7eb', border: '2px solid var(--tinta)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Este Mes
              </button>
              <button
                onClick={() => { aplicarFiltroTodo(); setTimeout(cargarReportes, 50); }}
                style={{ padding: '0.45rem 0.8rem', background: '#e5e7eb', border: '2px solid var(--tinta)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Historial Completo
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#fee2e2', border: '3px solid #991b1b', color: '#991b1b', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Tarjetas de Resumen en Pantalla (KPIs) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Card 1: Ventas */}
          <div style={{
            background: 'var(--papel)',
            border: '3px solid var(--tinta)',
            padding: '1.2rem',
            boxShadow: '4px 4px 0px var(--tinta)'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--tinta-suave)', textTransform: 'uppercase' }}>
              Ventas Totales
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#16a34a', marginTop: '0.3rem' }}>
              Q {Number(kpis.TotalVentas).toFixed(2)}
            </div>
            <small style={{ color: 'var(--tinta-suave)' }}>Solo facturas pagadas</small>
          </div>

          {/* Card 2: Facturas Emitidas */}
          <div style={{
            background: 'var(--papel)',
            border: '3px solid var(--tinta)',
            padding: '1.2rem',
            boxShadow: '4px 4px 0px var(--tinta)'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--tinta-suave)', textTransform: 'uppercase' }}>
              Facturas Emitidas
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', marginTop: '0.3rem' }}>
              {kpis.FacturasEmitidas}
            </div>
            <small style={{ color: 'var(--tinta-suave)' }}>Documentos fiscales validos</small>
          </div>

          {/* Card 3: Facturas Anuladas */}
          <div style={{
            background: 'var(--papel)',
            border: '3px solid var(--tinta)',
            padding: '1.2rem',
            boxShadow: '4px 4px 0px var(--tinta)'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--tinta-suave)', textTransform: 'uppercase' }}>
              Facturas Anuladas
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#dc2626', marginTop: '0.3rem' }}>
              {kpis.FacturasAnuladas}
            </div>
            <small style={{ color: '#dc2626' }}>Monto reseteado a 0.00</small>
          </div>

          {/* Card 4: Clientes */}
          <div style={{
            background: 'var(--papel)',
            border: '3px solid var(--tinta)',
            padding: '1.2rem',
            boxShadow: '4px 4px 0px var(--tinta)'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--tinta-suave)', textTransform: 'uppercase' }}>
              Clientes Atendidos
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#0284c7', marginTop: '0.3rem' }}>
              {kpis.TotalClientes}
            </div>
            <small style={{ color: 'var(--tinta-suave)' }}>Clientes en el periodo</small>
          </div>

          {/* Card 5: Stock Critico */}
          <div style={{
            background: 'var(--papel)',
            border: '3px solid var(--tinta)',
            padding: '1.2rem',
            boxShadow: '4px 4px 0px var(--tinta)'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--tinta-suave)', textTransform: 'uppercase' }}>
              Alertas de Stock
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: kpis.ProductosCriticos > 0 ? '#ea580c' : '#16a34a', marginTop: '0.3rem' }}>
              {kpis.ProductosCriticos}
            </div>
            <small style={{ color: kpis.ProductosCriticos > 0 ? '#ea580c' : 'var(--tinta-suave)' }}>
              Productos en stock minimo
            </small>
          </div>
        </div>

        {/* Pestanas de Navegacion en Pantalla */}
        <div className="tabs-container no-print">
          <button
            className={`tab-btn ${tabActiva === 'mediosPago' ? 'tab-activa' : ''}`}
            onClick={() => setTabActiva('mediosPago')}
          >
            Ingresos por Medio de Pago
          </button>
          <button
            className={`tab-btn ${tabActiva === 'rotacion' ? 'tab-activa' : ''}`}
            onClick={() => setTabActiva('rotacion')}
          >
            Rotacion de Productos
          </button>
          <button
            className={`tab-btn ${tabActiva === 'stock' ? 'tab-activa' : ''}`}
            onClick={() => setTabActiva('stock')}
          >
            Semaforo de Inventario
          </button>
          <button
            className={`tab-btn ${tabActiva === 'cajeros' ? 'tab-activa' : ''}`}
            onClick={() => setTabActiva('cajeros')}
          >
            Ventas por Cajero
          </button>
        </div>

        {/* PESTANA 1: Medios de Pago */}
        {tabActiva === 'mediosPago' && (
          <div className="tab-contenido">
            <h3>Conciliacion de Ingresos por Medio de Pago</h3>
            <p style={{ color: 'var(--tinta-suave)', fontSize: '0.9rem' }}>
              Desglose de montos cobrados en caja agrupados por Efectivo, Tarjetas y Transferencias.
            </p>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Medio de Pago</th>
                    <th style={{ textAlign: 'center' }}>Transacciones</th>
                    <th>Total Recaudado</th>
                    <th>Participacion (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {mediosPago.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                        No hay transacciones registradas en el rango de fechas.
                      </td>
                    </tr>
                  ) : (
                    mediosPago.map((m, idx) => (
                      <tr key={m.IdMedioPago}>
                        <td>{idx + 1}</td>
                        <td><strong>{m.NombreMedio}</strong></td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{m.CantidadTransacciones}</td>
                        <td style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#16a34a' }}>
                          Q {Number(m.TotalRecaudado).toFixed(2)}
                        </td>
                        <td style={{ width: '220px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              flex: 1,
                              height: '14px',
                              background: '#e5e7eb',
                              border: '1px solid var(--tinta)',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: calcularPorcentaje(m.TotalRecaudado),
                                height: '100%',
                                background: 'var(--tinta-mod, #7b3fe4)'
                              }} />
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                              {calcularPorcentaje(m.TotalRecaudado)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTANA 2: Rotacion de Productos */}
        {tabActiva === 'rotacion' && (
          <div className="tab-contenido">
            <h3>Rotacion y Demanda de Productos</h3>
            <p style={{ color: 'var(--tinta-suave)', fontSize: '0.9rem' }}>
              Productos ordenados por unidades vendidas e ingresos generados.
            </p>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Pos.</th>
                    <th>Codigo</th>
                    <th>Producto</th>
                    <th>Categoria</th>
                    <th style={{ textAlign: 'center' }}>Unidades Vendidas</th>
                    <th>Ingresos Totales</th>
                  </tr>
                </thead>
                <tbody>
                  {rotacion.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        No hay ventas registradas en el periodo.
                      </td>
                    </tr>
                  ) : (
                    rotacion.map((p, idx) => (
                      <tr key={p.IdProducto}>
                        <td style={{ fontWeight: 'bold', textAlign: 'center' }}>
                          {idx + 1 <= 3 ? (
                            <span style={{
                              display: 'inline-block',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: idx === 0 ? '#eab308' : idx === 1 ? '#94a3b8' : '#b45309',
                              color: '#fff',
                              lineHeight: '24px',
                              textAlign: 'center',
                              fontSize: '0.75rem'
                            }}>
                              {idx + 1}
                            </span>
                          ) : idx + 1}
                        </td>
                        <td><strong>{p.CodigoProducto}</strong></td>
                        <td>{p.NombreProducto}</td>
                        <td><span style={{ padding: '0.2rem 0.5rem', background: '#f3f4f6', border: '1px solid #d1d5db', fontSize: '0.8rem' }}>{p.NombreCategoria}</span></td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem' }}>
                          {p.UnidadesVendidas}
                        </td>
                        <td style={{ fontWeight: 'bold', color: '#16a34a' }}>
                          Q {Number(p.TotalIngresos).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTANA 3: Semaforo de Inventario */}
        {tabActiva === 'stock' && (
          <div className="tab-contenido">
            <h3>Semaforo de Existencias</h3>
            <p style={{ color: 'var(--tinta-suave)', fontSize: '0.9rem' }}>
              Control de existencias comparado contra el stock minimo.
            </p>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Producto</th>
                    <th>Categoria</th>
                    <th style={{ textAlign: 'center' }}>Stock Minimo</th>
                    <th style={{ textAlign: 'center' }}>Stock Disponible</th>
                    <th>Estado / Alerta</th>
                  </tr>
                </thead>
                <tbody>
                  {stockCritico.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        No se encontraron registros de inventario.
                      </td>
                    </tr>
                  ) : (
                    stockCritico.map((s) => {
                      let badgeBg = '#dcfce7';
                      let badgeColor = '#166534';
                      let badgeBorder = '#86efac';

                      if (s.EstadoSemaforo === 'AGOTADO' || s.EstadoSemaforo === 'CRITICO') {
                        badgeBg = '#fee2e2';
                        badgeColor = '#991b1b';
                        badgeBorder = '#fca5a5';
                      } else if (s.EstadoSemaforo === 'BAJO') {
                        badgeBg = '#fef3c7';
                        badgeColor = '#92400e';
                        badgeBorder = '#fde68a';
                      }

                      return (
                        <tr key={s.IdProducto}>
                          <td><strong>{s.CodigoProducto}</strong></td>
                          <td>{s.NombreProducto}</td>
                          <td>{s.NombreCategoria}</td>
                          <td style={{ textAlign: 'center' }}>{s.StockMinimo}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {s.StockDisponible}
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.8rem',
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              borderRadius: '4px',
                              background: badgeBg,
                              color: badgeColor,
                              border: `2px solid ${badgeBorder}`
                            }}>
                              {s.EstadoSemaforo}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTANA 4: Ventas por Cajero */}
        {tabActiva === 'cajeros' && (
          <div className="tab-contenido">
            <h3>Rendimiento de Facturacion por Cajero</h3>
            <p style={{ color: 'var(--tinta-suave)', fontSize: '0.9rem' }}>
              Facturas emitidas, anuladas y total facturado por usuario.
            </p>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th style={{ textAlign: 'center' }}>Facturas Emitidas</th>
                    <th style={{ textAlign: 'center' }}>Facturas Anuladas</th>
                    <th>Total Facturado</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasCajeros.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                        No hay registros de operadores en el periodo.
                      </td>
                    </tr>
                  ) : (
                    ventasCajeros.map((u) => (
                      <tr key={u.IdUsuario}>
                        <td><strong>{u.NombreUsuario}</strong></td>
                        <td>{u.NombreRol}</td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{u.FacturasEmitidas}</td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: u.FacturasAnuladas > 0 ? '#dc2626' : 'inherit' }}>
                          {u.FacturasAnuladas}
                        </td>
                        <td style={{ fontWeight: 'bold', color: '#16a34a' }}>
                          Q {Number(u.TotalFacturado).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          REPORTE UNIFICADO DE GERENCIA (SOLO VISIBLE AL IMPRIMIR)
          Contiene las 4 secciones unificadas con cuadros y bordes
          ======================================================== */}
      <div className="gerencia-reporte-unificado">
        {/* PAGINA 1: ENCABEZADO + KPIS + SECCION 1 (MEDIOS DE PAGO) + SECCION 2 (ROTACION) */}
        <div className="reporte-print-header">
          <div className="reporte-print-brand">
            <h1>OMNI-SAZO</h1>
            <p className="reporte-print-sub">FERRETERIA Y PINTURAS - SISTEMA DE CONTROL Y AUDITORIA</p>
          </div>
          <div className="reporte-print-doc-titulo">
            <h2>INFORME INTEGRAL DE GERENCIA Y GESTION FINANCIERA</h2>
          </div>
          <div className="reporte-print-meta-grid">
            <div className="reporte-print-meta-item">
              <strong>PERIODO EVALUADO:</strong> {periodoTexto}
            </div>
            <div className="reporte-print-meta-item">
              <strong>FECHA DE EMISION:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
            <div className="reporte-print-meta-item">
              <strong>MODULO DE AUDITORIA:</strong> Gerencia y Control Central
            </div>
            <div className="reporte-print-meta-item">
              <strong>ESTADO DEL REPORTE:</strong> Consolidado Valido
            </div>
          </div>
        </div>

        {/* Resumen Ejecutivo de KPIs en cuadros con bordes */}
        <div className="reporte-print-seccion">
          <div className="reporte-print-seccion-header">
            <h3>RESUMEN EJECUTIVO DE INDICADORES (KPIS)</h3>
          </div>
          <div className="reporte-print-kpis-grid">
            <div className="reporte-print-kpi-card">
              <span className="kpi-label">VENTAS TOTALES</span>
              <span className="kpi-val">Q {Number(kpis.TotalVentas).toFixed(2)}</span>
              <small>Solo facturas pagadas</small>
            </div>
            <div className="reporte-print-kpi-card">
              <span className="kpi-label">FACTURAS EMITIDAS</span>
              <span className="kpi-val">{kpis.FacturasEmitidas}</span>
              <small>Documentos fiscales</small>
            </div>
            <div className="reporte-print-kpi-card">
              <span className="kpi-label">FACTURAS ANULADAS</span>
              <span className="kpi-val">{kpis.FacturasAnuladas}</span>
              <small>Monto en 0.00</small>
            </div>
            <div className="reporte-print-kpi-card">
              <span className="kpi-label">CLIENTES ATENDIDOS</span>
              <span className="kpi-val">{kpis.TotalClientes}</span>
              <small>En el periodo</small>
            </div>
            <div className="reporte-print-kpi-card">
              <span className="kpi-label">ALERTAS DE STOCK</span>
              <span className="kpi-val">{kpis.ProductosCriticos}</span>
              <small>En stock critico</small>
            </div>
          </div>
        </div>

        {/* Seccion 1: Conciliacion de Ingresos por Medio de Pago */}
        <div className="reporte-print-seccion">
          <div className="reporte-print-seccion-header">
            <h3>1. CONCILIACION DE INGRESOS POR MEDIO DE PAGO</h3>
            <p>Desglose de montos cobrados en caja agrupados por Efectivo, Tarjetas y Transferencias.</p>
          </div>
          <table className="reporte-print-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>No.</th>
                <th>Medio de Pago</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Transacciones</th>
                <th style={{ textAlign: 'right', width: '160px' }}>Total Recaudado</th>
                <th style={{ textAlign: 'right', width: '150px' }}>Participacion (%)</th>
              </tr>
            </thead>
            <tbody>
              {mediosPago.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>
                    No hay transacciones registradas en el rango de fechas.
                  </td>
                </tr>
              ) : (
                mediosPago.map((m, idx) => (
                  <tr key={m.IdMedioPago}>
                    <td>{idx + 1}</td>
                    <td><strong>{m.NombreMedio}</strong></td>
                    <td style={{ textAlign: 'center' }}>{m.CantidadTransacciones}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Q {Number(m.TotalRecaudado).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{calcularPorcentaje(m.TotalRecaudado)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="2" style={{ textAlign: 'right' }}>TOTAL CONCILIADO:</th>
                <th style={{ textAlign: 'center' }}>{totalTransaccionesMedios}</th>
                <th style={{ textAlign: 'right' }}>Q {totalRecaudadoMedios.toFixed(2)}</th>
                <th style={{ textAlign: 'right' }}>100.0%</th>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Seccion 2: Rotacion y Demanda de Productos */}
        <div className="reporte-print-seccion">
          <div className="reporte-print-seccion-header">
            <h3>2. ROTACION Y DEMANDA DE PRODUCTOS</h3>
            <p>Productos ordenados por unidades vendidas e ingresos generados.</p>
          </div>
          <table className="reporte-print-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>Pos.</th>
                <th style={{ width: '90px' }}>Codigo</th>
                <th>Producto</th>
                <th>Categoria</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Unidades Vendidas</th>
                <th style={{ textAlign: 'right', width: '150px' }}>Ingresos Totales</th>
              </tr>
            </thead>
            <tbody>
              {rotacion.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>
                    No hay ventas registradas en el periodo.
                  </td>
                </tr>
              ) : (
                rotacion.map((p, idx) => (
                  <tr key={p.IdProducto}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                    <td><strong>{p.CodigoProducto}</strong></td>
                    <td>{p.NombreProducto}</td>
                    <td>{p.NombreCategoria}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{p.UnidadesVendidas}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Q {Number(p.TotalIngresos).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="4" style={{ textAlign: 'right' }}>TOTALES DE ROTACION:</th>
                <th style={{ textAlign: 'center' }}>{totalUnidadesRotacion}</th>
                <th style={{ textAlign: 'right' }}>Q {totalIngresosRotacion.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* PAGINA 2: SALTO DE PAGINA LIMPIO PARA SECCION 3 + SECCION 4 + FIRMAS */}
        <div className="reporte-print-seccion reporte-salto-pagina">
          <div className="reporte-print-seccion-header">
            <h3>3. SEMAFORO DE EXISTENCIAS (CONTROL DE STOCK)</h3>
            <p>Control de existencias fisicas comparado contra el stock minimo estipulado.</p>
          </div>
          <table className="reporte-print-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>Codigo</th>
                <th>Producto</th>
                <th>Categoria</th>
                <th style={{ textAlign: 'center', width: '110px' }}>Stock Minimo</th>
                <th style={{ textAlign: 'center', width: '110px' }}>Stock Disponible</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Estado / Alerta</th>
              </tr>
            </thead>
            <tbody>
              {stockCritico.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>
                    No se encontraron registros de inventario.
                  </td>
                </tr>
              ) : (
                stockCritico.map((s) => (
                  <tr key={s.IdProducto}>
                    <td><strong>{s.CodigoProducto}</strong></td>
                    <td>{s.NombreProducto}</td>
                    <td>{s.NombreCategoria}</td>
                    <td style={{ textAlign: 'center' }}>{s.StockMinimo}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s.StockDisponible}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="reporte-print-badge">
                        {s.EstadoSemaforo}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Seccion 4: Rendimiento de Facturacion por Cajero */}
        <div className="reporte-print-seccion">
          <div className="reporte-print-seccion-header">
            <h3>4. RENDIMIENTO DE FACTURACION POR CAJERO / OPERADOR</h3>
            <p>Facturas emitidas, anuladas y total facturado por usuario del sistema.</p>
          </div>
          <table className="reporte-print-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol Asignado</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Facturas Emitidas</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Facturas Anuladas</th>
                <th style={{ textAlign: 'right', width: '150px' }}>Total Facturado</th>
              </tr>
            </thead>
            <tbody>
              {ventasCajeros.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>
                    No hay registros de operadores en el periodo.
                  </td>
                </tr>
              ) : (
                ventasCajeros.map((u) => (
                  <tr key={u.IdUsuario}>
                    <td><strong>{u.NombreUsuario}</strong></td>
                    <td>{u.NombreRol}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{u.FacturasEmitidas}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{u.FacturasAnuladas}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Q {Number(u.TotalFacturado).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="2" style={{ textAlign: 'right' }}>TOTALES CONSOLIDADOS:</th>
                <th style={{ textAlign: 'center' }}>{totalEmitidasCajeros}</th>
                <th style={{ textAlign: 'center' }}>{totalAnuladasCajeros}</th>
                <th style={{ textAlign: 'right' }}>Q {totalFacturadoCajeros.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bloque de Firmas y Auditoria Institucional */}
        <div className="reporte-print-firmas">
          <div className="reporte-print-firma-box">
            <div className="firma-linea"></div>
            <strong>GERENCIA GENERAL</strong>
            <p>Aprobacion y Control Financiero</p>
          </div>
          <div className="reporte-print-firma-box">
            <div className="firma-linea"></div>
            <strong>AUDITORIA INTERNA / CAJA</strong>
            <p>Verificacion y Conciliacion</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GerenciaPage;
