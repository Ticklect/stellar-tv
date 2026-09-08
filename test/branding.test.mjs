import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('ships Stellar branding for Tizen and Android TV', () => {
  const packageJson = JSON.parse(read('../package.json'));
  const androidStrings = read('../android-tv/app/src/main/res/values/strings.xml');
  const androidBuild = read('../android-tv/app/build.gradle.kts');
  const fallbackPage = read('../app/index.html');
  const ciWorkflow = read('../.github/workflows/ci.yml');

  assert.equal(packageJson.name, 'stellar-tv');
  assert.equal(packageJson.appName, 'Stellar');
  assert.equal(packageJson.version, '1.0.0');
  assert.match(packageJson.description, /Stellar/);
  assert.doesNotMatch(packageJson.description, /Goated/);
  assert.equal(packageJson.websiteURL, 'https://stellar.gdn/');
  assert.equal(packageJson.repository.url, 'git+https://github.com/Ticklect/stellar-tv.git');
  assert.equal(packageJson.bugs.url, 'https://github.com/Ticklect/stellar-tv/issues');
  assert.equal(packageJson.homepage, 'https://github.com/Ticklect/stellar-tv#readme');

  assert.match(androidStrings, /<string name="app_name">Stellar TV<\/string>/);
  assert.match(androidStrings, /<string name="error_title">Unable to load Stellar<\/string>/);
  assert.match(androidBuild, /val appVersion = "1\.0\.0"/);
  assert.match(androidBuild, /versionCode = 9/);
  assert.match(fallbackPage, /<title>Stellar<\/title>/);
  assert.match(fallbackPage, /<h1>Opening Stellar&hellip;<\/h1>/);

  assert.match(ciWorkflow, /stellar-tizenbrew-v\$\{\{ steps\.version\.outputs\.version \}\}/);
  assert.match(ciWorkflow, /name: stellar-android-tv-debug/);
});
