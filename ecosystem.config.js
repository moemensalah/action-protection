module.exports = {
  apps: [
    {
      name: 'latelounge-cafe',
      script: 'server/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader tsx/esm',
      instances: 1, // or 'max' for cluster mode
      exec_mode: 'fork', // or 'cluster' for load balancing
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // PM2 monitoring and restart options
      watch: false, // set to true for development
      max_memory_restart: '500M',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      log_file: './logs/app.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Auto restart on file changes (only for development)
      ignore_watch: [
        'node_modules',
        'logs',
        '*.log'
      ]
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'your-git-repo-url',
      path: '/var/www/latelounge',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save'
    }
  }
};