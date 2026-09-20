# Lo que falta, es mas para javi

Javi, el front ya quedó completo con las 4 pantallas de mantenimiento que pide
el proyecto (Usuarios, Productos, Clientes y Proveedores) más el módulo de
Caja. Aquí te dejo todo lo que te toca hacer, endpoint por endpoint, para que
no andés adivinando qué GET o POST va en cada pantalla. Ya quité el módulo de
ejemplo porque con las 4 tablas fuertes de verdad ya no hacía falta.

Antes de empezar, corré el script de la base de datos que dejó Jonás
(`db/scripts/`) si todavía no lo tenés montado en tu SQL Server local.

---

## Cómo levantar esto (instrucciones de Jonas igual en public estan si no estoy mal como hacer tu usuario en SSMS guiate de ahi tmb)

**Backend:**
```
cd backend
npm install
npm run dev
```
(el `npm run dev` ya está configurado en el package.json, no hay que tocarle nada)

**Frontend** (en otra terminal, aparte):
```
cd frontend
npm install
npm run dev
```

Cuando armés tus rutas nuevas, se registran en `app.js` así como ya venía el
ejemplo:
```js
// const javiRoutes = require('./src/routes/javiRoutes');
// app.use('/api/javi', javiRoutes);
```
**No le quités `cors()` ni `express.json()` de `app.js`**, porque si los
quitás se muere la subida de datos del body y ningún POST te va a llegar.

---

## Cuáles son las 4 tablas fuertes (y por qué)

Una tabla fuerte es la que existe por sí sola, no depende de que exista otra
fila en otra tabla para tener sentido. Estas son las 4 que cuentan para el
requisito del proyecto:

1. **USUARIOS** — ya tiene su pantalla armada en `UsuariosPage.jsx`
2. **PRODUCTOS** — ya tiene su pantalla en `InventarioPage.jsx`
3. **CLIENTES** — pantalla nueva en `ClientesPage.jsx`
4. **PROVEEDORES** — pantalla nueva en `ProveedoresPage.jsx`

Las últimas 2 (Clientes y Proveedores) son las que acabo de agregar al front
para completar el requisito, porque antes solo teníamos 2 tablas fuertes con
mantenimiento real y el proyecto pide 4. Ninguna de las dos depende de otra
tabla para existir — un cliente o un proveedor se puede dar de alta sin que
exista ninguna factura ni ninguna orden de compra todavía, por eso cuentan
como fuertes. En cambio cosas como `FACTURAS_DETALLE` o
`RECEPCIONES_COMPRA_DETALLE` no cuentan, porque sin una factura o una orden
de compra ya creada, esas filas no tienen ningún sentido.

---

## 1. Autenticación (esto es lo primero que hay que dejar bien)

En el script ya están las columnas para esto en la tabla `USUARIOS`:
- `PasswordHash VARBINARY(64)`
- `Salt VARBINARY(32)`

O sea que la contraseña **nunca** se guarda en texto plano. La idea es así:

- **Al crear un usuario:** generás un salt random con `crypto.randomBytes(16)`,
  sacás el hash de la contraseña + ese salt con `crypto.pbkdf2Sync` (con
  Node ya viene, no hay que instalar nada), y guardás los dos binarios en sus
  columnas.
- **Al hacer login:** buscás al usuario por `NombreUsuario`, sacás el `Salt`
  que ya tiene guardado, volvés a sacar el hash de la contraseña que mandaron
  desde el front pero usando ESE mismo salt, y comparás contra el
  `PasswordHash` guardado. Si coinciden, pasa.

Revisá primero `backend/src/controllers/authController.js`,
`authService.js` y `authRoutes.js` porque ya existen esos archivos — puede
que Jonás ya haya dejado algo armado ahí. Si ya está, solo confirmá que
realmente esté cifrando y no dejando la password plana por ahí.

**Nunca** le mandes de vuelta al front el hash ni el salt en la respuesta del
login, con que regreses `usuario`, `rol` e `idRol` basta (así lo está
guardando el front en el `localStorage`).

---

## 2. Usuarios y Roles

Archivos del front que ya están esperando esto: `pages/UsuariosPage.jsx`,
`services/usuariosService.js`.

- `GET /api/usuarios` → trae todos los usuarios de la tabla `USUARIOS`.
  **Ojo:** no regreses `PasswordHash` ni `Salt` en el select, esos se quedan
  en el backend nada más.
- `POST /api/usuarios` → crea uno nuevo. Te llega `NombreUsuario`, `Password`,
  `IdRol` y `Estado` desde `UsuarioForm.jsx`. Aquí es donde cifrás la
  contraseña antes de guardarla (ver punto 1).
- `GET /api/roles` → trae todo de la tabla `ROLES`, para llenar el select del
  formulario.

---

## 3. Productos (módulo de Inventario / Digitación)

Archivos: `pages/InventarioPage.jsx`, `components/ProductoForm.jsx`. Ahorita
la tabla tiene data quemada de ejemplo, hay que quitarla.

- `GET /api/productos` → trae todo de `PRODUCTOS`, para la tabla de la
  pantalla.
