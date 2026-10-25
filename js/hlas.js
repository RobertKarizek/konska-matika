/* Předčítání česky (Web Speech API). Výchozí stav vypnuto, zapíná se v nastavení. */
(function () {
  var podporovano = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  var hlas = null;

  function najdiHlas() {
    if (!podporovano) return null;
    var vse = window.speechSynthesis.getVoices() || [];
    hlas = vse.filter(function (v) { return /^cs/i.test(v.lang); })[0] || null;
    return hlas;
  }
  if (podporovano) {
    najdiHlas();
    window.speechSynthesis.onvoiceschanged = najdiHlas;
  }

  // „8 × 7“ → „8 krát 7“, „56 : 8“ → „56 děleno 8“
  function proMluvu(text) {
    return String(text)
      .replace(/×/g, " krát ")
      .replace(/(\d)\s*:\s*(\d)/g, "$1 děleno $2")
      .replace(/=\s*\?/g, " rovná se kolik")
      .replace(/\?/g, " kolik ")
      .replace(/=/g, " rovná se ");
  }

  window.HLAS = {
    podporovano: function () { return podporovano; },
    rekni: function (text) {
      if (!podporovano) return;
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(proMluvu(text));
        u.lang = "cs-CZ";
        if (hlas || najdiHlas()) u.voice = hlas;
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch (e) { /* předčítání je jen bonus */ }
    },
    stop: function () { if (podporovano) try { window.speechSynthesis.cancel(); } catch (e) {} }
  };
})();
