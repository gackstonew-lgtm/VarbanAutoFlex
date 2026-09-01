import fs from 'fs';
import path from 'path';

const groupedDir = path.resolve('public/Car Images/YARDLY_Car_Assets_Grouped');

if (fs.existsSync(groupedDir)) {
  const folders = fs.readdirSync(groupedDir).filter(f => fs.statSync(path.join(groupedDir, f)).isDirectory());
  console.log(`Found ${folders.length} asset folders in YARDLY_Car_Assets_Grouped:`);
  folders.forEach(folder => {
    const files = fs.readdirSync(path.join(groupedDir, folder)).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    console.log(`  - ${folder}: ${files.length} images (${files.slice(0, 3).join(', ')})`);
  });
} else {
  console.log('No YARDLY_Car_Assets_Grouped folder found.');
}
