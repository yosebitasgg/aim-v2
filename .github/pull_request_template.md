## 📋 Descripción del Cambio

<!-- Describe brevemente qué hace este PR -->

## 🔄 Tipo de Cambio

<!-- Marca una opción -->

- [ ] 🐛 Bug fix (cambio que soluciona un problema)
- [ ] ✨ Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] 💥 Breaking change (cambio que podría afectar funcionalidad existente)
- [ ] 📚 Documentación (solo cambios en documentación)
- [ ] 🎨 Estilo (formateo, espacios, etc; sin cambios de código)
- [ ] ♻️ Refactoring (ni agrega funcionalidad ni corrige bugs)
- [ ] ⚡ Performance (mejora de rendimiento)
- [ ] 🧪 Tests (agregar o corregir tests)
- [ ] 🔧 Configuración (cambios en configuración, build, CI/CD, etc)

## 🧪 Testing

<!-- Describe qué tests ejecutaste -->

- [ ] Tests automatizados pasan (`npm test`)
- [ ] Tests de integración pasan (`docker-compose up`)
- [ ] Tests manuales realizados
- [ ] No requiere testing

### Comandos de testing ejecutados:
```bash
# Ejemplo:
# cd aim-backend && npm test
# docker-compose up -d && curl http://localhost:4321
```

## 📸 Screenshots (si aplica)

<!-- Agrega screenshots si hay cambios visuales -->

## ✅ Checklist

<!-- Marca todo lo que aplique -->

### Código
- [ ] Mi código sigue el estilo del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código en áreas complejas
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban mi funcionalidad
- [ ] Tests nuevos y existentes pasan localmente

### Documentación
- [ ] He actualizado la documentación relevante
- [ ] He actualizado el README si es necesario
- [ ] He agregado comentarios en código complejo

### Base de Datos (si aplica)
- [ ] He creado/actualizado migraciones de Prisma
- [ ] He actualizado el esquema de la base de datos
- [ ] He probado las migraciones

### Docker (si aplica)
- [ ] Los contenedores se construyen correctamente
- [ ] Docker Compose funciona sin errores
- [ ] Hot-reloading funciona en desarrollo

## 🔗 Issues Relacionados

<!-- Liga a issues relacionados usando "Fixes #123" o "Closes #123" -->

Fixes #(issue_number)

## 📋 Notas Adicionales

<!-- Cualquier información adicional relevante para los reviewers -->

## 🧠 Consideraciones para el Review

<!-- Ayuda a los reviewers enfocándose en áreas específicas -->

- [ ] Revisar lógica de negocio en `[archivo]`
- [ ] Verificar validación de datos en `[archivo]`
- [ ] Confirmar manejo de errores
- [ ] Revisar queries de base de datos
- [ ] Verificar permisos y seguridad
- [ ] Confirmar que no hay hardcoded values 