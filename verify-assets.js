import fs from 'fs';
import path from 'path';

console.log('Verifying LateLounge production assets...\n');

const distAssetsPath = 'dist/assets';
const requiredAssets = [
  'english-dark_1750523791780.png',
  'english-white_1750523827323.png'
];

let allAssetsValid = true;

// Check if assets directory exists
if (!fs.existsSync(distAssetsPath)) {
  console.error('❌ Assets directory missing:', distAssetsPath);
  allAssetsValid = false;
} else {
  console.log('✅ Assets directory exists');
}

// Check each required asset
requiredAssets.forEach(asset => {
  const assetPath = path.join(distAssetsPath, asset);
  
  if (!fs.existsSync(assetPath)) {
    console.error(`❌ Missing asset: ${asset}`);
    allAssetsValid = false;
  } else {
    const stats = fs.statSync(assetPath);
    const permissions = (stats.mode & parseInt('777', 8)).toString(8);
    
    if (permissions === '644') {
      console.log(`✅ ${asset} - Size: ${(stats.size / 1024).toFixed(1)}KB - Permissions: ${permissions}`);
    } else {
      console.warn(`⚠️  ${asset} - Incorrect permissions: ${permissions} (should be 644)`);
      allAssetsValid = false;
    }
  }
});

// Check additional files
const additionalFiles = ['app.js', '../index.html', '../server.js', '../package.json'];
additionalFiles.forEach(file => {
  const filePath = path.join(distAssetsPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file.replace('../', '')} exists`);
  } else {
    console.error(`❌ Missing file: ${file.replace('../', '')}`);
    allAssetsValid = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allAssetsValid) {
  console.log('✅ All assets verified successfully!');
  console.log('Production deployment ready.');
  console.log('\nLogo URLs in production:');
  console.log('- Dark theme: /assets/english-dark_1750523791780.png');
  console.log('- Light theme: /assets/english-white_1750523827323.png');
} else {
  console.log('❌ Asset verification failed!');
  console.log('Run: node deploy-simple.js to rebuild');
}
console.log('='.repeat(50));