module.exports = {
  apps: [{
    name: 'nigerdev-frontend',
    script: 'npm',
    args: 'start',
    instances: 1, // Next.js SSR fonctionne mieux avec 1 instance
    exec_mode: 'fork',
    cwd: '/var/www/nigerdev/frontend',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    // Logs
    error_file: '/var/log/pm2/nigerdev-frontend-error.log',
    out_file: '/var/log/pm2/nigerdev-frontend-out.log',
    log_file: '/var/log/pm2/nigerdev-frontend.log',
    time: true,
    
    // Monitoring et redémarrage
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Options spécifiques à Next.js
    kill_timeout: 5000,
    listen_timeout: 8000,
    wait_ready: true,
    
    // Variables d'environnement
    env_vars: {
      NODE_OPTIONS: '--max-old-space-size=1024'
    }
  }]
}; 