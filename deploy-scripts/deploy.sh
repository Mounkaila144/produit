#!/bin/bash

# Script de déploiement pour NigerDev E-commerce Platform
# Auteur: Mounkaila
# Date: $(date)

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Démarrage du déploiement NigerDev..."
echo "========================================"

# Variables
PROJECT_DIR="/var/www/nigerdev"
BACKEND_DIR="$PROJECT_DIR/produit_backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
LOG_DIR="/var/log/pm2"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si le script est exécuté en tant que root
if [[ $EUID -ne 0 ]]; then
   log_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

# Créer les dossiers de logs si nécessaire
log_info "Création des dossiers de logs..."
mkdir -p $LOG_DIR
chown -R www-data:www-data $LOG_DIR

# Fonction pour vérifier les services
check_service() {
    if systemctl is-active --quiet $1; then
        log_success "$1 est actif"
        return 0
    else
        log_error "$1 n'est pas actif"
        return 1
    fi
}

# Vérifier les services requis
log_info "Vérification des services..."
check_service mysql || exit 1
check_service apache2 || exit 1

# Aller dans le répertoire du projet
cd $PROJECT_DIR

# Mise à jour du code source
log_info "Mise à jour du code source..."
git stash push -m "Auto-stash before deployment $(date)"
git pull origin master
log_success "Code source mis à jour"

# ===================================
# DÉPLOIEMENT BACKEND
# ===================================
log_info "Déploiement du backend..."
cd $BACKEND_DIR

# Installation des dépendances
log_info "Installation des dépendances backend..."
npm install --production --silent

# Exécution des migrations
log_info "Exécution des migrations de base de données..."
npm run migrate

# Vérifier la configuration
if [[ ! -f .env ]]; then
    log_error "Fichier .env manquant dans le backend"
    exit 1
fi

# Arrêter l'ancien processus PM2 backend s'il existe
log_info "Arrêt de l'ancien processus backend..."
pm2 delete nigerdev-backend 2>/dev/null || true

# Démarrer le nouveau processus backend
log_info "Démarrage du nouveau processus backend..."
pm2 start ecosystem.config.js --env production
log_success "Backend démarré avec PM2"

# ===================================
# DÉPLOIEMENT FRONTEND
# ===================================
log_info "Déploiement du frontend..."
cd $FRONTEND_DIR

# Installation des dépendances
log_info "Installation des dépendances frontend..."
npm install --silent

# Vérifier la configuration
if [[ ! -f .env.local ]]; then
    log_error "Fichier .env.local manquant dans le frontend"
    exit 1
fi

# Build du frontend
log_info "Build du frontend Next.js..."
npm run build
log_success "Frontend construit avec succès"

# Arrêter l'ancien processus PM2 frontend s'il existe
log_info "Arrêt de l'ancien processus frontend..."
pm2 delete nigerdev-frontend 2>/dev/null || true

# Démarrer le nouveau processus frontend
log_info "Démarrage du nouveau processus frontend..."
pm2 start ecosystem.config.js --env production
log_success "Frontend démarré avec PM2"

# ===================================
# CONFIGURATION ET VÉRIFICATIONS
# ===================================

# Sauvegarder la configuration PM2
log_info "Sauvegarde de la configuration PM2..."
pm2 save

# Configurer PM2 pour le démarrage automatique
log_info "Configuration du démarrage automatique..."
pm2 startup systemd -u www-data --hp /var/www 2>/dev/null || true

# Vérifier les permissions
log_info "Vérification des permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# Vérifier l'état des processus
log_info "Vérification de l'état des processus..."
pm2 status

# Attendre quelques secondes pour que les services démarrent
sleep 5

# Tests de connectivité
log_info "Tests de connectivité..."

# Test backend
if curl -s http://localhost:8001/api/test-backend > /dev/null; then
    log_success "Backend accessible sur le port 8001"
else
    log_error "Backend inaccessible sur le port 8001"
fi

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    log_success "Frontend accessible sur le port 3000"
else
    log_error "Frontend inaccessible sur le port 3000"
fi

# Redémarrer Apache pour s'assurer que la configuration est prise en compte
log_info "Redémarrage d'Apache..."
systemctl reload apache2
log_success "Apache redémarré"

# ===================================
# FINALISATION
# ===================================

log_info "Nettoyage..."
# Nettoyer les anciens logs (garder les 7 derniers jours)
find $LOG_DIR -name "*.log" -mtime +7 -delete 2>/dev/null || true

log_success "Déploiement terminé avec succès!"
echo "========================================"
echo "📊 Résumé du déploiement:"
echo "   - Backend: http://localhost:8001"
echo "   - Frontend: http://localhost:3000"
echo "   - Site web: https://nigerdev.com"
echo ""
echo "📋 Commandes utiles:"
echo "   - Logs: pm2 logs"
echo "   - Status: pm2 status"
echo "   - Monitoring: pm2 monit"
echo "   - Redémarrer: pm2 restart all"
echo ""
echo "✅ Votre application est maintenant en ligne!"
echo "========================================" 