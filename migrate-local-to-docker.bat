@echo off
echo === MIGRACION DE BASE DE DATOS LOCAL A DOCKER ===
echo.

echo 1. Creando backup del esquema aim_schema local...
pg_dump -U postgres -d aim_db --schema=aim_schema --no-owner --no-privileges -f backup_aim_schema.sql

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo crear backup de la base de datos local
    echo Verifica que PostgreSQL local este corriendo
    pause
    exit /b 1
)

echo 2. Verificando que Docker este funcionando...
docker-compose ps | findstr aim-database
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker no esta corriendo. Ejecuta: docker-compose up -d
    pause
    exit /b 1
)

echo 3. Limpiando base de datos Docker...
docker exec aim-database psql -U aim_user -d aim_db -c "DROP SCHEMA IF EXISTS aim_schema CASCADE;"
docker exec aim-database psql -U aim_user -d aim_db -c "CREATE SCHEMA aim_schema;"

echo 4. Restaurando backup en Docker...
docker exec -i aim-database psql -U aim_user -d aim_db < backup_aim_schema.sql

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo restaurar en Docker
    pause
    exit /b 1
)

echo 5. Verificando migracion...
docker exec aim-database psql -U aim_user -d aim_db -c "SELECT COUNT(*) as usuarios FROM aim_schema.user;"

echo 6. Limpiando archivo temporal...
del backup_aim_schema.sql

echo.
echo === MIGRACION COMPLETADA ===
echo Ahora puedes hacer login en Docker con tus usuarios existentes
echo Ve a: http://localhost:4321/login
pause 