import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifestPath = new URL('../android-tv/app/src/main/AndroidManifest.xml', import.meta.url);
const gradlePath = new URL('../android-tv/app/build.gradle.kts', import.meta.url);

test('Android launcher uses generated Stellar mipmaps from the supplied artwork', async () => {
  const [manifest, gradle] = await Promise.all([
    readFile(manifestPath, 'utf8'),
    readFile(gradlePath, 'utf8'),
  ]);

  assert.match(manifest, /android:icon="@mipmap\/stellar_launcher"/);
  assert.match(manifest, /android:roundIcon="@mipmap\/stellar_launcher_round"/);
  assert.match(gradle, /generateStellarLauncherIcons/);
  assert.match(gradle, /stellar_app_icon\.png/);
  assert.match(gradle, /mipmap-mdpi/);
  assert.match(gradle, /mipmap-xxxhdpi/);
});
