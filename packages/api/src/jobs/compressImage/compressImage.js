import fs from 'fs';
const folderPath = 'local/folderPath';
const saveFolderPath = 'local/saveFolderPath';
import { imaginaryPost } from '../../util/digitalOceanSpaces.js';
require('dotenv').config();

export function compressImage() {
  fs.readdir(folderPath, async (err, files) => {
    for (const fileName of files) {
      const file = fs.readFileSync(`${folderPath}/${fileName}`);
      try {
        const compressedImage = await imaginaryPost(
          { buffer: file, originalname: fileName },
          {
            type: 'webp',
          },
          { endpoint: 'convert', serverUrl: 'http://localhost:8088' },
        );
        fs.writeFile(
          `${saveFolderPath}/${fileName.split('.')[0]}.webp`,
          compressedImage.data,
          () => {
            console.log(`save ${fileName}`);
          },
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.log(e);
      }
    }
  });
}
