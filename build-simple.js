#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building LateLounge for production...');

try {
  // Clean previous build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('Cleaned previous build');
  }

  // Ensure dependencies are installed
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Build client using inline vite config to avoid config file issues
  console.log('Building client...');
  const viteCommand = `npx vite build --config /dev/null --root . --build.outDir=dist --build.emptyOutDir=true --build.rollupOptions.input=client/index.html`;
  
  try {
    execSync(viteCommand, { stdio: 'inherit' });
  } catch (error) {
    // Fallback: Build client manually if vite fails
    console.log('Vite build failed, using manual build process...');
    
    // Create basic dist structure
    fs.mkdirSync('dist', { recursive: true });
    fs.mkdirSync('dist/assets', { recursive: true });
    
    // Copy HTML file and modify for production
    const htmlContent = fs.readFileSync('client/index.html', 'utf8')
      .replace(/type="module" crossorigin/, 'type="module"')
      .replace(/\/src\/main\.tsx/, '/assets/main.js');
    
    fs.writeFileSync('dist/index.html', htmlContent);
    
    // Build TypeScript/React with esbuild
    execSync(`npx esbuild client/src/main.tsx --bundle --outfile=dist/assets/main.js --format=esm --target=es2020 --minify --sourcemap --loader:.tsx=tsx --loader:.ts=tsx --loader:.css=css --external:react --external:react-dom`, { stdio: 'inherit' });
    
    console.log('Manual client build completed');
  }

  // Build server
  console.log('Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --outfile=dist/server.js --target=node18', { stdio: 'inherit' });

  // Create production package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    type: 'module',
    main: 'server.js',
    scripts: {
      start: 'node server.js'
    },
    dependencies: {
      express: packageJson.dependencies.express
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));

  // Create logs directory
  fs.mkdirSync('logs', { recursive: true });

  console.log('Build completed successfully!');
  console.log('Files created:');
  console.log('- dist/index.html (client)');
  console.log('- dist/server.js (server)');
  console.log('- dist/package.json (production deps)');
  console.log('- logs/ (for PM2 logs)');

} catch (error) {
  console.error('Build failed:', error.message);
  console.log('');
  console.log('Try these commands manually:');
  console.log('1. npm install');
  console.log('2. npx vite build');
  console.log('3. npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
  process.exit(1);
}