# OMNI-SAZO: entorno local con Docker

## Requisitos 
- Docker Desktop (con 4 GB de RAM o más asignados: sino vayan a: Settings > Resources)
- Usen siempre git no todo en consola de visual

Revisar bien si funciona de forma local para DB sino en config/db.js y en el apartado no cambiar para las variables del .ev sino en el apartado or para dejar sus datos como lo tenian antes 

## Pasos
1. Clonar y entrar a la rama:
   ```bash
   git clone https://github.com/Jonathan-Son-706-US/OMNI-SAZO.git
   cd OMNI-SAZO
   git checkout dev-jonas
   ```
2. Crear el archivo `.env` (en la raíz, junto a `docker-compose.yml`):
   ```bash
   cp .env.example .env    
   ```
   Abrirlo y poner contraseñas propias. La de `SA_PASSWORD`
3. Levantar todo:
   ```bash
   docker compose up -d --build
   ```
   nota como van a descarga sql management server va a tardar un rato no vayan a cancelar 
4. Verificar si se creo todo en este caso los usarios y los inserts del script 06
   ```bash
   docker logs omni_db_init
   ```
   Debe terminar con `>> Base de datos lista`.
5. Abrir http://localhost:5173

## Desarrollo con cambios en vivo
- Frontend: editar cualquier archivo de `frontend/src` y el navegador se actualiza solo.
- Backend: editar cualquier archivo y nodemon reinicia el servidor.
  Para verlo: `docker logs -f omni_backend`.

## Lista de Comandos usados para todo el entorno local

`docker compose ps` : Estado de los servicios 
`docker compose logs -f` : Logs de todo en vivo 
`docker compose down` : Apaga, conserva la base de datos 
`docker compose down -v` : Esto es para abortar todo o dejar de 0 no usen esto es el anterior el nomas para apagarlo
`docker stats` : CPU y memoria de cada contenedor 

## Para no estar haciendo todas las consultas en consola aplicando lo que nos enseñaron en DB las primeras clases para la conexión remota les dejo esto para que puedan revisar o mirar de forma mas tranqui deben encender sql server en services
Servidor `localhost,1434`, usuario `sa`, contraseña `SA_PASSWORD` del `.env`,
y marcar "Confiar en el certificado del servidor".

