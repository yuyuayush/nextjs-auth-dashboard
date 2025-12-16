const fs = require('fs');
const https = require('https');
const path = require('path');
const { exec } = require('child_process');

const url = "https://files.zophar.net/nintendo/nes/pd/lawn_mower.zip";
const publicGamesDir = path.join(process.cwd(), 'public', 'games');
const dest = path.join(publicGamesDir, 'lawn_mower.zip');

if (!fs.existsSync(publicGamesDir)) {
    fs.mkdirSync(publicGamesDir, { recursive: true });
}

console.log("Downloading to:", dest);
const file = fs.createWriteStream(dest);

https.get(url, function (response) {
    if (response.statusCode !== 200) {
        console.error("Failed to download, status code:", response.statusCode);
        return;
    }
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => {
            console.log("Download complete. Unzipping...");
            // Use a simpler unzip command for Windows (tar -xf might work in recent Windows, or powershell)
            exec(`powershell -command "Expand-Archive -Path '${dest}' -DestinationPath '${publicGamesDir}' -Force"`, (err, stdout, stderr) => {
                if (err) {
                    console.error("Unzip error:", err);
                    return;
                }
                console.log("Unzip complete.");

                // Rename to match ID if needed (Lawn_Mower.nes -> lawn_mower.nes)
                fs.readdir(publicGamesDir, (err, files) => {
                    files.forEach(file => {
                        if (file.endsWith('.nes')) console.log("Found NES file:", file);
                        // normalize name
                        if (file === 'Lawn_Mower.nes') {
                            fs.renameSync(path.join(publicGamesDir, file), path.join(publicGamesDir, 'lawn_mower.nes'));
                            console.log("Renamed to lawn_mower.nes");
                        }
                    });
                });
            });
        });
    });
}).on('error', function (err) {
    fs.unlink(dest);
    console.error("Download error:", err);
});
