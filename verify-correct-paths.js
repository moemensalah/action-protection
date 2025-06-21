import fs from 'fs';

console.log('Verifying correct asset paths for production...\n');

// Check the correct path structure
const correctPaths = [
  'dist/public/assets/english-dark_1750523791780.png',
  'dist/public/assets/english-white_1750523827323.png',
  'dist/public/assets/app.js',
  'dist/index.html',
  'dist/server.js'
];

let allCorrect = true;

correctPaths.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const size = filePath.includes('.png') ? `${(stats.size / 1024).toFixed(1)}KB` : 'Ready';
    const permissions = filePath.includes('.png') ? ` (${(stats.mode & parseInt('777', 8)).toString(8)})` : '';
    console.log(`✅ ${filePath} - ${size}${permissions}`);
  } else {
    console.log(`❌ Missing: ${filePath}`);
    allCorrect = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allCorrect) {
  console.log('✅ All assets are in correct paths!');
  console.log('Production deployment should now work correctly.');
  console.log('\nCorrect asset URLs in production:');
  console.log('- Dark logo: /assets/english-dark_1750523791780.png');
  console.log('- White logo: /assets/english-white_1750523827323.png');
} else {
  console.log('❌ Some assets are missing from correct paths');
}
console.log('='.repeat(50));