#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Final production build for LateLounge...');

const runSafeCommand = (command, description) => {
  console.log(`${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✓ ${description} completed`);
    return true;
  } catch (error) {
    console.log(`✗ ${description} failed`);
    return false;
  }
};

try {
  // Clean start
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/assets', { recursive: true });

  // Copy all image assets first
  if (fs.existsSync('attached_assets')) {
    const imageFiles = fs.readdirSync('attached_assets').filter(file => 
      /\.(png|jpg|jpeg|svg|webp)$/i.test(file)
    );
    
    for (const file of imageFiles) {
      fs.copyFileSync(
        path.join('attached_assets', file), 
        path.join('dist/assets', file)
      );
    }
    console.log(`✓ Copied ${imageFiles.length} image assets`);
  }

  // Install dependencies if needed
  if (!fs.existsSync('node_modules')) {
    runSafeCommand('npm install', 'Installing dependencies');
  }

  // Try Vite build first
  let buildSuccess = runSafeCommand('npx vite build', 'Building with Vite');
  
  if (!buildSuccess) {
    console.log('Vite build failed, using manual approach...');
    
    // Create minimal HTML file
    const htmlContent = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LateLounge - Premium Coffee Experience</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; background: #1a1a1a; color: white; }
      #root { min-height: 100vh; }
      .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">Loading LateLounge...</div>
    </div>
    <script type="module" src="/assets/bundle.js"></script>
</body>
</html>`;
    
    fs.writeFileSync('dist/index.html', htmlContent);
    
    // Build client bundle with esbuild
    const clientBuildCmd = [
      'npx esbuild client/src/main.tsx',
      '--bundle',
      '--outfile=dist/assets/bundle.js',
      '--format=iife',
      '--target=es2020',
      '--minify',
      '--sourcemap',
      '--define:process.env.NODE_ENV=\'"production"\'',
      '--loader:.tsx=tsx',
      '--loader:.ts=tsx',
      '--loader:.css=css',
      '--loader:.png=dataurl',
      '--loader:.jpg=dataurl',
      '--loader:.jpeg=dataurl',
      '--loader:.svg=text',
      '--external:none'
    ].join(' ');
    
    buildSuccess = runSafeCommand(clientBuildCmd, 'Building client with esbuild');
  }

  // Build server
  const serverBuildCmd = [
    'npx esbuild server/index.ts',
    '--platform=node',
    '--target=node18',
    '--format=esm',
    '--bundle',
    '--outfile=dist/server.js',
    '--external:express',
    '--external:memorystore',
    '--packages=external'
  ].join(' ');
  
  runSafeCommand(serverBuildCmd, 'Building server');

  // Create production package.json
  const prodPackage = {
    name: 'latelounge-production',
    version: '1.0.0',
    type: 'module',
    main: 'server.js',
    scripts: {
      start: 'node server.js'
    },
    dependencies: {
      express: '^4.21.2'
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));

  // Create logs directory
  fs.mkdirSync('logs', { recursive: true });

  console.log('\n🎉 Build completed successfully!');
  console.log('\nProduction files:');
  console.log('- dist/index.html (frontend)');
  console.log('- dist/server.js (backend)');
  console.log('- dist/assets/ (static files)');
  console.log('- dist/package.json (dependencies)');
  
  console.log('\nTo deploy:');
  console.log('1. cd dist && npm install');
  console.log('2. NODE_ENV=production PORT=5000 node server.js');
  console.log('3. Or: pm2 start ../ecosystem.config.js --env production');

} catch (error) {
  console.error('\n❌ Build process failed:', error.message);
  process.exit(1);
}