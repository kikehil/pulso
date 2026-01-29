// Configuración de PM2 para producción
// Uso: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'pulsetec-lms',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/pulsetec-lms',
      instances: 1, // Cambiar a 'max' para usar todos los CPUs
      exec_mode: 'fork', // Cambiar a 'cluster' si instances > 1
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      // Restart automático
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Graceful reload
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],

  // Deployment configuration (opcional)
  deploy: {
    production: {
      user: 'deployer',
      host: 'TU_VPS_IP',
      ref: 'origin/main',
      repo: 'git@github.com:tu-usuario/tu-repo.git',
      path: '/var/www/pulsetec-lms',
      'post-deploy':
        'npm install && npx prisma generate && npx prisma db push && npm run build && pm2 reload ecosystem.config.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
