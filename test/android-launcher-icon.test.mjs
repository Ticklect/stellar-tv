import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('Android launcher uses the supplied Stellar artwork', () => {
  const manifest = read('../android-tv/app/src/main/AndroidManifest.xml');
  const source = fs.readFileSync(
    new URL('../android-tv/app/src/main/res/drawable-nodpi/stellar_app_icon.png', import.meta.url)
  );
  const digest = createHash('sha256').update(source).digest('hex');

  assert.equal(digest, '9b2ea8ddb1ea6af041f3583f1bea6c005c25fb348defa435baf551009550f217');
  assert.match(manifest, /android:icon="@mipmap\/ic_launcher"/);
  assert.match(manifest, /android:roundIcon="@mipmap\/ic_launcher_round"/);
});
