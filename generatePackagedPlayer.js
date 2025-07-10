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

function validateOptions(options) {
    if (typeof options !== 'object' || options === null || Array.isArray(options)) {
        console.error('Options must be a non-null object!');
        return false;
    }
    for (const element of Object.keys(options)) {
        switch (element) {
            case 'debugMode':
                if (typeof options[element] !== 'boolean') {
                    console.error('Option debugMode is not a boolean! Received: ' + options[element]);
                    return false;
                }
                break;
            case 'embedAssets':
                if (typeof options[element] !== 'boolean') {
                    console.error('Option embedAssets is not a boolean! Received: ' + options[element]);
                    return false;
                }
                break;
            default:
                console.error('Unknown option: ' + element);
                return false;
        }
    }
    return true;
}

function generatePackagedPlayer(sceneDirName, startScene, options = {embedAssets: true, debugMode: false}) {
    if (!validateOptions(options)) {
        console.error('Failed to package HTML!');
        return;
    }
    const sceneDirPath = path.join(__dirname, 'Adventures', sceneDirName);
    const itemsDirPath = path.join(sceneDirPath, 'items');
    const soundsDirPath = path.join(sceneDirPath, 'sounds');
    const musicDirPath = path.join(sceneDirPath, 'music');
    const outputDirPath = options.embedAssets
        ? path.join(__dirname, 'PackagedPlayers')
        : path.join(__dirname, 'PackagedPlayers', sceneDirName);
    const outputFilePath = options.embedAssets
        ? path.join(outputDirPath, `${sceneDirName}.html`)
        : path.join(outputDirPath, `${sceneDirName}.html`);

    if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath, { recursive: true });
    }

    const scenes = loadJsonFiles(sceneDirPath);
    const itemScenes = fs.existsSync(itemsDirPath) ? loadJsonFiles(itemsDirPath) : {};

    let soundFiles = {};
    let musicFiles = {};
    let soundRelDir = 'sounds';
    let musicRelDir = 'music';

    if (options.embedAssets) {
        soundFiles = fs.existsSync(soundsDirPath) ? loadBase64Files(soundsDirPath) : {};
        musicFiles = fs.existsSync(musicDirPath) ? loadBase64Files(musicDirPath) : {};
    } else {
        const outSoundsDir = path.join(outputDirPath, soundRelDir);
        const outMusicDir = path.join(outputDirPath, musicRelDir);

        if (fs.existsSync(soundsDirPath)) {
            if (!fs.existsSync(outSoundsDir)) fs.mkdirSync(outSoundsDir, { recursive: true });
            fs.readdirSync(soundsDirPath).forEach(file => {
                const src = path.join(soundsDirPath, file);
                const dest = path.join(outSoundsDir, file);
                if (fs.statSync(src).isFile()) {
                    fs.copyFileSync(src, dest);
                    soundFiles[file.substring(0, file.lastIndexOf('.'))] = `${soundRelDir}/${file}`;
                }
            });
        }
        if (fs.existsSync(musicDirPath)) {
            if (!fs.existsSync(outMusicDir)) fs.mkdirSync(outMusicDir, { recursive: true });
            fs.readdirSync(musicDirPath).forEach(file => {
                const src = path.join(musicDirPath, file);
                const dest = path.join(outMusicDir, file);
                if (fs.statSync(src).isFile()) {
                    fs.copyFileSync(src, dest);
                    musicFiles[file.substring(0, file.lastIndexOf('.'))] = `${musicRelDir}/${file}`;
                }
            });
        }
    }

    const htmlTemplate = fs.readFileSync(path.join(__dirname, 'Player', 'player.html'), 'utf-8');
    const jsTemplate = fs.readFileSync(path.join(__dirname, 'Player', 'player.js'), 'utf-8');

    const populatedJs = jsTemplate
        .replace('const scenes = {};', `const scenes = ${JSON.stringify(scenes, null, 2)};`)
        .replace('const itemScenes = {};', `const itemScenes = ${JSON.stringify(itemScenes, null, 2)};`)
        .replace('const music = {};', `const music = ${JSON.stringify(musicFiles, null, 2)};`)
        .replace('const sounds = {};', `const sounds = ${JSON.stringify(soundFiles, null, 2)};`)
        .replace('const startScene = "";', `const startScene = "${startScene}";`)
        .replace('const embedAssets = true;', `const embedAssets = ${options.embedAssets};`);

    const finalHtml = htmlTemplate.replace(
        '<script src="player.js"></script>',
        `<script>${populatedJs}</script>`
    ).replace('<title>Adventure Engine Player</title>', `<title>${sceneDirName}</title>`);

    fs.writeFileSync(outputFilePath, finalHtml);
    console.log(`Generated HTML file: ${outputFilePath}`);
    if (!options.embedAssets) {
        console.log(`Copied sound files to: ${path.join(outputDirPath, soundRelDir)}`);
        console.log(`Copied music files to: ${path.join(outputDirPath, musicRelDir)}`);
    }
}

const sceneDirName = process.argv[2];
const startScene = process.argv[3] || '';
const options = JSON.parse(process.argv[4]) || {embedAssets: true, debugMode: false};

if (!sceneDirName) {
    console.error('Please provide a scene directory name as the first argument.');
    process.exit(1);
}

const sceneDirPath = path.join(__dirname, 'Adventures', sceneDirName);
if (!fs.existsSync(sceneDirPath)) {
    console.error(`Scene directory not found: ${sceneDirPath}`);
    process.exit(1);
}

generatePackagedPlayer(sceneDirName, startScene, options);
