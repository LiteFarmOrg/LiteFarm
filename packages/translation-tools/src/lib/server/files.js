import fs from 'fs';
import path from 'path';

// Directory path
const localesPath = 'C:/Dev/Litefarm/LiteFarm-contrib/packages/webapp/public/locales';
export const main = 'en'
export const missing = '!MISSING!'

// Function to read the contents of a JSON file
function readJSONFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Function to read the contents of all JSON files in a directory
async function readAllJSONFilesInDirectory(directoryPath) {
    try {
        const fileNames = await fs.promises.readdir(directoryPath)
        const jsonFiles = fileNames.filter(fileName => fileName.endsWith('.json'));

        const fileContents = await Promise.all(jsonFiles.map(async fileName => {
            const filePath = path.join(directoryPath, fileName);
            return [fileName, flatten(await readJSONFile(filePath))];
        }));
        return Object.fromEntries(fileContents)
    } catch (error) {
        throw new Error(`Error reading directory: ${error}`);
    }
}

// Function to read all directories in a directory
async function readAllDirectoriesInDirectory(directoryPath) {
    try {
        const fileNames = await fs.promises.readdir(directoryPath);
        const directories = fileNames.filter(fileName => fs.statSync(path.join(directoryPath, fileName)).isDirectory());
        return directories;
    } catch (error) {
        throw new Error(`Error reading directory: ${error}`);
    }
}

const loadFiles = async (filepath) => {
    const locales = await readAllDirectoriesInDirectory(filepath);

    console.log('found locales: ', locales)

    return Object.fromEntries(await Promise.all(locales.map(async locale => {
        const contents = await readAllJSONFilesInDirectory(path.join(filepath, locale))
        return [locale, contents]
    })))
}

export const files = await loadFiles(localesPath)

function flatten(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        if (typeof obj[key] === 'string') {
            acc[prefix + key] = obj[key];
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(acc, flatten(obj[key], prefix + key + '.'));
        }
        return acc
    }, {})
}

function unflatten(obj) {
    return Object.keys(obj).sort().reduce((acc, key) => {
        const keys = key.split('.');
        let temp = acc; // Use a temporary variable to traverse the nested structure
        for (let i = 0; i < keys.length - 1; i++) {
            if (!temp[keys[i]]) {
                temp[keys[i]] = {}; // Create nested objects if they don't exist
            }
            temp = temp[keys[i]]; // Move deeper into the nested structure
        }
        temp[keys[keys.length - 1]] = obj[key]; // Assign the value at the deepest level
        return acc;
    }, {});
}

export function normalize(files) {
    // check if all locales have all files and all files have all fields
    // add missing files and fields filed with missing + either the main locale or the key as value

    const filenames = new Set()

    Object.keys(files).forEach(locale => {
        Object.keys(files[locale]).forEach(filename => {
            filenames.add(filename)
        })
    })

    const shapes = Object.fromEntries(Array.from(filenames).map(filename => {
        return [filename, Object.fromEntries([].concat(...Object.keys(files)
            .map(locale => Object.keys(files[locale][filename] || {})
                .map(key => [key, missing + (files[main]?.[filename]?.[key] || key)]))))]
    }))

    Object.keys(files).forEach(locale => filenames.forEach(filename => {
        files[locale][filename] = Object.assign({}, shapes[filename], files[locale][filename])
    }))
}

export function write(files) {
    Object.keys(files).forEach(locale => Object.keys(files[locale])
        .forEach(filename => fs.writeFile(
            path.join(localesPath, locale, filename),
            JSON.stringify(unflatten(files[locale][filename]), null, 2) + '\n', function (err) {
                if (err) console.log('error: ', err)
            })))
}

normalize(files)