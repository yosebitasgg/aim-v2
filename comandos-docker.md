# 🐳 Comandos Docker para AIM v2

## 🛑 **APAGAR TODO**

### Apagar completamente Docker:
```bash
docker-compose down
```

### Apagar y eliminar volúmenes (⚠️ BORRA DATOS):
```bash
docker-compose down -v
```

### Apagar solo un servicio específico:
```bash
docker-compose stop frontend
docker-compose stop backend
docker-compose stop db
```

---

## 🚀 **ARRANCAR TODO**

### Arrancar todos los servicios:
```bash
docker-compose up -d
```

### Arrancar con logs visibles:
```bash
docker-compose up
```

### Arrancar solo un servicio específico:
```bash
docker-compose up -d frontend
docker-compose up -d backend
docker-compose up -d db
```

---

## 🔄 **REINICIAR SERVICIOS**

### Reiniciar todos:
```bash
docker-compose restart
```

### Reiniciar servicio específico:
```bash
docker-compose restart frontend
docker-compose restart backend
docker-compose restart db
```

---

## 🔧 **REBUILDING (Cuando cambias código)**

### Rebuild completo sin cache:
```bash
docker-compose build --no-cache
```

### Rebuild solo frontend:
```bash
docker-compose build --no-cache frontend
```

### Rebuild solo backend:
```bash
docker-compose build --no-cache backend
```

### Rebuild y arrancar:
```bash
docker-compose up -d --build
```

---

## 📊 **MONITOREO Y LOGS**

### Ver estado de contenedores:
```bash
docker-compose ps
```

### Ver logs de todos los servicios:
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico:
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### Ver últimas 50 líneas de logs:
```bash
docker-compose logs --tail=50 -f backend
```

---

## 🗃️ **BASE DE DATOS**

### Conectar a PostgreSQL:
```bash
docker exec -it aim-database psql -U aim_user -d aim_db
```

### Backup de base de datos:
```bash
docker exec aim-database pg_dump -U aim_user aim_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Ejecutar script de migración:
```bash
.\migrate-local-to-docker.bat
```

---

## 🧹 **LIMPIEZA**

### Limpiar contenedores parados:
```bash
docker container prune
```

### Limpiar imágenes no usadas:
```bash
docker image prune
```

### Limpiar todo (⚠️ CUIDADO):
```bash
docker system prune -a --volumes
```

---

## 🆘 **RESOLUCIÓN DE PROBLEMAS**

### Si un puerto está ocupado:
```bash
# Ver qué usa el puerto 3001:
netstat -ano | findstr :3001

# Ver qué usa el puerto 4321:
netstat -ano | findstr :4321
```

### Si el contenedor no inicia:
```bash
# Ver errores específicos:
docker-compose logs nombre_servicio

# Forzar recreación:
docker-compose up -d --force-recreate nombre_servicio
```

### Si hay problemas de permisos:
```bash
# Reconstruir desde cero:
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔀 **DESARROLLO LOCAL vs DOCKER**

### Para desarrollo local (SIN Docker):
```bash
# 1. Apagar Docker:
docker-compose down

# 2. En terminal 1 (Backend):
cd aim-backend
npm run dev

# 3. En terminal 2 (Frontend):
cd aim-website
npm run dev
```

### Para volver a Docker:
```bash
# Cerrar terminales de desarrollo local
# Arrancar Docker:
docker-compose up -d
```

---

## 📚 **COMANDOS ÚTILES EXTRAS**

### Ver uso de recursos:
```bash
docker stats
```

### Entrar a un contenedor:
```bash
docker exec -it aim-backend /bin/sh
docker exec -it aim-frontend /bin/sh
docker exec -it aim-database /bin/sh
```

### Ver configuración completa:
```bash
docker-compose config
```

### Ver imágenes disponibles:
```bash
docker images
```

---

## 🎯 **COMANDOS MÁS USADOS**

```bash
# Los 5 comandos que más vas a usar:
docker-compose up -d        # Arrancar todo
docker-compose down         # Apagar todo
docker-compose logs -f      # Ver logs
docker-compose ps           # Ver estado
docker-compose restart      # Reiniciar
``` 