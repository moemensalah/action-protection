import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Building LateLounge with static data...');

try {
  // Build frontend with Vite
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Build backend with esbuild
  console.log('🔧 Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

  // Copy assets to dist
  console.log('📁 Copying assets...');
  const assetsDir = path.join(__dirname, 'attached_assets');
  const distAssetsDir = path.join(__dirname, 'dist', 'assets');
  
  if (fs.existsSync(assetsDir)) {
    if (!fs.existsSync(distAssetsDir)) {
      fs.mkdirSync(distAssetsDir, { recursive: true });
    }
    
    const files = fs.readdirSync(assetsDir);
    files.forEach(file => {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        fs.copyFileSync(
          path.join(assetsDir, file),
          path.join(distAssetsDir, file)
        );
        console.log(`✅ Copied ${file}`);
      }
    });
  }

  console.log('✅ Build completed successfully!');
  console.log('🚀 You can now deploy the dist/ folder');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}