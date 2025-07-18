# Etapa base: Configuración común para desarrollo y producción
FROM node:18-alpine AS base

# Instalar dependencias necesarias para Prisma y otras librerías nativas
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Etapa de dependencias: Instalar todas las dependencias
FROM base AS deps

# Instalar dependencias (incluye devDependencies para build)
RUN npm ci --frozen-lockfile

# Generar el cliente de Prisma
RUN npx prisma generate

# Etapa de construcción: Compilar TypeScript
FROM base AS builder

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copiar código fuente
COPY . .

# Configurar el PATH de TypeScript
ENV PATH=/app/node_modules/.bin:$PATH

# Compilar TypeScript
RUN npm run build

# Etapa de producción: Imagen mínima para producción
FROM base AS production

# Instalar solo dependencias de producción
RUN npm ci --frozen-lockfile --only=production && npm cache clean --force

# Generar cliente de Prisma para producción
RUN npx prisma generate

# Copiar código compilado desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 aimbackend
USER aimbackend

# Exponer puerto
EXPOSE 3001

# Comando para producción
CMD ["npm", "start"]

# Etapa de desarrollo: Con hot-reloading
FROM base AS development

# Instalar todas las dependencias (incluye devDependencies)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copiar código fuente (se sobrescribirá con bind mount en development)
COPY . .

# Crear usuario no-root para desarrollo
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 aimbackend

# Cambiar propiedad de archivos al usuario no-root
RUN chown -R aimbackend:nodejs /app
USER aimbackend

# Exponer puerto
EXPOSE 3001

# Comando para desarrollo con hot-reloading
CMD ["npm", "run", "dev"] 