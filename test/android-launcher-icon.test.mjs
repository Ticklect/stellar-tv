import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const releaseManifestPath = new URL(
  '../android-tv/app/src/release/AndroidManifest.xml',
  import.meta.url
);
const iconScriptPath = new URL('../scripts/prepare-stellar-icons.py', import.meta.url);

test('Android release launcher uses generated Stellar mipmaps from the supplied artwork', async () => {
  const [releaseManifest, iconScript] = await Promise.all([
    readFile(releaseManifestPath, 'utf8'),
    readFile(iconScriptPath, 'utf8')
  ]);

  assert.match(releaseManifest, /android:icon="@mipmap\/stellar_launcher"/);
  assert.match(releaseManifest, /android:roundIcon="@mipmap\/stellar_launcher_round"/);
  assert.match(iconScript, /stellar_app_icon\.png/);
  assert.match(iconScript, /"mdpi": 48/);
  assert.match(iconScript, /"xxxhdpi": 192/);
  assert.match(iconScript, /stellar_launcher\.png/);
  assert.match(iconScript, /stellar_launcher_round\.png/);
});
