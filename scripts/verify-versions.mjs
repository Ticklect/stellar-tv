import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageMetadata = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8')
);
const tizenSource = await readFile(new URL('../main.js', import.meta.url), 'utf8');
const androidBuild = await readFile(
  new URL('../android-tv/app/build.gradle.kts', import.meta.url),
  'utf8'
);

const tizenVersion = tizenSource.match(/MODULE_VERSION = '([^']+)'/)?.[1];
const androidVersion = androidBuild.match(/val appVersion = "([^"]+)"/)?.[1];

assert.ok(tizenVersion, 'Could not find MODULE_VERSION in main.js');
assert.ok(androidVersion, 'Could not find appVersion in the Android build');
assert.equal(
  tizenVersion,
  packageMetadata.version,
  'Tizen runtime version does not match package.json'
);
assert.equal(
  androidVersion,
  packageMetadata.version,
  'Android versionName does not match package.json'
);

console.log(`Platform versions are synchronized at ${packageMetadata.version}.`);
