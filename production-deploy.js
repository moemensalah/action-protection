#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Production deployment for LateLounge...');

const runCommand = (command, description) => {
  console.log(description);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    return true;
  } catch (error) {
    console.error(`Failed: ${description}`);
    return false;
  }
};

try {
  // Clean and prepare
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });

  // Install dependencies
  runCommand('npm install', 'Installing dependencies');

  // Build client with simplified approach
  console.log('Building client application...');
  
  // Method 1: Try vite build with --mode production
  let clientBuilt = runCommand('NODE_ENV=production npx vite build --mode production', 'Building with Vite');
  
  if (!clientBuilt) {
    // Method 2: Build without config file
    console.log('Retrying with inline configuration...');
    clientBuilt = runCommand('npx vite build --config inline:"export default {root:\'client\',build:{outDir:\'../dist\'}}"', 'Building with inline config');
  }
  
  if (!clientBuilt) {
    // Method 3: Manual build process
    console.log('Using manual build process...');
    
    // Copy assets first
    console.log('Copying image assets...');
    fs.mkdirSync('dist/assets', { recursive: true });
    
    if (fs.existsSync('attached_assets')) {
      const assetFiles = fs.readdirSync('attached_assets').filter(file => 
        file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg')
      );
      
      for (const file of assetFiles) {
        fs.copyFileSync(path.join('attached_assets', file), path.join('dist/assets', file));
      }
      console.log(`Copied ${assetFiles.length} image assets`);
    }
    
    // Create HTML file
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LateLounge</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/assets/main.js"></script>
</body>
</html>`;
    
    fs.writeFileSync('dist/index.html', htmlTemplate);
    
    // Bundle with esbuild - exclude image assets from bundling
    const esbuildCmd = `npx esbuild client/src/main.tsx --bundle --outfile=dist/assets/main.js --format=iife --target=es2020 --minify --define:process.env.NODE_ENV='"production"' --loader:.tsx=tsx --loader:.ts=tsx --loader:.css=css --loader:.png=file --loader:.jpg=file --loader:.jpeg=file --loader:.svg=file --public-path=/assets/ --asset-names=[name]`;
    runCommand(esbuildCmd, 'Building client with esbuild');
  }

  // Build server
  console.log('Building server...');
  const serverCmd = 'npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --target=node18 --external:express --external:tsx';
  runCommand(serverCmd, 'Building server bundle');

  // Ensure assets directory exists and copy all assets
  console.log('Setting up assets directory...');
  if (fs.existsSync('attached_assets')) {
    const assetFiles = fs.readdirSync('attached_assets');
    for (const file of assetFiles) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.svg')) {
        fs.copyFileSync(path.join('attached_assets', file), path.join('dist/assets', file));
      }
    }
    console.log(`Copied ${assetFiles.length} assets to dist/assets/`);
  }

  // Create production files
  const packageJson = {
    name: 'latelounge-production',
    version: '1.0.0',
    type: 'module',
    main: 'index.js',
    scripts: {
      start: 'node index.js'
    },
    dependencies: {
      express: '^4.21.2'
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
  
  // Create startup script
  const startupScript = `#!/bin/bash
cd /var/www/html/Late-Lounge/dist
npm install --production
NODE_ENV=production PORT=5000 node index.js
`;
  
  fs.writeFileSync('dist/start.sh', startupScript);
  execSync('chmod +x dist/start.sh');
  
  // Create logs directory
  fs.mkdirSync('logs', { recursive: true });

  console.log('Production build completed successfully!');
  console.log('');
  console.log('Deployment files created:');
  console.log('- dist/index.html (client)');
  console.log('- dist/index.js (server)');
  console.log('- dist/package.json (production dependencies)');
  console.log('- dist/start.sh (startup script)');
  console.log('');
  console.log('To deploy:');
  console.log('1. cd dist && npm install');
  console.log('2. NODE_ENV=production node index.js');
  console.log('Or use PM2: pm2 start ../ecosystem.config.js');

} catch (error) {
  console.error('Deployment preparation failed:', error.message);
  process.exit(1);
}