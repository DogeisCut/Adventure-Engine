const fs = require('fs');
const path = require('path');

function loadJsonFiles(dirPath) {
    const files = fs.readdirSync(dirPath);
    const data = {};

    files.forEach(file => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(dirPath, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const fileName = path.basename(file, '.json');
            data[fileName] = JSON.parse(fileContent);
        }
    });

    return data;
}

function loadBase64Files(dirPath) {
    const mimeTypes = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg'
    };
    
    const files = fs.readdirSync(dirPath);
    const data = {};

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isFile()) {
            const fileContent = fs.readFileSync(filePath);
            const fileExt = path.extname(file).slice(1).toLowerCase();
            const mimeType = mimeTypes[fileExt] || 'application/octet-stream'; 
            const base64Data = `data:${mimeType};base64,${fileContent.toString('base64')}`;

            data[file.substring(0, file.lastIndexOf('.'))] = base64Data;
        }
    });

    return data;
}

function generatePackagedPlayer(sceneDirName, startScene, debugMode = false) {
    const sceneDirPath = path.join(__dirname, 'Adventures', sceneDirName);
    const itemsDirPath = path.join(sceneDirPath, 'items');
    const soundsDirPath = path.join(sceneDirPath, 'sounds');
    const musicDirPath = path.join(sceneDirPath, 'music');
    const outputDirPath = path.join(__dirname, 'PackagedPlayers');
    const outputFilePath = path.join(outputDirPath, `${sceneDirName}.html`);

    if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath);
    }

    const scenes = loadJsonFiles(sceneDirPath);
    const itemScenes = fs.existsSync(itemsDirPath) ? loadJsonFiles(itemsDirPath) : {};

    const soundFiles = fs.existsSync(soundsDirPath) ? loadBase64Files(soundsDirPath) : {};
    const musicFiles = fs.existsSync(musicDirPath) ? loadBase64Files(musicDirPath) : {};

    const htmlTemplate = fs.readFileSync(path.join(__dirname, 'Player', 'player.html'), 'utf-8');
    const jsTemplate = fs.readFileSync(path.join(__dirname, 'Player', 'player.js'), 'utf-8');

    const populatedJs = jsTemplate
        .replace('const scenes = {};', `const scenes = ${JSON.stringify(scenes, null, 2)};`)
        .replace('const itemScenes = {};', `const itemScenes = ${JSON.stringify(itemScenes, null, 2)};`)
        .replace('const music = {};', `const music = ${JSON.stringify(musicFiles, null, 2)};`)
        .replace('const sounds = {};', `const sounds = ${JSON.stringify(soundFiles, null, 2)};`)
        .replace('const startScene = "";', `const startScene = "${startScene}";`)
        

    const finalHtml = htmlTemplate.replace(
        '<script src="player.js"></script>',
        `<script>${populatedJs}</script>`
    ).replace('<title>Adventure Engine Player</title>', `<title>${sceneDirName}</title>`);

    fs.writeFileSync(outputFilePath, finalHtml);
    console.log(`Generated HTML file: ${outputFilePath}`);
}

const sceneDirName = process.argv[2];
const startScene = process.argv[3] || '';

if (!sceneDirName) {
    console.error('Please provide a scene directory name as the first argument.');
    process.exit(1);
}

const sceneDirPath = path.join(__dirname, 'Adventures', sceneDirName);
if (!fs.existsSync(sceneDirPath)) {
    console.error(`Scene directory not found: ${sceneDirPath}`);
    process.exit(1);
}

generatePackagedPlayer(sceneDirName, startScene);
