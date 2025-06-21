#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Simple deployment build for LateLounge...');

try {
  // Clean and create directories
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/assets', { recursive: true });
  fs.mkdirSync('logs', { recursive: true });

  // Copy essential logo assets
  const logoFiles = [
    'english-dark_1750523791780.png',
    'english-white_1750523827323.png'
  ];
  
  for (const file of logoFiles) {
    const srcPath = path.join('attached_assets', file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join('dist/assets', file));
    }
  }
  console.log('Logo assets copied');

  // Create HTML file
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LateLounge - Premium Coffee Experience</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; background: #1a1a1a; color: white; min-height: 100vh; }
      #root { min-height: 100vh; }
      .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-size: 18px; }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">Loading LateLounge...</div>
    </div>
    <script type="module" src="/assets/app.js"></script>
</body>
</html>`;
  
  fs.writeFileSync('dist/index.html', htmlContent);

  // Build client with minimal esbuild (faster than Vite)
  console.log('Building client application...');
  execSync([
    'npx esbuild client/src/main.tsx',
    '--bundle',
    '--outfile=dist/assets/app.js',
    '--format=iife',
    '--target=es2020',
    '--define:process.env.NODE_ENV=\'"production"\'',
    '--loader:.tsx=tsx',
    '--loader:.ts=tsx',
    '--loader:.css=css',
    '--external:react',
    '--external:react-dom'
  ].join(' '), { stdio: 'inherit' });

  // Build server
  console.log('Building server...');
  execSync([
    'npx esbuild server/index.ts',
    '--platform=node',
    '--target=node18',
    '--format=esm',
    '--bundle',
    '--outfile=dist/server.js',
    '--external:express',
    '--packages=external'
  ].join(' '), { stdio: 'inherit' });

  // Create production package.json
  const prodPkg = {
    name: 'latelounge-cafe',
    version: '1.0.0',
    type: 'module',
    main: 'server.js',
    scripts: { start: 'node server.js' },
    dependencies: { express: '^4.21.2' }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPkg, null, 2));

  console.log('\nBuild completed successfully!');
  console.log('Files created:');
  console.log('- dist/index.html');
  console.log('- dist/assets/app.js');
  console.log('- dist/assets/*.png (logos)');
  console.log('- dist/server.js');
  console.log('- dist/package.json');
  
  console.log('\nTo deploy:');
  console.log('cd dist && npm install && NODE_ENV=production node server.js');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}