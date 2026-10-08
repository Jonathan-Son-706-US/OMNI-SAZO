import React, { useState, useEffect } from 'react';
import { getClientes } from '../services/clientesService';
import { getProductos } from '../services/productosService';
import { createCotizacion } from '../services/cotizacionesService';

export const CotizacionPage = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  
  const [idCliente, setIdCliente] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [detalle, setDetalle] = useState([]);

  const [idProductoSel, setIdProductoSel] = useState('');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    getClientes()
      .then(res => {
        const lista = Array.isArray(res) ? res : (res?.data || res?.clientes || []);
        setClientes(lista);
      })
      .catch(err => console.error("Error al cargar clientes:", err));

    getProductos()
      .then(res => {
        const lista = Array.isArray(res) ? res : (res?.data || res?.productos || []);
        setProductos(lista);
      })
      .catch(err => console.error("Error al cargar productos:", err));
  }, []);

  const handleAgregarProducto = () => {
    if (!idProductoSel || cantidad <= 0) return;

    const idSelNum = parseInt(idProductoSel, 10);
    
    const prod = productos.find(p => (p.IdProducto || p.idProducto || p.id_producto || p.id) === idSelNum);
    
    if (!prod) {
      alert("Producto no encontrado.");
      return;
    }

    const idProd = prod.IdProducto || prod.idProducto || prod.id_producto || prod.id;
    const nombreProd = prod.NombreProducto || prod.nombre || prod.nombre_producto || 'Producto';
    const precioProd = Number(prod.PrecioVentaBase || prod.precio || prod.precio_unitario || 0);

    const nuevoItem = {
      idProducto: idProd,
      nombre: nombreProd,
      cantidad: parseInt(cantidad, 10),
      precioUnitario: precioProd,
      subtotal: precioProd * parseInt(cantidad, 10)
    };

    setDetalle([...detalle, nuevoItem]);
    setIdProductoSel('');
    setCantidad(1);
  };

  const handleEliminarItem = (index) => {
    const nuevoDetalle = detalle.filter((_, i) => i !== index);
    setDetalle(nuevoDetalle);
  };

  const montoTotal = detalle.reduce((acc, item) => acc + item.subtotal, 0);

  const handleGuardarCotizacion = async (e) => {
    e.preventDefault();
    if (!idCliente || detalle.length === 0) {
      alert('Debes seleccionar un cliente y agregar al menos un producto.');
      return;
    }

    try {
      const userSession = JSON.parse(localStorage.getItem('userSession'));
      
      const payload = {
        idCliente: parseInt(idCliente, 10),
        idUsuario: userSession?.idUsuario || userSession?.id_usuario || userSession?.IdUsuario || 1,
        fechaVencimiento,
        montoTotal,
        detalle: detalle.map(item => ({
          idProducto: item.idProducto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario
        }))
      };

      await createCotizacion(payload);
      alert('Cotización creada exitosamente');
      
      setDetalle([]);
      setIdCliente('');
      setFechaVencimiento('');
    } catch (error) {
      console.error(error);
      alert('Error al guardar la cotización');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Nueva Cotización</h2>

      {/* 1. Datos Generales */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label>Cliente: </label>
          <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)}>
            <option value="">-- Seleccione Cliente --</option>
            {Array.isArray(clientes) && clientes.map((c, idx) => {
              const id = c.IdCliente || c.idCliente || c.id_cliente || c.id || idx;
              const nombre = c.Nombre || c.nombre || c.nombre_cliente || `Cliente #${id}`;
              return <option key={id} value={id}>{nombre}</option>;
            })}
          </select>
        </div>

        <div>
          <label>Fecha Vencimiento: </label>
          <input 
            type="date" 
            value={fechaVencimiento} 
            onChange={(e) => setFechaVencimiento(e.target.value)} 
          />
        </div>
      </div>

      {/* 2. Selector de Producto */}
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h4>Agregar Producto</h4>
        <select value={idProductoSel} onChange={(e) => setIdProductoSel(e.target.value)}>
          <option value="">-- Seleccione Producto --</option>
          {Array.isArray(productos) && productos.map((p, idx) => {
            const id = p.IdProducto || p.idProducto || p.id_producto || p.id || idx;
            const nombre = p.NombreProducto || p.nombre || p.nombre_producto || `Producto #${id}`;
            const precio = p.PrecioVentaBase || p.precio || p.precio_unitario || 0;
            return (
              <option key={id} value={id}>
                {nombre} (Q{Number(precio).toFixed(2)})
              </option>
            );
          })}
        </select>

        <input 
          type="number" 
          min="1" 
          value={cantidad} 
          onChange={(e) => setCantidad(e.target.value)} 
          style={{ width: '60px', marginLeft: '10px' }}
        />

        <button onClick={handleAgregarProducto} style={{ marginLeft: '10px' }}>
          + Agregar a la Cotización
        </button>
      </div>

      {/* 3. Tabla de Detalle */}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {detalle.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#666' }}>
                No hay productos agregados a la cotización.
              </td>
            </tr>
          ) : (
            detalle.map((item, index) => (
              <tr key={index}>
                <td>{item.nombre}</td>
                <td>{item.cantidad}</td>
                <td>Q{Number(item.precioUnitario).toFixed(2)}</td>
                <td>Q{Number(item.subtotal).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleEliminarItem(index)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 4. Resumen y Guardar */}
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <h3>Total Cotizado: Q{montoTotal.toFixed(2)}</h3>
        <button 
          onClick={handleGuardarCotizacion}
          style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Guardar Cotización
        </button>
      </div>
    </div>
  );
};

export default CotizacionPage;