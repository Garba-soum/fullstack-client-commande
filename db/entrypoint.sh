#!/bin/sh
set -e
set -x   # <-- ajoute ça

/opt/mssql/bin/sqlservr &

echo "Waiting..."
until /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT 1" >/dev/null 2>&1
do
  sleep 2
done

echo "Init..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -i /init.sql || true

wait