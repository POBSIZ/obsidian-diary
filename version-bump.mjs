import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

// read minAppVersion from manifest.json and bump version to target version
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

// update versions.json with target version and minAppVersion from manifest.json
// but only if the target version is not already in versions.json
const versions = JSON.parse(readFileSync('versions.json', 'utf8'));
if (!(targetVersion in versions)) {
    versions[targetVersion] = minAppVersion;
    writeFileSync('versions.json', JSON.stringify(versions, null, '\t'));
}

// Keep the shipped stylesheet digest unique per release so artifact
// release validators cannot confuse an asset with an older release that had identical CSS.
const stylesPath = "styles.css";
const styles = readFileSync(stylesPath, "utf8");
const versionMarker = /(?<=Diary release version: )\d+\.\d+\.\d+/;
if (!versionMarker.test(styles)) {
    throw new Error("styles.css is missing its Diary release version marker");
}
writeFileSync(stylesPath, styles.replace(versionMarker, targetVersion));
