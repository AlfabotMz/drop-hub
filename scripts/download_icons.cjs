const fs = require('fs');
const https = require('https');

fs.mkdirSync('assets', { recursive: true });

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', err => {
            fs.unlink(dest);
            reject(err);
        });
    });
}

async function run() {
    console.log('Downloading icon.png...');
    await download('https://placehold.co/1024x1024/09090b/ef233c.png?text=W&font=montserrat', 'assets/icon.png');
    console.log('Downloading favicon...');
    await download('https://placehold.co/256x256/09090b/ef233c.png?text=W&font=montserrat', 'public/favicon.png');
    console.log('Icons downloaded successfully.');
}

run();
