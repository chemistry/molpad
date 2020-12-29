const fs = require('fs');

const version = (process.argv.slice(2))[0];
if (!version) {
    return console.error('Unknown error');
}

fs.readFile('package.json', 'utf8', function(err, contents) {
    const package = JSON.parse(contents);
    package['version'] = version;

    const data = JSON.stringify(package, null, 4);
    fs.writeFile('package.json', data, (err)=> {
        if (err) {
            console.error(`Error found : ${String(err)}`);
            return;
        }
        console.log(`Success - package version ${version}`);
    });
});
