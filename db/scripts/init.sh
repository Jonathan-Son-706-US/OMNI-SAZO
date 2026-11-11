#!/bin/bash
set -e

SQLCMD=/opt/mssql-tools18/bin/sqlcmd
run() { $SQLCMD -S sqlserver -U sa -P "$MSSQL_SA_PASSWORD" -C -b -f 65001 "$@"; }
val() { run -d OMNISAZO -h -1 -W -Q "SET NOCOUNT ON; $1" | tr -d '[:space:]'; }

echo ">> Creando BD y usuario de la app"
run -i /scripts/00_CrearBD_User.sql -v APP_USER="$DB_USER" APP_PASS="$DB_PASSWORD"

if [ "$(val "SELECT CASE WHEN OBJECT_ID('dbo.ROLES','U') IS NULL THEN 0 ELSE 1 END")" = "0" ]; then
  echo ">> Creando DB tablas"
  run -i /scripts/01_PFBD2Script.sql
fi

echo ">> Aplicando procedimientos almacenados"
for f in /scripts/0[2-5]_*.sql; do
  echo "   $f"
  run -d OMNISAZO -i "$f"
done

if [ "$(val "SELECT COUNT(*) FROM dbo.ROLES")" = "0" ]; then
  echo ">> Cargando datos iniciales"
  run -d OMNISAZO -i /scripts/06_INSERTSPFBD2Script.sql
fi

echo ">> Base de datos lista"