en backend en el archivo app.js
cuando creen sus modulos de rutas como por ejemplo:
//const ambrocioRoutes = require('./src/routes/ambrocioRoutes');
app.use('/api/ambrocio', ambrocioRoutes);//
lo registran en app.js
no quitar cors() ni express.json() //sino se muere la subida de datos para el body

para levantar el lado del backend
ir cd >carpeta del proyecto cd > backend eh instalar
instalar: npm install
para levantar (ya esta en el package.json) 
usen: npm run dev

notas para el backend 
si van usar estilos los separan en la carpeta estilos y en la carpeta publica para las imagenes tanto para logos como para referencias como por ejemplo que se hace en el sql management 
(nota ser respetuosos no subir nada raro si son amongus esta bien)
en la carpeta components donde se encuentra los estilos 
procurar dejar el diseño estructurar de sus forms las peticiones se hacen en otro lado alli nomas recibe para no saturar al levantar el fronted 
en la carpeta page renderizan sus formularios/tablas y las peticiones en caso mio es donde guarda la info del logueo que se detecta para usarl en el menulateral 

en menu lateral en components agregan el boton para redirigir a su modulo en los estilos esta la function de ocultar igual pueden modificar las sentencias para que tipo de id es valido esto

en el apartado services aqui conectan las pantallas con su backend usa libreria axios mediante http post formateando la api
aqui crean sus peticiones en sus cruds/pantallas

en main no deben modificar nada ya que esta vinculado con el archivo html
para el archivo app.jsx
deben venir a este archivo para declarar la ruta de su nueva vista/página dentro del bloque de rutas hijas del Dashboard
ejemplo todo rancio:
primero importen sus componentes ya deje unos basico para mostrar la function del logueo segun el rol pero aca es algo mas especifico:
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
>
  {/* Registra aquí la vista de tu CRUD */}
  <Route path="productos" element={<ProductosPage />} />
</Route>

para el html
no es necesario modificar nada amenos que quieran modificar algo en este caso

para levantarlo es similar ya deje el package.json
usen otra terminal
ir cd >carpeta del proyecto cd > frontend eh instalar
instalar: npm install
usen: npm run dev
