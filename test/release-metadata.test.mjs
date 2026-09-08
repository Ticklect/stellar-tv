import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('v0.5.3 release metadata points at Stellar TV', () => {
  const packageJson = JSON.parse(read('../package.json'));
  const androidBuild = read('../android-tv/app/build.gradle.kts');

  assert.equal(packageJson.name, 'stellar-tv');
  assert.equal(packageJson.version, '0.5.3');
  assert.equal(packageJson.repository.url, 'git+https://github.com/Ticklect/stellar-tv.git');
  assert.equal(packageJson.bugs.url, 'https://github.com/Ticklect/stellar-tv/issues');
  assert.equal(packageJson.homepage, 'https://github.com/Ticklect/stellar-tv#readme');
  assert.match(androidBuild, /val appVersion = "0\.5\.3"/);
  assert.match(androidBuild, /versionCode = 8/);
});