- `POST /api/productos` → crea uno nuevo. El formulario manda
  `NombreProducto`, `PrecioVentaBase`, `ManejaLote`, y los IDs de Marca,
  Presentación, Categoría y Color.
- También necesitás 4 GETs chiquitos para llenar los selects del formulario:
  - `GET /api/marcas` → tabla `MARCAS`
  - `GET /api/presentaciones` → tabla `PRESENTACIONES`
  - `GET /api/categorias` → tabla `CATEGORIAS`
  - `GET /api/colores` → tabla `COLORES`

---

## 4. Clientes (tabla fuerte nueva)

Archivos: `pages/ClientesPage.jsx`, `components/ClienteForm.jsx`,
`services/clientesService.js`. Esta está sencilla, la tabla `CLIENTES` no
tiene relación con nada más.

- `GET /api/clientes` → trae todo de `CLIENTES`.
- `POST /api/clientes` → crea uno nuevo. Te llega `Nombre`, `NIT` y
  `EsEmpresa` (boolean). Si el NIT viene como `"CF"` (consumidor final) dejalo
  guardar igual, no le pongas validación de formato de NIT porque se ocupa
  para eso.

---

## 5. Proveedores (tabla fuerte nueva)

Archivos: `pages/ProveedoresPage.jsx`, `components/ProveedorForm.jsx`,
`services/proveedoresService.js`. Igual de sencilla que Clientes, la tabla
`PROVEEDORES` tampoco depende de nada.

- `GET /api/proveedores` → trae todo de `PROVEEDORES`.
- `POST /api/proveedores` → crea uno nuevo. Te llega `NombreProveedor`, `NIT`
  y `Telefono`.

---

## 6. Caja / Facturación (la más pesada, dejala para el final)

Archivo: `components/FacturaForm.jsx`. Esta pantalla necesita jalar de varias
tablas a la vez:

- `GET` a **Clientes** → para el select de "Cliente (NIT o Nombre)" (mismo
  endpoint del punto 4, no hay que duplicarlo)
- `GET` a **Productos** con stock disponible → tenés que cruzar `PRODUCTOS`
  con `INVENTARIO_LOTES` para saber cuáles sí tienen `CantidadDisponible`
  mayor a 0
- `GET /api/mediospago` → tabla `MEDIOS_PAGO`, para el select de forma de
  pago

Y cuando le dan a "Generar Factura y Cobrar":

- `POST` que inserte primero en `FACTURAS_ENCABEZADO` (cliente, usuario que
  factura, fecha, monto total) y después, con el `IdFactura` que te regresa
  esa inserción, metas los renglones en `FACTURAS_DETALLE` (uno por cada
  producto del carrito, con su `IdLote`, cantidad, precio y subtotal).
- Esto va **en una sola transacción de SQL Server** (`BEGIN TRAN` /
  `COMMIT` / `ROLLBACK`), porque si truena a la mitad no querés que quede una
  factura sin su detalle, o cobrando algo que nunca se guardó completo.
- De paso, ahí mismo le restás la cantidad vendida al `CantidadDisponible`
  del lote correspondiente en `INVENTARIO_LOTES`.
- Si manejan medios de pago mixtos, también insertás en `FACTURAS_PAGOS`.

---

## Orden sugerido para no enredarte

1. Confirmar que el login ya cifra la contraseña bien (bloquea todo lo demás)
2. Usuarios y Roles
3. Productos (más sus 4 catálogos: marcas, presentaciones, categorías, colores)
4. Clientes y Proveedores (van rápido, son las más sencillas)
5. Caja al final, porque junta todo lo anterior

---

## Cómo está organizado el front (para que sepas dónde ir a revisar)

- **`pages/`** → aquí están las pantallas completas (tabla + botón de
  mostrar/ocultar formulario). Aquí es donde se hacen las peticiones de
  verdad con axios, usando las funciones que vienen de `services/`.
- **`components/`** → aquí están los formularios, pero solo el diseño y el
  manejo del estado de los inputs. No hacen peticiones directo, nomás le
  pasan la info a la page con `onSubmit`.
- **`services/`** → aquí están las funciones de axios (`getUsuarios`,
  `createUsuario`, etc.), apuntando a `http://localhost:5000/api/...`. Si tu
  backend corre en otro puerto, es aquí donde se cambia la URL base.
- **`App.jsx`** → aquí ya están registradas todas las rutas hijas del
  Dashboard (`usuarios`, `clientes`, `proveedores`, `digitacion`, `caja`,
  `gerencia`). No hace falta que agregués nada aquí a menos que armes una
  pantalla totalmente nueva.
- **`components/MenuLateral.jsx`** → aquí están los botones del menú y el
  filtro de qué botón se ve según el `idRol` que viene guardado en el
  `localStorage` desde el login.
- **`main.jsx`** → este no se toca, está vinculado directo al `index.html`.
- **`components/estilos/`** → todo el CSS vive aquí, no hay que crear
  carpetas de estilos nuevas.

Cualquier duda de qué campo exacto espera cada formulario, revisá el `.jsx`
del form correspondiente — ahí está el `useState` con los nombres exactos de
cada campo tal como los vas a recibir en el `req.body`.