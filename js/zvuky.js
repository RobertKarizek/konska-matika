/* Zvuky přes Web Audio API – žádné soubory, všechno se „hraje“ v kódu. */
(function () {
  var ctx = null;
  var zapnuto = true;

  function kontext() {
    if (!zapnuto) return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }

  function ton(c, frek, zacatek, delka, hlasitost, typ) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = typ || "sine";
    o.frequency.setValueAtTime(frek, zacatek);
    g.gain.setValueAtTime(0.0001, zacatek);
    g.gain.exponentialRampToValueAtTime(hlasitost, zacatek + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, zacatek + delka);
    o.connect(g).connect(c.destination);
    o.start(zacatek);
    o.stop(zacatek + delka + 0.05);
  }

  var sum = null;
  function sumBuffer(c) {
    if (sum) return sum;
    var n = c.sampleRate * 0.6, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    sum = b;
    return b;
  }

  function sumik(c, zacatek, delka, frek, q, hlasitost) {
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = sumBuffer(c);
    f.type = "bandpass"; f.frequency.setValueAtTime(frek, zacatek); f.Q.value = q;
    g.gain.setValueAtTime(0.0001, zacatek);
    g.gain.exponentialRampToValueAtTime(hlasitost, zacatek + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, zacatek + delka);
    s.connect(f).connect(g).connect(c.destination);
    s.start(zacatek, Math.random() * 0.3, delka + 0.05);
    return f;
  }

  // klapnutí kopyta: krátký dřevěný „tok“
  function kopyto(c, t, vyska) {
    ton(c, vyska, t, 0.07, 0.35, "triangle");
    sumik(c, t, 0.05, vyska * 3, 4, 0.25);
  }

  var Z = {
    klik: function () {
      var c = kontext(); if (!c) return;
      ton(c, 660, c.currentTime, 0.06, 0.12, "sine");
    },
    cval: function () {
      var c = kontext(); if (!c) return;
      var t = c.currentTime + 0.02;
      for (var k = 0; k < 3; k++) {
        var z = t + k * 0.36;
        kopyto(c, z, 420); kopyto(c, z + 0.09, 360); kopyto(c, z + 0.17, 390);
      }
    },
    frk: function () {
      var c = kontext(); if (!c) return;
      var t = c.currentTime + 0.02;
      var f = sumik(c, t, 0.45, 900, 1.2, 0.35);
      f.frequency.exponentialRampToValueAtTime(350, t + 0.45);
      ton(c, 110, t, 0.35, 0.08, "sawtooth");
    },
    spravne: function () {
      var c = kontext(); if (!c) return;
      var t = c.currentTime;
      ton(c, 784, t, 0.14, 0.18); ton(c, 1047, t + 0.09, 0.22, 0.18);
    },
    zkusZnovu: function () {
      // žádný smutný zvuk – jen měkké „hm?“
      var c = kontext(); if (!c) return;
      var t = c.currentTime;
      ton(c, 440, t, 0.12, 0.08); ton(c, 494, t + 0.1, 0.16, 0.08);
    },
    hotovo: function () {
      var c = kontext(); if (!c) return;
      var t = c.currentTime + 0.02;
      [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) {
        ton(c, f, t + i * 0.11, i === 5 ? 0.5 : 0.16, 0.16, "triangle");
      });
    },
    odmena: function () {
      var c = kontext(); if (!c) return;
      var t = c.currentTime;
      ton(c, 1319, t, 0.1, 0.1); ton(c, 1568, t + 0.06, 0.16, 0.1);
    },
    nastavit: function (ano) { zapnuto = !!ano; if (!ano && ctx) { try { ctx.suspend(); } catch (e) {} } },
    zapnuto: function () { return zapnuto; }
  };
  window.ZVUK = Z;
})();
