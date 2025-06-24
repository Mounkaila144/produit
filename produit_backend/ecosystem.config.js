module.exports = {
  apps: [{
    name: 'nigerdev-backend',
    script: 'src/server.js',
    instances: 2, // 2 instances pour la performance
    exec_mode: 'cluster',
    cwd: '/var/www/nigerdev/produit_backend',
    env: {
      NODE_ENV: 'production',
      PORT: 8001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8001
    },
    // Logs
    error_file: '/var/log/pm2/nigerdev-backend-error.log',
    out_file: '/var/log/pm2/nigerdev-backend-out.log',
    log_file: '/var/log/pm2/nigerdev-backend.log',
    time: true,
    
    // Monitoring et redémarrage
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Autres options
    kill_timeout: 5000,
    listen_timeout: 3000,
    wait_ready: true,
    
    // Variables d'environnement additionnelles
    env_vars: {
      NODE_OPTIONS: '--max-old-space-size=1024'
    }
  }]
}; 