import fs from 'node:fs';

const path = new URL('../main.js', import.meta.url);
let source = fs.readFileSync(path, 'utf8');
const before = `    var current = focusedElement();
    if (isTextInput(current)) {
      current.blur();
      ensureFocus(true);
      return true;
    }`;
const after = `    var current = focusedElement();
    if (isTextInput(current)) {
      var scopeItems = candidates(activeScope());
      var preferred = searchNavigationTarget('down', current, scopeItems);
      current.blur();
      clearFocusDecoration();
      state.current = null;
      state.preferredX = null;
      if (preferred && setFocus(preferred)) return true;
      for (var itemIndex = 0; itemIndex < scopeItems.length; itemIndex++) {
        if (scopeItems[itemIndex] !== current && setFocus(scopeItems[itemIndex])) return true;
      }
      return true;
    }`;

const first = source.indexOf(before);
if (first < 0) throw new Error('Could not find text-input Back block');
if (source.indexOf(before, first + before.length) >= 0) {
  throw new Error('Found duplicate text-input Back blocks');
}
source = source.slice(0, first) + after + source.slice(first + before.length);
fs.writeFileSync(path, source);
console.log('Applied Back focus polish.');
