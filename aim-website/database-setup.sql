-- ==============================================
-- CONFIGURACIÓN DE BASE DE DATOS PARA AIM
-- ==============================================
-- Ejecuta estos comandos en tu cliente PostgreSQL (pgAdmin o psql)

-- 1. CREAR LA NUEVA BASE DE DATOS
-- Ejecuta esto conectado a PostgreSQL como superusuario
CREATE DATABASE aim_db;

-- 2. CONECTARSE A LA NUEVA BASE DE DATOS
-- Ahora conéctate a la base de datos "aim_db" y ejecuta lo siguiente:

-- 3. CREAR EL ESQUEMA
CREATE SCHEMA aim_schema;

-- 4. CREAR LAS TABLAS
-- Tabla para los usuarios
CREATE TABLE aim_schema.user (
    "id" VARCHAR(15) PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla para las credenciales de los usuarios
CREATE TABLE aim_schema.key (
    "id" VARCHAR(255) PRIMARY KEY,
    "user_id" VARCHAR(15) NOT NULL REFERENCES aim_schema.user(id),
    "hashed_password" VARCHAR(255)
);

-- Tabla para las sesiones de los usuarios
CREATE TABLE aim_schema.session (
    "id" VARCHAR(127) PRIMARY KEY,
    "user_id" VARCHAR(15) NOT NULL REFERENCES aim_schema.user(id),
    "active_expires" BIGINT NOT NULL,
    "idle_expires" BIGINT NOT NULL
);

-- 5. CREAR ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX idx_user_email ON aim_schema.user(email);
CREATE INDEX idx_key_user_id ON aim_schema.key(user_id);
CREATE INDEX idx_session_user_id ON aim_schema.session(user_id);
CREATE INDEX idx_session_expires ON aim_schema.session(active_expires);

-- 6. VERIFICAR LA CREACIÓN
-- Ejecuta estas consultas para verificar que todo se creó correctamente
SELECT table_name FROM information_schema.tables WHERE table_schema = 'aim_schema';
SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'aim_schema' AND table_name = 'user'; 