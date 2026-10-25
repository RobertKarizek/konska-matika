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

  function pocetUloh(profil) { return profil.delkaLekce || window.LEKCE.pocetUloh; }
  function uroven(profil, tema) {
    var st = profil.tema[tema.id];
    if (st && st.uroven) return st.uroven;
    return profil.obtiznost === "tezsi" ? 2 : 1;
  }

  function sestavLekci(profil, tema) {
    var n = pocetUloh(profil);
    if (window.ULOHY2 && window.ULOHY2.umi(tema.druh)) {
      var ur = uroven(profil, tema), out = [];
      for (var i = 0; i < n; i++) out.push(window.ULOHY2.uloha(tema, ur));
      return out;
    }
    var ulohy = sestavNasobilku(profil, tema, n);
    var stavT = profil.tema[tema.id] || { lekci: 0, faze: 0 };
    var smisene = tema.druh === "nasobilka" || stavT.faze >= 1 || !tema.faze;
    if (smisene && ulohy.length >= 8) {
      // jedno přetahování a (ve smíšené fázi) jedno pexeso, ať to není stereotypní
      var kde = 2 + Math.floor(Math.random() * 3);
      var p = pretahni(ulohy[kde].fakt, tema);
      if (p) ulohy[kde] = p;
      if (tema.druh === "nasobilka" || stavT.faze >= 2) ulohy[ulohy.length - 2] = pexeso(profil, tema);
    }
    return ulohy;
  }

  function pretahni(f, tema) {
    var CZ = window.CZ, ik = tema.ikona === "jablko" ? "jablko" : "mrkev";
    function jeTu(x) { return CZ.sloveso(x, "Je tu", "Jsou tu"); }
    if (f.druh === "nas" && f.b >= 2 && f.b <= 5) {
      return { typ: "pretahni", fakt: f, tema: tema.id, pretahni: { zlaby: f.b, naKazdy: f.a, ikona: ik },
        zadani: f.a + " × " + f.b + " = ?", text: jeTu(f.b) + " " + CZ.pocet(f.b, "zlab") + ". Do každého dej " + CZ.pocet(f.a, ik) + ".",
        otazka: "Kolik " + (ik === "mrkev" ? "mrkví" : "jablek") + " je ve žlabech dohromady?", vysledek: f.a * f.b, mluva: "Do každého žlabu dej " + f.a + "." };
    }
    if (f.druh === "del" && f.a * f.b <= 45) {
      return { typ: "pretahni", fakt: f, tema: tema.id, pretahni: { rozdel: true, celkem: f.a * f.b, zlaby: f.a, ikona: "jablko" },
        zadani: f.a * f.b + " : " + f.a + " = ?", text: jeTu(f.a) + " " + CZ.pocet(f.a, "zlab") + ". Rozděl do nich spravedlivě " + CZ.pocet(f.a * f.b, "jablko") + ".",
        otazka: "Kolik jablek je v každém žlabu?", vysledek: f.b, mluva: "Rozděl " + f.a * f.b + " jablek do " + f.a + " žlabů." };
    }
    return null;
  }

  function pexeso(profil, tema) {
    var fakta = vyber(profil, faktyTematu(tema).filter(function (f) { return f.druh === "nas"; }), 6);
    var vysledky = {};
    fakta = fakta.filter(function (f) { if (vysledky[f.a * f.b]) return false; vysledky[f.a * f.b] = 1; return true; }).slice(0, 6);
    return { typ: "pexeso", tema: tema.id, fakt: { klic: "pexeso", druh: "jiny" }, pary: fakta.map(function (f) { return { a: f.a + " × " + f.b, b: String(f.a * f.b), fakt: f }; }),
      zadani: "Pexeso", text: "Najdi dvojice: příklad a jeho výsledek.", mluva: "Pexeso. Najdi příklad a jeho výsledek.", vysledek: null };
  }

  function sestavNasobilku(profil, tema, n) {
    var stavT = profil.tema[tema.id] || { lekci: 0, faze: 0 };
    var fakta = faktyTematu(tema), vybrane, typy;

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
    if (!u.fakt || u.fakt.klic === "pexeso") return;
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
    if (window.ULOHY2 && window.ULOHY2.umi(tema.druh)) {
      var ur = uroven(profil, tema);
      if (napoprve / celkem >= 0.8 && ur < 5) { st.uroven = ur + 1; posun = "uroven"; }
      else if (napoprve / celkem < 0.5 && ur > 1) st.uroven = ur - 1;
      else st.uroven = ur;
    }
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
        return { text: m ? m[1] + " × " + m[2] : d ? d[1] + " : " + d[2] : x.klic.replace(/ = \?$/, ""), spatne: x.s.spatne, spravne: x.s.spravne };
      });
  }

  window.ULOHY = { sestavLekci: sestavLekci, uroven: uroven, pocetUloh: pocetUloh, zapis: zapis, konecLekce: konecLekce, faktyTematu: faktyTematu, nejtezsi: nejtezsi, FAZE: FAZE, zamichat: zamichat };
})();
