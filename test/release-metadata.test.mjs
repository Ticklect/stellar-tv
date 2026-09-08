import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const exists = (path) => fs.existsSync(new URL(path, import.meta.url));

test('v1.0.0 release metadata points at Stellar TV', () => {
  const packageJson = JSON.parse(read('../package.json'));
  const androidBuild = read('../android-tv/app/build.gradle.kts');

  assert.equal(packageJson.name, 'stellar-tv');
  assert.equal(packageJson.version, '1.0.0');
  assert.equal(packageJson.repository.url, 'git+https://github.com/Ticklect/stellar-tv.git');
  assert.equal(packageJson.bugs.url, 'https://github.com/Ticklect/stellar-tv/issues');
  assert.equal(packageJson.homepage, 'https://github.com/Ticklect/stellar-tv#readme');
  assert.match(androidBuild, /val appVersion = "1\.0\.0"/);
  assert.match(androidBuild, /versionCode = 9/);
});

test('v1.0.0 ships the supplied Stellar launcher artwork as the only icon source', () => {
  const iconPath = new URL(
    '../android-tv/app/src/main/res/drawable-nodpi/stellar_app_icon.png',
    import.meta.url
  );
  const icon = fs.readFileSync(iconPath);
  const digest = createHash('sha256').update(icon).digest('hex');

  assert.equal(digest, 'efac91d1a35732559d85e0c16af6409eab8af74cf121a40dc556ecc7af4319b7');
  assert.equal(exists('../.github/workflows/prepare-v0.5.3-branch.yml'), false);
  assert.equal(exists('../.github/workflows/publish-v0.5.3.yml'), false);
  assert.equal(exists('../.github/workflows/publish-v0.5.3-fixed.yml'), false);
});
