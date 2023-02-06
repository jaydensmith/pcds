#!/usr/bin/env node
const packager = require('electron-packager');
const { rebuild } = require('electron-rebuild');

(async() => {
    const appPaths = await packager({
        dir: '.',
        overwrite: true,
        prune: true,
        platform: 'linux',
        output: 'release-build',
        afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
            rebuild({ buildPath, electronVersion, arch })
                .then(() => callback())
                .catch((error) => callback(error));
        }],
    });

    console.log(`Electron app bundles created: ${appPaths.join('\n')}`);
})();
