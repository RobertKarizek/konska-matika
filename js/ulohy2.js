/* Další témata: sčítání a odčítání, písemné počítání, dělení se zbytkem, porovnávání, číselná osa,
 * dvojciferné násobení, čísla do 10 000, zaokrouhlování, zlomky a slovní úlohy.
 * Obtížnost (úroveň 1–5) roste s tím, jak holčičce téma jde. */
(function () {
  var CZ = window.CZ;
  function n(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function vyber(pole) { return pole[Math.floor(Math.random() * pole.length)]; }
  function cis(x) { return CZ.cislo(x); }

  function moznostiCisel(spravne, rozptyl) {
    var o = [], kand = [spravne + 1, spravne - 1, spravne + 10, spravne - 10, spravne + rozptyl, spravne - rozptyl, spravne + 2, spravne - 2];
    window.ULOHY.zamichat(kand).forEach(function (x) { if (x >= 0 && x !== spravne && o.indexOf(x) < 0 && o.length < 3) o.push(x); });
    while (o.length < 3) { var x = spravne + n(3, 20); if (o.indexOf(x) < 0) o.push(x); }
    o.push(spravne);
    return window.ULOHY.zamichat(o);
  }

  function zakladni(zadani, vysledek, mluva, extra) {
    var u = { zadani: zadani, vysledek: vysledek, mluva: mluva || zadani, typ: Math.random() < 0.35 ? "vyber" : "napis", fakt: { klic: zadani.replace(/ /g, " "), druh: "jiny" } };
    for (var k in extra) u[k] = extra[k];
    if (u.typ === "vyber" && !u.moznosti) u.moznosti = moznostiCisel(vysledek, u.rozptyl || 10);
    return u;
  }

  /* ---------- sčítání a odčítání ---------- */
  function scitani(t, ur) {
    var a, b, plus = Math.random() < 0.55;
    if (t.rozsah === 1000) {
      if (ur <= 1) { a = n(1, 8) * 100; b = n(1, 9 - a / 100) * 100; }
      else if (ur === 2) { a = n(1, 8) * 100 + n(1, 8) * 10; b = n(1, 9) * 10; }
      else if (ur === 3) { a = n(101, 880); b = n(2, 9); }
      else if (ur === 4) { a = n(120, 860); b = n(11, 99); }
      else { a = n(150, 800); b = n(101, 999 - a); }
    } else {
      if (ur <= 1) { a = n(5, 9); b = n(11 - a, 9); }                     // 8 + 5 (přes desítku do 20)
      else if (ur === 2) { a = n(2, 8) * 10 + n(3, 9); b = n(10 - (a % 10), 9); }  // 47 + 8
      else if (ur === 3) { a = n(2, 8) * 10 + n(10, 18) % 10; b = n(2, 9); plus = Math.random() < 0.4; }
      else if (ur === 4) { a = n(2, 6) * 10 + n(1, 4); b = n(1, 3) * 10 + n(1, 4); }   // bez přechodu
      else { a = n(25, 69); b = n(11, 99 - a); if (b % 10 + a % 10 < 10) b = Math.min(99 - a, b + (10 - (a % 10) - (b % 10))); }
    }
    if (!plus) {
      if (b > a) { var x = a; a = b; b = x; }
      if (t.rozsah !== 1000 && ur <= 2 && a < 11) { a = a + 10; }
      if (t.rozsah !== 1000 && ur <= 3 && a % 10 >= b % 10) b = Math.min(a - 1, b + (a % 10) + 1 - (b % 10)) || b;
    }
    if (!plus && a - b <= 0) a = b + n(1, 9);
    var v = plus ? a + b : a - b;
    var z = cis(a) + (plus ? " + " : " − ") + cis(b) + " = ?";
    return zakladni(z, v, cis(a) + (plus ? " plus " : " mínus ") + cis(b), { np: { druh: plus ? "plus" : "minus", a: a, b: b }, rozptyl: 10 });
  }

  /* ---------- písemné sčítání a odčítání (do 10 000) ---------- */
  function pisemne(t, ur) {
    var cifer = ur <= 2 ? 3 : 4, plus = Math.random() < 0.55;
    var max = Math.pow(10, cifer) - 1, a = n(Math.pow(10, cifer - 1), max), b = n(Math.pow(10, cifer - 2) * (ur <= 1 ? 1 : 3), Math.min(max, ur <= 1 ? a : max));
    if (plus && a + b > 9999) b = 9999 - a;
    if (!plus && b > a) { var x = a; a = b; b = x; }
    var v = plus ? a + b : a - b;
    return { typ: "napis", sloupec: { a: a, b: b, op: plus ? "+" : "−" }, zadani: cis(a) + (plus ? " + " : " − ") + cis(b) + " = ?", vysledek: v,
      mluva: cis(a) + (plus ? " plus " : " mínus ") + cis(b), np: { druh: "pisemne", a: a, b: b, op: plus ? "+" : "−" }, fakt: { klic: "pisemne " + (plus ? "+" : "−"), druh: "jiny" } };
  }

  /* ---------- dvojciferné × jednociferné ---------- */
  function nasobeni2(t, ur) {
    var a = ur <= 1 ? n(2, 9) * 10 : ur === 2 ? n(1, 4) * 10 + n(1, 2) : n(1, 9) * 10 + n(3, 9), b = ur <= 2 ? n(2, 4) : n(3, 9);
    if (a * b > 999) b = 3;
    return zakladni(a + " × " + b + " = ?", a * b, a + " krát " + b, { np: { druh: "nas2", a: a, b: b }, rozptyl: b * 10 });
  }

  /* ---------- dělení se zbytkem ---------- */
  function zbytek(t, ur) {
    var a = ur <= 2 ? n(2, 5) : n(3, 9), b = n(2, ur <= 2 ? 5 : 9), r = n(1, a - 1), c = a * b + r;
    return { typ: "zbytek", zadani: c + " : " + a + " = ?", mluva: c + " děleno " + a,
      kroky: [{ otazka: "Kolik dostane každý kůň?", vysledek: b }, { otazka: "Kolik zbude pro hříbě?", vysledek: r }],
      vysledek: b, np: { druh: "zbytek", a: a, b: b, r: r }, fakt: { klic: c + " : " + a, druh: "jiny" } };
  }

  /* ---------- porovnávání a číselná osa ---------- */
  function porovnani(t, ur) {
    var max = t.rozsah || 1000;
    if (Math.random() < 0.4) return osa(max, ur);
    var a = n(Math.floor(max / 20), max - 1), b;
    if (ur <= 2) b = n(Math.floor(max / 20), max - 1);
    else { var rad = max >= 10000 ? vyber([1, 10, 100]) : vyber([1, 10]); b = a + vyber([-1, 1, 0, -2, 2]) * rad; if (b < 0 || b >= max) b = a; }
    if (Math.random() < 0.12) b = a;
    var v = a < b ? "<" : a > b ? ">" : "=";
    return { typ: "vyber", zadani: cis(a) + "  ?  " + cis(b), mluva: "Které znaménko patří mezi " + cis(a) + " a " + cis(b) + "?", vysledek: v,
      moznosti: ["<", "=", ">"], znaky: true, np: { druh: "porovnani", a: a, b: b }, fakt: { klic: "porovnání do " + cis(max), druh: "jiny" } };
  }

  function osa(max, ur) {
    var krok = max >= 10000 ? 1000 : max >= 1000 ? 100 : 10, od = 0;
    var dilky = 10, hodnota;
    if (ur >= 3) { od = n(0, 8) * krok; krok = krok / 10; }
    hodnota = od + n(1, dilky - 1) * krok;
    return { typ: "vyber", osa: { od: od, krok: krok, dilky: dilky, hodnota: hodnota }, zadani: "Na kterém čísle stojí koník?", mluva: "Na kterém čísle stojí koník?",
      vysledek: hodnota, moznosti: moznostiOsa(hodnota, krok), np: { druh: "osa", od: od, krok: krok, hodnota: hodnota }, fakt: { klic: "číselná osa", druh: "jiny" }, textove: true };
  }
  function moznostiOsa(h, krok) {
    var o = [h - krok, h + krok, h + 2 * krok, h - 2 * krok].filter(function (x) { return x >= 0; }).slice(0, 3);
    o.push(h);
    return window.ULOHY.zamichat(o);
  }

  /* ---------- čísla do 10 000 (skládání a porovnání) ---------- */
  function cisla10000(t, ur) {
    if (Math.random() < 0.5) return porovnani({ rozsah: 10000 }, ur);
    var ti = n(1, 9), s = n(0, 9), d = n(0, 9), j = n(0, 9), v = ti * 1000 + s * 100 + d * 10 + j;
    var sta = s === 1 ? "sto" : s === 2 ? "stě" : s <= 4 && s > 0 ? "sta" : "set";
    var txt = CZ.pocet(ti, "tisic") + ", " + s + "\u00a0" + sta + ", " + CZ.pocet(d, "desitka") + " a " + CZ.pocet(j, "jednotka");
    return zakladni("Které číslo to je?", v, "Které číslo má " + txt + "?", { rozklad: { t: ti, s: s, d: d, j: j }, text: "Číslo má " + txt + ". Které číslo to je?", textove: true, np: { druh: "rozklad", t: ti, s: s, d: d, j: j }, rozptyl: 100 });
  }

  /* ---------- zaokrouhlování ---------- */
  function zaokrouhleni(t, ur) {
    var na = ur <= 2 ? 10 : vyber([10, 100]), x = ur <= 2 ? n(11, 99) : n(101, 999);
    if (x % na === 0) x += 3;
    var v = Math.round(x / na) * na;
    var dolu = Math.floor(x / na) * na, nahoru = dolu + na;
    return { typ: "vyber", zadani: "Zaokrouhli " + cis(x) + " na " + (na === 10 ? "desítky" : "stovky"), mluva: "Zaokrouhli " + x + " na " + (na === 10 ? "desítky" : "stovky"),
      vysledek: v, moznosti: window.ULOHY.zamichat([dolu, nahoru, dolu >= na * 2 ? dolu - na : nahoru + na]),
      textove: true, np: { druh: "zaokr", x: x, na: na, dolu: dolu, nahoru: nahoru }, fakt: { klic: "zaokrouhlení na " + na, druh: "jiny" } };
  }

  /* ---------- zlomky ---------- */
  var ZLOMEK = { 2: "polovina", 3: "třetina", 4: "čtvrtina", 5: "pětina", 10: "desetina" };
  var ZLOMEK2 = { 2: "polovinu", 3: "třetinu", 4: "čtvrtinu", 5: "pětinu", 10: "desetinu" };
  function zlomky(t, ur) {
    var j = vyber(ur <= 2 ? [2, 4] : [2, 3, 4, 5, 10]), k = n(2, ur <= 2 ? 5 : 9), c = j * k;
    var pocitany = Math.random() < 0.5 && ur >= 3 ? n(2, j - 1 || 1) : 1;
    if (pocitany >= j) pocitany = 1;
    var v = pocitany * k;
    var co = pocitany === 1 ? ZLOMEK[j] : pocitany + "/" + j;
    return zakladni("Kolik je " + (pocitany === 1 ? ZLOMEK[j] : pocitany + "/" + j) + " z " + c + "?", v,
      "Koník má " + c + " mrkví a sní " + (pocitany === 1 ? ZLOMEK2[j] : pocitany + " lomeno " + j) + ". Kolik mrkví sní?",
      { text: "Koník má " + CZ.pocet(c, "mrkev") + " a sní " + (pocitany === 1 ? ZLOMEK2[j] : pocitany + "/" + j) + ". Kolik mrkví sní?", np: { druh: "zlomek", j: j, k: k, p: pocitany }, rozptyl: k, textove: true });
  }

  /* ---------- slovní úlohy z koňského světa ---------- */
  function je(nn, jednotne, mnozne) { return CZ.sloveso(nn, jednotne, mnozne); }
  var SLOVNI = {
    nasobeni: [
      function (a, b) {
        return { text: "Kovář má okovat " + CZ.pocet(b, "kone4") + ". Každý kůň potřebuje 4 podkovy. Kolik podkov kovář potřebuje?", a: 4, b: b, ikona: "podkova" };
      },
      function (a, b) {
        return { text: "Ve stáji " + je(b, "je", "jsou") + " " + CZ.pocet(b, "radek") + " boxů. V každé řadě " + je(a, "je", "jsou") + " " + CZ.pocet(a, "kun1") + ". Kolik koní je ve stáji?", a: a, b: b, ikona: "kun" };
      },
      function (a, b) {
        return { text: "Ve stáji " + je(b, "je", "jsou") + " " + CZ.pocet(b, "hribe4") + ". Každé dostane " + CZ.pocet(a, "mrkev") + ". Kolik mrkví potřebujeme?", a: a, b: b, ikona: "mrkev" };
      }
    ],
    deleni: [
      function (a, b) {
        return { text: CZ.cislo(a * b) + " " + CZ.tvar("jablko", a * b) + " rozdělíme spravedlivě mezi " + CZ.pocet(a, "kone4") + ". Kolik jablek dostane každý?", a: a, b: b, ikona: "jablko" };
      },
      function (a, b) {
        return { text: "Na louce " + je(a * b, "je", "jsou") + " " + CZ.pocet(a * b, "balik") + " sena. Do každého žlabu dáme " + CZ.pocet(a, "balik") + ". Kolik žlabů naplníme?", a: a, b: b, ikona: "seno" };
      }
    ],
    plus: [
      function (a, b) {
        return { text: "Na pastvině se " + je(a, "pase", "pasou") + " " + CZ.pocet(a, "kun1") + ". " + je(b, "Přiběhne", "Přiběhnou") + " ještě " + b + ". Kolik koní je teď na pastvině?", ikona: "kun" };
      },
      function (a, b) {
        return { text: "Laurinka nasbírala " + CZ.pocet(a, "jablko") + " a Julinka " + b + ". Kolik jablek mají dohromady?", ikona: "jablko" };
      }
    ],
    minus: [
      function (a, b) {
        return { text: "Ve stáji " + je(a, "bylo", "byly") + " " + CZ.pocet(a, "balik") + " sena. Koně jich snědli " + b + ". Kolik balíků zbylo?", ikona: "seno" };
      },
      function (a, b) {
        return { text: "Koník měl " + CZ.pocet(a, "mrkev") + ". K svačině jich snědl " + b + ". Kolik mrkví mu zbylo?", ikona: "mrkev" };
      }
    ]
  };

  function slovni(t, ur, druh) {
    druh = druh || vyber(t.operace || ["nasobeni", "deleni", "plus", "minus"]);
    var rady = t.rady || [4, 5, 6, 7, 8, 9], a, b, s, v, z;
    if (druh === "nasobeni") { a = vyber(rady); b = n(2, ur <= 2 ? 5 : 9); s = vyber(SLOVNI.nasobeni)(a, b); v = s.a * s.b; z = s.a + " × " + s.b; }
    else if (druh === "deleni") { a = vyber(rady); b = n(2, ur <= 2 ? 5 : 9); s = vyber(SLOVNI.deleni)(a, b); v = b; z = a * b + " : " + a; }
    else if (druh === "plus") { a = n(5, ur <= 2 ? 15 : 60); b = n(2, ur <= 2 ? 9 : 35); s = vyber(SLOVNI.plus)(a, b); v = a + b; z = a + " + " + b; }
    else { a = n(10, ur <= 2 ? 20 : 90); b = n(2, Math.min(a - 1, ur <= 2 ? 9 : 40)); s = vyber(SLOVNI.minus)(a, b); v = a - b; z = a + " − " + b; }
    return { typ: Math.random() < 0.4 ? "vyber" : "napis", text: s.text.replace(/\s+/g, " "), zadani: s.text.replace(/\s+/g, " "), slovni: true, ikona: s.ikona, vzorec: z, vysledek: v, mluva: s.text,
      moznosti: moznostiCisel(v, druh === "nasobeni" ? (s.a || 5) : 5), np: { druh: druh === "nasobeni" ? "nasobeni" : druh === "deleni" ? "deleni" : druh, a: s.a || a, b: s.b || b }, fakt: { klic: "slovní: " + z, druh: "jiny" } };
  }

  var GEN = { scitani: scitani, pisemne: pisemne, nasobeni2: nasobeni2, deleni_zbytek: zbytek, porovnani: porovnani, cisla10000: cisla10000, zaokrouhleni: zaokrouhleni, zlomky: zlomky, slovni: slovni };

  window.ULOHY2 = {
    umi: function (druh) { return !!GEN[druh]; },
    uloha: function (t, uroven) { return GEN[t.druh](t, uroven || 1); },
    slovni: slovni
  };
})();
