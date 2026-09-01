import fs from 'fs';
import path from 'path';

console.log('Building canonical vehicle image library in public/Car Images...');

const groupedDir = path.resolve('public/Car Images/YARDLY_Car_Assets_Grouped');
const mainDir = path.resolve('public/Car Images');

const FOLDER_MAP = {
  '01_Honda_or_Toyota_Hatchback': 'Honda_Fit',
  '02_Honda_CRV_or_SUV': 'Honda_CR-V',
  '03_Lexus_Toyota_Sedan': 'Lexus_ES',
  '04_Lexus_RX_or_Similar': 'Lexus_RX',
  '05_Range_Rover_Velar': 'Range_Rover_Velar',
  '06_Toyota_Vellfire_or_Similar': 'Toyota_Vellfire',
  '07_Volvo_SUV': 'Volvo_XC60',
  '08_Volkswagen_Hatchback': 'Volkswagen_Polo',
  '09_Ford_Ranger': 'Ford_Ranger',
  '10_Audi_Sedan': 'Audi_A6',
  '11_Mercedes_C_Class': 'Mercedes-Benz_C-Class',
  '12_Toyota_Land_Cruiser_200': 'Toyota_Land_Cruiser_200',
  '13_Mercedes_GLE_Coupe': 'Mercedes-AMG_GLE_53_Coupe',
  '14_Porsche_Cayenne': 'Porsche_Cayenne',
  '15_Volkswagen_Golf': 'Volkswagen_Golf',
  '16_Mercedes_E_Class': 'Mercedes-Benz_E-Class',
  '17_BMW_X6': 'BMW_X6',
  '18_Toyota_RAV4_older': 'Toyota_RAV4_Older',
  '19_Toyota_RAV4_newer': 'Toyota_RAV4_Newer',
  '20_Toyota_Hiace': 'Toyota_Hiace',
  '21_Mazda_Demio_Mazda2': 'Mazda_Demio',
  '22_Nissan_Patrol_Y62': 'Nissan_Patrol_Y62',
  '23_Mercedes_S_Class': 'Mercedes-Benz_S-Class',
  '24_Audi_Q8': 'Audi_Q8'
};

// Clean top-level files in public/Car Images (keep YARDLY_Car_Assets_Grouped folder)
const topLevelItems = fs.readdirSync(mainDir);
topLevelItems.forEach(item => {
  if (item !== 'YARDLY_Car_Assets_Grouped') {
    const itemPath = path.join(mainDir, item);
    if (fs.statSync(itemPath).isFile()) {
      fs.unlinkSync(itemPath);
    }
  }
});

console.log('Cleaned old top-level files in public/Car Images.');

const manifestClusters = {};
let totalCopied = 0;

Object.keys(FOLDER_MAP).forEach(folderName => {
  const canonicalName = FOLDER_MAP[folderName];
  const clusterId = `cluster_${canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  const folderPath = path.join(groupedDir, folderName);

  if (fs.existsSync(folderPath)) {
    const rawFiles = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    rawFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    const clusterImages = [];

    rawFiles.forEach((file, index) => {
      const padIndex = String(index + 1).padStart(2, '0');
      // Normalize extension to .jpeg consistently
      const newFilename = `${canonicalName}_${padIndex}.jpeg`;
      const srcPath = path.join(folderPath, file);
      const destPath = path.join(mainDir, newFilename);

      fs.copyFileSync(srcPath, destPath);
      const webUrl = `/Car Images/${newFilename}`;
      clusterImages.push(webUrl);
      totalCopied++;
    });

    manifestClusters[clusterId] = {
      id: clusterId,
      name: canonicalName.replace(/_/g, ' '),
      images: clusterImages,
      primaryImage: clusterImages[0],
      confidence: 0.99
    };
  }
});

const tsContent = `// AUTOMATICALLY GENERATED CANONICAL VEHICLE IMAGE MANIFEST
// Source of truth: public/Car Images (Canonical Names)
// Total Files: ${totalCopied}

export interface VehicleCluster {
  id: string;
  name: string;
  images: string[];
  primaryImage: string;
  confidence: number;
}

export const AUTOMATIC_VEHICLE_CLUSTERS: Record<string, VehicleCluster> = ${JSON.stringify(manifestClusters, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/vehicleImageManifest.ts'), tsContent, 'utf-8');

console.log(`Successfully normalized ${totalCopied} vehicle photographs across ${Object.keys(manifestClusters).length} clusters.`);
