# Etapa base: Configuración común
FROM node:18-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat && rm -rf /var/cache/apk/*

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Etapa de dependencias: Instalar todas las dependencias
FROM base AS deps

# Instalar dependencias
RUN npm ci --frozen-lockfile

# Etapa de construcción: Compilar aplicación Astro
FROM base AS builder

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Construir aplicación para producción
ENV NODE_ENV=production
RUN npm run build

# Etapa de producción: Servir con NGINX
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar configuración personalizada de NGINX
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    listen [::]:80;
    server_name localhost;
    
    # Configuración para aplicaciones SPA/SSR
    root /usr/share/nginx/html;
    index index.html;
    
    # Configuración de headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Configuración de compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Configuración de caché para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # Configuración para rutas de la aplicación
    location / {
        try_files $uri $uri/ /index.html;
        
        # Headers para HTML
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Ocultar versión de NGINX
    server_tokens off;
    
    error_page 404 /index.html;
}
EOF

# Copiar archivos construidos desde la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear usuario no-root para NGINX
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user

# Configurar permisos
RUN chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html

# Cambiar al usuario no-root
USER nginx-user

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Comando para iniciar NGINX
CMD ["nginx", "-g", "daemon off;"]

# Etapa de desarrollo: Con hot-reloading
FROM base AS development

# Instalar todas las dependencias
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente (se sobrescribirá con bind mount en development)
COPY . .

# Crear usuario no-root para desarrollo
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -D -H -u 1001 -h /app -s /bin/sh -G nodejs -g nodejs aimfrontend

# Cambiar propiedad de archivos al usuario no-root
RUN chown -R aimfrontend:nodejs /app
USER aimfrontend

# Exponer puerto de desarrollo (Astro default: 4321)
EXPOSE 4321

# Comando para desarrollo con hot-reloading
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 