/**
 * ios-haptics v0.0.9
 * tijn.dev
 * @license MIT
 */

// to vibrate on iOS Safari (version 17.4 and later):
// leverage the fact that native HTML 'switch' controls
// generate haptic feedback when interacted with.

// to vibrate on Android/Chrome:
// use Web Vibration API

function haptic() {
  // Android/Chrome
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(30);
    } catch {
      // empty catch block to prevent throwing an error if
      // vibrate is disabled by user settings
    }
    return;
  }

  // iOS/Safari
  try {
    const labelEl = document.createElement("label");
    labelEl.ariaHidden = "true";
    labelEl.style.display = "none";

    const inputEl = document.createElement("input");
    inputEl.type = "checkbox";
    inputEl.setAttribute("switch", "");
    labelEl.appendChild(inputEl);

    document.head.appendChild(labelEl);
    labelEl.click();
    document.head.removeChild(labelEl);
  } catch {
    // do nothing
  }
}

haptic.confirm = () => {
  if ("vibrate" in navigator) {
    try {
      // [vibrate, pause, vibrate] in ms
      navigator.vibrate([10, 120, 10]);
    } catch {}
    return;
  }
  haptic(); // immediate haptic
  setTimeout(() => haptic(), 120); // haptic triggers after 120ms
};

haptic.error = () => {
  if ("vibrate" in navigator) {
    try {
      // [vibrate, pause, vibrate, pause, vibrate] in ms
      navigator.vibrate([10, 110, 10, 110, 10]);
    } catch {}
    return;
  }
  haptic(); // immediate haptic
  setTimeout(() => haptic(), 120); // haptic after 120ms
  setTimeout(() => haptic(), 240); // haptic after 240ms
};

export { haptic };
