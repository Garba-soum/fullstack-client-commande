#!/bin/sh
set -e
set -x

/opt/mssql/bin/sqlservr &

echo "Waiting for SQL Server..."
until /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT 1" >/dev/null 2>&1
do
  sleep 2
done

echo "Running init.sql..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -i /init.sql

wait