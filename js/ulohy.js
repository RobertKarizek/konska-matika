/* Tvorba příkladů a opakování s rozestupy.
 *
 * Každý příklad („fakt“) má v profilu stav: box 0–5 (jak dobře ho umí) a dalsi = číslo lekce,
 * od které se má zase objevit. Co dělá potíže, má nízký box a vrací se často; co umí, chodí zřídka.
 */
(function () {
  function nahodne(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function zamichat(pole) {
    for (var i = pole.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pole[i]; pole[i] = pole[j]; pole[j] = t; }
    return pole;
  }
  function rozsah(od, d) { var o = []; for (var i = od; i <= d; i++) o.push(i); return o; }

  /* Všechny fakty tématu: { klic, druh: "nas"|"del", a, b } (a = řada, b = druhý činitel) */
  function faktyTematu(t) {
    var out = [];
    (t.rady || []).forEach(function (a) {
      rozsah(t.od || 1, t.do || 10).forEach(function (b) {
        if (t.druh === "nasobeni" || t.druh === "nasobilka") out.push({ klic: "n" + a + "x" + b, druh: "nas", a: a, b: b });
        if (t.druh === "deleni" || t.druh === "nasobilka") out.push({ klic: "d" + a * b + ":" + a, druh: "del", a: a, b: b });
      });
    });
    return out;
  }

  function stav(profil, klic) {
    return profil.fakta[klic] || { box: 0, dalsi: 0, spatne: 0, spravne: 0 };
  }

  function vaha(profil, f) {
    var s = stav(profil, f.klic);
    var splatny = s.dalsi <= profil.lekci;
    return (splatny ? 3 : 0.4) * (6 - Math.min(5, s.box)) + (s.spatne > s.spravne ? 2 : 0);
  }

  // vážený výběr bez opakování
  function vyber(profil, fakta, n) {
    var zbyva = fakta.slice(), out = [];
    while (out.length < n && zbyva.length) {
      var soucet = zbyva.reduce(function (s, f) { return s + vaha(profil, f); }, 0), r = Math.random() * soucet, i = 0;
      for (; i < zbyva.length - 1; i++) { r -= vaha(profil, zbyva[i]); if (r <= 0) break; }
      out.push(zbyva.splice(i, 1)[0]);
    }
    return out;
  }

  /* Fáze u násobení jedné řady: 0 po řadě, 1 napřeskáčku, 2 smíšeně (i dělení a chybějící číslo). */
  var FAZE = ["po řadě", "napřeskáčku", "smíšeně"];

  function sestavLekci(profil, tema) {
    var stavT = profil.tema[tema.id] || { lekci: 0, faze: 0 };
    var fakta = faktyTematu(tema), vybrane, typy;
    var n = window.LEKCE.pocetUloh;

    if (tema.druh === "nasobeni" && tema.faze && stavT.faze === 0) {
      // po řadě: 8 × 1, 8 × 2 … 8 × 10 (deset příkladů, ať je celá řada)
      vybrane = fakta.slice(0, 10);
      typy = vybrane.map(function (f, i) { return i < 3 ? "vyber" : (i % 2 ? "napis" : "vyber"); });
    } else if (tema.druh === "nasobeni" && tema.faze && stavT.faze === 1) {
      vybrane = vyber(profil, fakta, n);
      typy = vybrane.map(function () { return Math.random() < 0.5 ? "vyber" : "napis"; });
    } else {
      var zaklad = fakta.slice();
      if (tema.druh === "nasobeni") {
        // smíšeně: přidej i dělení stejné řady
        tema.rady.forEach(function (a) { rozsah(tema.od, tema.do).forEach(function (b) { zaklad.push({ klic: "d" + a * b + ":" + a, druh: "del", a: a, b: b }); }); });
      }
      vybrane = vyber(profil, zaklad, n);
      typy = vybrane.map(function (f) {
        var r = Math.random();
        if (f.druh === "nas" && r < 0.25) return "chybi";
        return r < 0.6 ? "napis" : "vyber";
      });
    }
    return vybrane.map(function (f, i) { return uloha(f, typy[i], tema); });
  }

  function moznosti(spravne, f) {
    var a = f.a, kand = f.druh === "nas"
      ? [spravne + a, spravne - a, spravne + 1, spravne - 1, spravne + 10, spravne - 10, a * (f.b + 2), Number(String(spravne).split("").reverse().join(""))]
      : [spravne + 1, spravne - 1, spravne + 2, spravne - 2, a, spravne + 3];
    var o = [];
    zamichat(kand).forEach(function (x) { if (x > 0 && x !== spravne && o.indexOf(x) < 0 && o.length < 3) o.push(x); });
    while (o.length < 3) { var x = spravne + nahodne(2, 12); if (o.indexOf(x) < 0) o.push(x); }
    o.push(spravne);
    return zamichat(o);
  }

  /* Úloha pro obrazovku. zadani = to, co se ukáže velkým písmem. */
  function uloha(f, typ, tema) {
    var c = f.a * f.b, u = { fakt: f, typ: typ, tema: tema.id, finta9: !!tema.finta9 && f.a === 9 };
    if (f.druh === "del") {
      u.zadani = c + " : " + f.a + " = ?";
      u.vysledek = f.b;
      u.mluva = "Kolik je " + c + " děleno " + f.a + "?";
    } else if (typ === "chybi") {
      u.zadani = f.a + " × ? = " + c;
      u.vysledek = f.b;
      u.mluva = f.a + " krát kolik je " + c + "?";
    } else {
      u.zadani = f.a + " × " + f.b + " = ?";
      u.vysledek = c;
      u.mluva = "Kolik je " + f.a + " krát " + f.b + "?";
    }
    if (typ === "vyber") u.moznosti = moznosti(u.vysledek, f);
    return u;
  }

  /* Po odpovědi: posun faktu. prvni = správně napoprvé. */
  function zapis(profil, u, prvni) {
    var s = stav(profil, u.fakt.klic);
    if (prvni) {
      s.box = Math.min(5, s.box + 1);
      s.spravne++;
      s.dalsi = profil.lekci + Math.pow(2, s.box - 1);
    } else {
      s.box = Math.max(0, s.box - 2);
      s.spatne++;
      s.dalsi = profil.lekci + 1;
    }
    profil.fakta[u.fakt.klic] = s;
  }

  /* Po lekci: případný posun fáze (≥ 80 % napoprvé). Vrací true, když se fáze posunula. */
  function konecLekce(profil, tema, napoprve, celkem) {
    var st = profil.tema[tema.id] || { lekci: 0, faze: 0 };
    st.lekci++;
    var posun = false;
    if (tema.druh === "nasobeni" && tema.faze && st.faze < 2 && napoprve / celkem >= 0.8) { st.faze++; posun = true; }
    profil.tema[tema.id] = st;
    profil.lekci++;
    return posun;
  }

  function nejtezsi(profil, max) {
    return Object.keys(profil.fakta).map(function (k) { var s = profil.fakta[k]; return { klic: k, s: s }; })
      .filter(function (x) { return x.s.spatne > 0; })
      .sort(function (x, y) { return (y.s.spatne - y.s.spravne * 0.5) - (x.s.spatne - x.s.spravne * 0.5); })
      .slice(0, max || 8)
      .map(function (x) {
        var m = x.klic.match(/^n(\d+)x(\d+)$/), d = x.klic.match(/^d(\d+):(\d+)$/);
        return { text: m ? m[1] + " × " + m[2] : d ? d[1] + " : " + d[2] : x.klic, spatne: x.s.spatne, spravne: x.s.spravne };
      });
  }

  window.ULOHY = { sestavLekci: sestavLekci, zapis: zapis, konecLekce: konecLekce, faktyTematu: faktyTematu, nejtezsi: nejtezsi, FAZE: FAZE, zamichat: zamichat };
})();
