#!/bin/bash

# =================================================================
# 🚀 Script de Setup Automático para GitHub - AIM Project
# =================================================================
# 
# Este script automatiza el proceso de configuración inicial
# para subir el proyecto AIM a GitHub
#
# Uso: ./github-setup.sh
#
# =================================================================

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_header() {
    echo -e "\n${PURPLE}==================================================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}==================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "\n${CYAN}🔄 $1${NC}"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar prerrequisitos
check_prerequisites() {
    print_header "🔍 VERIFICANDO PRERREQUISITOS"
    
    local missing_deps=0
    
    # Verificar Git
    if command_exists git; then
        print_success "Git está instalado: $(git --version)"
    else
        print_error "Git no está instalado. Por favor instala Git primero."
        missing_deps=1
    fi
    
    # Verificar Docker
    if command_exists docker; then
        print_success "Docker está instalado: $(docker --version)"
    else
        print_error "Docker no está instalado. Por favor instala Docker primero."
        missing_deps=1
    fi
    
    # Verificar Docker Compose
    if command_exists docker-compose; then
        print_success "Docker Compose está instalado: $(docker-compose --version)"
    else
        print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
        missing_deps=1
    fi
    
    # Verificar que estamos en el directorio correcto
    if [[ -f "docker-compose.yml" && -f "env.example" && -f "README.md" ]]; then
        print_success "Estás en el directorio correcto del proyecto AIM"
    else
        print_error "No estás en el directorio raíz del proyecto AIM"
        print_info "Asegúrate de ejecutar este script desde la carpeta 'AIM v2 - copia'"
        missing_deps=1
    fi
    
    if [[ $missing_deps -eq 1 ]]; then
        print_error "Algunos prerrequisitos no están cumplidos. Por favor resolverlos antes de continuar."
        exit 1
    fi
    
    print_success "Todos los prerrequisitos están cumplidos!"
}

# Configurar Git
setup_git() {
    print_header "⚙️ CONFIGURACIÓN DE GIT"
    
    # Verificar si ya hay un repositorio Git
    if [[ -d ".git" ]]; then
        print_warning "Ya existe un repositorio Git en este directorio"
        read -p "¿Quieres continuar? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Proceso cancelado por el usuario"
            exit 1
        fi
    else
        print_step "Inicializando repositorio Git..."
        git init
        print_success "Repositorio Git inicializado"
    fi
    
    # Configurar usuario Git si no está configurado
    if [[ -z $(git config user.name) ]]; then
        read -p "Ingresa tu nombre para Git: " git_name
        git config user.name "$git_name"
        print_success "Nombre configurado: $git_name"
    else
        print_success "Usuario Git ya configurado: $(git config user.name)"
    fi
    
    if [[ -z $(git config user.email) ]]; then
        read -p "Ingresa tu email para Git: " git_email
        git config user.email "$git_email"
        print_success "Email configurado: $git_email"
    else
        print_success "Email Git ya configurado: $(git config user.email)"
    fi
}

# Verificar archivos importantes
verify_files() {
    print_header "📋 VERIFICANDO ARCHIVOS DEL PROYECTO"
    
    local important_files=(
        "README.md"
        "docker-compose.yml"
        "env.example"
        ".gitignore"
        "LICENSE"
        "CHANGELOG.md"
        ".github/workflows/ci.yml"
        "aim-backend/Dockerfile"
        "aim-website/Dockerfile"
    )
    
    local missing_files=0
    
    for file in "${important_files[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "$file existe"
        else
            print_error "$file NO existe"
            missing_files=1
        fi
    done
    
    if [[ $missing_files -eq 1 ]]; then
        print_error "Algunos archivos importantes faltan. Verifica la configuración del proyecto."
        exit 1
    fi
    
    print_success "Todos los archivos importantes están presentes!"
}

# Limpiar archivos sensibles
clean_sensitive_files() {
    print_header "🧹 LIMPIANDO ARCHIVOS SENSIBLES"
    
    # Buscar archivos .env
    local env_files=$(find . -name ".env" -not -name "*.example" -type f 2>/dev/null || true)
    
    if [[ -n "$env_files" ]]; then
        print_warning "Se encontraron archivos .env sensibles:"
        echo "$env_files"
        read -p "¿Quieres moverlos a .env.backup? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            while IFS= read -r file; do
                mv "$file" "${file}.backup"
                print_success "Movido: $file -> ${file}.backup"
            done <<< "$env_files"
        fi
    else
        print_success "No se encontraron archivos .env sensibles"
    fi
    
    # Verificar node_modules
    local node_modules=$(find . -name "node_modules" -type d 2>/dev/null || true)
    if [[ -n "$node_modules" ]]; then
        print_info "Se encontraron directorios node_modules (normal, están en .gitignore)"
    fi
    
    # Verificar dist directories
    local dist_dirs=$(find . -name "dist" -type d 2>/dev/null || true)
    if [[ -n "$dist_dirs" ]]; then
        print_info "Se encontraron directorios dist (normal, están en .gitignore)"
    fi
}

# Test Docker
test_docker() {
    print_header "🐳 PROBANDO CONFIGURACIÓN DOCKER"
    
    print_step "Verificando que Docker esté funcionando..."
    if docker ps >/dev/null 2>&1; then
        print_success "Docker está funcionando correctamente"
    else
        print_error "Docker no está funcionando. ¿Está Docker Desktop ejecutándose?"
        exit 1
    fi
    
    print_step "Copiando env.example a .env para pruebas..."
    cp env.example .env
    print_success "Archivo .env creado para pruebas"
    
    print_step "Construyendo imágenes Docker (esto puede tomar varios minutos)..."
    if docker-compose build --no-cache >/dev/null 2>&1; then
        print_success "Imágenes Docker construidas exitosamente"
    else
        print_error "Error construyendo imágenes Docker"
        print_info "Ejecuta 'docker-compose build' manualmente para ver el error detallado"
        exit 1
    fi
    
    print_step "Iniciando servicios de prueba..."
    if docker-compose up -d >/dev/null 2>&1; then
        print_success "Servicios iniciados"
        
        print_step "Esperando que los servicios estén listos..."
        sleep 30
        
        # Test backend
        if curl -f http://localhost:3001/health >/dev/null 2>&1; then
            print_success "Backend está respondiendo en http://localhost:3001"
        else
            print_warning "Backend no está respondiendo (puede necesitar más tiempo)"
        fi
        
        # Test frontend
        if curl -f http://localhost:4321 >/dev/null 2>&1; then
            print_success "Frontend está respondiendo en http://localhost:4321"
        else
            print_warning "Frontend no está respondiendo (puede necesitar más tiempo)"
        fi
        
        print_step "Deteniendo servicios de prueba..."
        docker-compose down >/dev/null 2>&1
        print_success "Servicios detenidos"
        
        # Limpiar .env de prueba
        rm .env
        print_success "Archivo .env de prueba eliminado"
        
    else
        print_error "Error iniciando servicios Docker"
        print_info "Ejecuta 'docker-compose up' manualmente para ver el error detallado"
        exit 1
    fi
}

# Preparar para GitHub
prepare_for_github() {
    print_header "📤 PREPARANDO PARA GITHUB"
    
    print_step "Agregando archivos al repositorio Git..."
    git add .
    
    print_step "Verificando qué se va a subir..."
    local files_to_commit=$(git status --porcelain | wc -l)
    print_info "Se van a subir $files_to_commit archivos/cambios"
    
    # Verificar que no haya archivos sensibles
    if git status --porcelain | grep -E "\\.env$|node_modules|dist/" >/dev/null 2>&1; then
        print_error "Se detectaron archivos sensibles en el staging area"
        git status --porcelain | grep -E "\\.env$|node_modules|dist/"
        print_info "Estos archivos deberían estar en .gitignore"
        exit 1
    fi
    
    print_success "No se detectaron archivos sensibles"
    
    print_step "Creando commit inicial..."
    git commit -m "🚀 Initial commit: AIM v2 - Sistema completo de automatización industrial

- ✅ Backend Node.js + TypeScript + Prisma
- ✅ Frontend Astro.js + React + Tailwind  
- ✅ Base de datos PostgreSQL
- ✅ Containerización completa con Docker
- ✅ Hot-reloading para desarrollo
- ✅ Configuración de producción optimizada
- ✅ CI/CD con GitHub Actions
- ✅ Documentación completa" >/dev/null 2>&1

    print_success "Commit inicial creado"
}

# Mostrar siguiente pasos
show_next_steps() {
    print_header "🎯 PRÓXIMOS PASOS"
    
    echo -e "${CYAN}Para completar la configuración de GitHub:${NC}\n"
    
    echo -e "${YELLOW}1. Crear repositorio en GitHub:${NC}"
    echo -e "   • Ir a ${BLUE}https://github.com/new${NC}"
    echo -e "   • Nombre: ${GREEN}aim-v2${NC} (o el que prefieras)"
    echo -e "   • Descripción: ${GREEN}Sistema completo de automatización industrial - AIM${NC}"
    echo -e "   • Visibilidad: ${GREEN}Private${NC} (recomendado inicialmente)"
    echo -e "   • ${RED}NO${NC} marcar README, .gitignore, o LICENSE\n"
    
    echo -e "${YELLOW}2. Conectar con GitHub:${NC}"
    echo -e "   ${CYAN}git remote add origin https://github.com/TU-USUARIO/aim-v2.git${NC}"
    echo -e "   ${CYAN}git push -u origin main${NC}\n"
    
    echo -e "${YELLOW}3. Configurar secretos (opcional):${NC}"
    echo -e "   • GitHub repo → Settings → Secrets and variables → Actions"
    echo -e "   • Agregar: ${GREEN}DOCKER_USERNAME${NC} y ${GREEN}DOCKER_PASSWORD${NC}\n"
    
    echo -e "${YELLOW}4. Verificar CI/CD:${NC}"
    echo -e "   • GitHub repo → Actions"
    echo -e "   • Verificar que el workflow 'CI/CD Pipeline' ejecute correctamente\n"
    
    echo -e "${GREEN}📚 Documentación completa en: ${BLUE}GITHUB-SETUP.md${NC}\n"
    
    print_success "¡Setup local completado exitosamente!"
    print_info "Tu proyecto está listo para GitHub 🚀"
}

# Función principal
main() {
    clear
    print_header "🚀 SETUP AUTOMÁTICO GITHUB - PROYECTO AIM"
    
    echo -e "${BLUE}Este script configurará automáticamente tu proyecto para GitHub${NC}"
    echo -e "${BLUE}Proceso estimado: 5-10 minutos${NC}\n"
    
    read -p "¿Continuar con el setup? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelado por el usuario"
        exit 0
    fi
    
    check_prerequisites
    setup_git
    verify_files
    clean_sensitive_files
    test_docker
    prepare_for_github
    show_next_steps
    
    print_header "🎉 ¡SETUP COMPLETADO!"
}

# Manejar Ctrl+C
trap 'echo -e "\n${RED}Setup interrumpido por el usuario${NC}"; exit 1' INT

# Ejecutar función principal
main "$@" 