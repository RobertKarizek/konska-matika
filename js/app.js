/* Koňská matika – obrazovky a průběh hry. */
(function () {
  var G = window.GRAFIKA, CZ = window.CZ, U = window.ULOHY, S = window.ULOZISTE, Z = window.ZVUK, H = window.HLAS;
  var app = document.getElementById("app");
  var data = S.nacist();
  Z.nastavit(data.zvuk);

  var SVET = {
    laurinka: { nazev: "Ranč u hor", vychoziKun: { srst: "hnedak", hriva: "tmava", odznak: "hvezda" }, domov: "na ranč" },
    julinka: { nazev: "Kvetoucí louka", vychoziKun: { srst: "belous", hriva: "ruzova", odznak: "srdce" }, domov: "na louku" }
  };
  var MISTA = [
    { id: "louka", nazev: "Louka" }, { id: "les", nazev: "Les" }, { id: "jezero", nazev: "Jezero" },
    { id: "drahu", nazev: "Závodní dráha" }, { id: "hory", nazev: "Výlet do hor" }
  ];
  var JMENA = ["Hvězdička", "Bobík", "Oříšek", "Měsíček", "Karamelka", "Blesk", "Skořice", "Pírko", "Sněženka", "Fazolka"];

  var hra = null;        // běžící lekce
  var obrazovka = "";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(sel) { return app.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(app.querySelectorAll(sel)); }
  function ulozit() { S.ulozit(); }
  function profil(kdo) { return S.profil(kdo); }
  function jmeno(kdo) { return window.UCIVO[kdo].jmeno; }

  function temata(kdo) {
    var p = profil(kdo);
    return window.UCIVO[kdo].temata.map(function (t) {
      var zap = p.temata[t.id] !== undefined ? p.temata[t.id] : t.zapnuto;
      return Object.assign({}, t, { aktivni: zap && !t.pripravuje_se });
    });
  }

  /* ---------- společné kousky ---------- */
  function lista(kdo) {
    var p = profil(kdo);
    return '<header class="lista">' +
      '<button class="tl-kulate" data-akce="domu" aria-label="Domů">' + domek() + "</button>" +
      '<div class="pocitadla" aria-label="Odměny">' +
      '<span title="mrkve">' + G.ikona("mrkev") + "<b>" + p.mrkve + "</b></span>" +
      '<span title="jablka">' + G.ikona("jablko") + "<b>" + p.jablka + "</b></span>" +
      '<span title="podkovy">' + G.ikona("podkova") + "<b>" + p.podkovy + "</b></span></div>" +
      '<button class="tl-kulate" data-akce="zvuk" aria-label="' + (data.zvuk ? "Vypnout zvuk" : "Zapnout zvuk") + '">' + reproduktor(data.zvuk) + "</button>" +
      "</header>";
  }
  function domek() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 L12 3 L21 11 V21 H14 V15 H10 V21 H3z" fill="currentColor"/></svg>'; }
  function reproduktor(zap) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4z" fill="currentColor"/>' +
      (zap ? '<path d="M16 8 C 18 10, 18 14, 16 16 M18.5 5.5 C 22 9, 22 15, 18.5 18.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'
        : '<path d="M16 9 L21 15 M21 9 L16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') + "</svg>";
  }
  function bublina(text, trida) { return '<div class="bublina ' + (trida || "") + '" aria-live="polite">' + esc(text) + "</div>"; }

  function nastavSvet(kdo) {
    document.body.dataset.svet = kdo || "";
    var bg = document.getElementById("pozadi");
    var siroky = window.innerWidth > window.innerHeight * 0.8;
    bg.dataset.kdo = kdo || "";
    bg.dataset.siroky = siroky ? "1" : "";
    bg.innerHTML = kdo ? (siroky ? G.svetSiroky(kdo) : G.svet(kdo)) : "";
  }
  var otoceni = null;
  window.addEventListener("resize", function () {
    clearTimeout(otoceni);
    otoceni = setTimeout(function () {
      var bg = document.getElementById("pozadi"), siroky = window.innerWidth > window.innerHeight * 0.8;
      if (bg.dataset.kdo && (bg.dataset.siroky === "1") !== siroky) nastavSvet(bg.dataset.kdo);
    }, 200);
  });

  function prepni(nazev, fn) {
    obrazovka = nazev;
    H.stop();
    fn();
    app.scrollTop = 0;
    window.scrollTo(0, 0);
    var h = $("h1, h2, .zadani");
    if (h && h.focus) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }

  /* ---------- úvod ---------- */
  function uvod() {
    nastavSvet("");
    hra = null;
    prepni("uvod", function () {
      var karty = ["laurinka", "julinka"].map(function (kdo) {
        var p = profil(kdo), k = p.kun || SVET[kdo].vychoziKun;
        return '<button class="karta-holka ' + kdo + '" data-akce="svet" data-kdo="' + kdo + '">' +
          '<div class="karta-kun' + (p.kun ? "" : " stin") + '">' + G.kun(k) + "</div>" +
          '<span class="karta-jmeno">' + jmeno(kdo) + "</span>" +
          '<span class="karta-pod">' + (p.kun ? esc(p.kun.jmeno) + " už čeká" : "vyber si koníka") + "</span></button>";
      }).join("");
      app.innerHTML =
        '<main class="uvod">' +
        '<h1 class="nadpis">Koňská matika</h1>' +
        '<p class="podnadpis">Kdo dnes jde za svým koníkem?</p>' +
        '<div class="karty">' + karty + "</div>" +
        (S.funguje() ? "" : '<p class="upozorneni">Tenhle prohlížeč si teď nepamatuje pokrok. Hrát jde, ale po zavření se odměny ztratí.</p>') +
        '<div class="uvod-dole"><button class="tl-maly" data-akce="rodice">Pro rodiče</button>' +
        '<button class="tl-maly" data-akce="zvuk">' + (data.zvuk ? "Zvuk: zapnutý" : "Zvuk: vypnutý") + "</button></div>" +
        "</main>";
    });
  }

  /* ---------- výběr koně ---------- */
  function tvorbaKone(kdo, uprava) {
    nastavSvet(kdo);
    var p = profil(kdo);
    var navrh = Object.assign({ jmeno: "" }, p.kun || SVET[kdo].vychoziKun);
    function moznosti(pole, klic) {
      return '<div class="volby" role="radiogroup">' + pole.map(function (x) {
        var vzorek = x.barva ? '<span class="vzorek" style="background:' + x.barva + '"></span>' : "";
        return '<button class="volba' + (navrh[klic] === x.id ? " vybrano" : "") + '" role="radio" aria-checked="' + (navrh[klic] === x.id) + '" data-klic="' + klic + '" data-hodnota="' + x.id + '">' + vzorek + esc(x.nazev) + "</button>";
      }).join("") + "</div>";
    }
    function kresli() {
      var jm = $("#jmeno-kone") ? $("#jmeno-kone").value : navrh.jmeno;
      navrh.jmeno = jm;
      app.innerHTML =
        '<main class="tvorba">' +
        '<header class="lista"><button class="tl-kulate" data-akce="' + (uprava ? "svet" : "domu") + '" data-kdo="' + kdo + '" aria-label="Zpět">' + domek() + '</button><span class="lista-nadpis">' + (uprava ? "Úprava koníka" : "Tvůj koník") + "</span><span></span></header>" +
        '<h2>' + (uprava ? "Jak má koník vypadat?" : "Ahoj, " + CZ.osloveni(kdo) + "! Vyber si svého koníka.") + "</h2>" +
        '<div class="nahled">' + G.kun(navrh) + "</div>" +
        "<h3>Srst</h3>" + moznosti(G.SRST, "srst") +
        "<h3>Hříva a ocas</h3>" + moznosti(G.HRIVA, "hriva") +
        "<h3>Odznak na čele</h3>" + moznosti(G.ODZNAK, "odznak") +
        '<h3><label for="jmeno-kone">Jak se bude jmenovat?</label></h3>' +
        '<input id="jmeno-kone" class="pole-jmeno" maxlength="16" autocomplete="off" placeholder="Jméno koníka" value="' + esc(navrh.jmeno) + '">' +
        '<div class="volby jmena">' + JMENA.map(function (j) { return '<button class="volba mala" data-jmeno="' + esc(j) + '">' + esc(j) + "</button>"; }).join("") + "</div>" +
        '<button class="tl-velke" data-akce="ulozit-kone">' + (uprava ? "Uložit" : "Hotovo, jdeme na to!") + "</button>" +
        "</main>";
      $$(".volba[data-klic]").forEach(function (b) {
        b.onclick = function () { navrh.jmeno = $("#jmeno-kone").value; navrh[b.dataset.klic] = b.dataset.hodnota; Z.klik(); kresli(); };
      });
      $$(".volba[data-jmeno]").forEach(function (b) { b.onclick = function () { $("#jmeno-kone").value = b.dataset.jmeno; Z.klik(); }; });
      $('[data-akce="ulozit-kone"]').onclick = function () {
        var j = $("#jmeno-kone").value.trim();
        if (!j) { $("#jmeno-kone").focus(); $("#jmeno-kone").classList.add("chybi"); return; }
        navrh.jmeno = j.slice(0, 16);
        p.kun = navrh;
        ulozit();
        Z.frk();
        svet(kdo, uprava ? "To je krása! Moc mi to sluší." : "Ahoj, " + CZ.osloveni(kdo) + "! Já jsem " + navrh.jmeno + ". Půjdeme spolu počítat?");
      };
    }
    prepni("tvorba", kresli);
  }

  /* ---------- svět holčičky ---------- */
  var POZDRAVY = [
    "Ahoj, {o}! Moc se těším, že jsi tu.","Ahoj, {o}! Dáme si spolu pár příkladů?", "{o}, mám hlad na mrkve! Pomůžeš mi?",
    "Hurá, {o} je tady!", "Dneska je krásně. Jdeme počítat, {o}?"
  ];
  function svet(kdo, vita) {
    var p = profil(kdo);
    if (!p.kun) return tvorbaKone(kdo);
    nastavSvet(kdo);
    hra = null;
    prepni("svet", function () {
      var seznam = temata(kdo).filter(function (t) { return t.aktivni; });
      var tlacitka = seznam.map(function (t) {
        var st = p.tema[t.id] || { lekci: 0, faze: 0 };
        var faze = t.faze ? '<span class="faze" aria-label="fáze ' + U.FAZE[st.faze] + '">' + U.FAZE.map(function (f, i) { return '<i class="' + (i <= st.faze ? "ano" : "") + '"></i>'; }).join("") + "</span>" : "";
        return '<button class="tema" data-akce="lekce" data-tema="' + t.id + '">' + G.ikona(t.ikona) +
          '<span class="tema-text"><b>' + esc(t.nazev) + "</b><small>" + (st.lekci ? CZ.pocet(st.lekci, "lekce") + (t.faze ? " · " + U.FAZE[st.faze] : "") : "zatím nezkoušeno") + "</small></span>" + faze + "</button>";
      }).join("") || '<p class="prazdne">Rodiče zatím nezapnuli žádné téma.</p>';
      var mista = MISTA.map(function (m) { return '<span class="misto zamceno" title="brzy">' + G.ikona("hvezda", "mala") + esc(m.nazev) + "<small>brzy</small></span>"; }).join("");
      var pozdrav = vita || CZ.nahodny(POZDRAVY).replace(/\{o\}/g, CZ.osloveni(kdo));
      app.innerHTML = lista(kdo) +
        '<main class="svet">' +
        '<h2 class="svet-nadpis">' + SVET[kdo].nazev + "</h2>" +
        '<div class="scena"><div class="kun-velky' + (vita ? " skace" : "") + '">' + G.kun(p.kun, predmetyKone(p)) + "</div>" + bublina(pozdrav) + "</div>" +
        '<section class="panel"><h3>Co dneska procvičíme?</h3><div class="temata">' + tlacitka + "</div></section>" +
        '<section class="panel"><h3>Výlety s koníkem</h3><div class="mista">' + mista + "</div>" +
        '<p class="tichy">Za podkovy brzy odemkneš nová místa a obchod pro koníka.</p></section>' +
        '<button class="tl-maly stred" data-akce="upravit-kone" data-kdo="' + kdo + '">Upravit koníka</button>' +
        "</main>";
      app.dataset.kdo = kdo;
    });
  }
  function predmetyKone(p) { return {}; }

  /* ---------- lekce ---------- */
  var CHVALA = ["Výborně!", "Paráda!", "Super, to sedí!", "Jupí, správně!", "Jsi šikulka!", "Přesně tak!", "To bylo rychlé!", "Mňam, další mrkev!"];
  var SKORO = ["Skoro! Zkusíme to spolu?", "Hmm, ještě jednou? Podívej se na obrázek.", "Nevadí! Pomůžu ti."];

  function lekce(kdo, temaId) {
    var p = profil(kdo), tema = temata(kdo).filter(function (t) { return t.id === temaId; })[0];
    if (!tema) return svet(kdo);
    hra = { kdo: kdo, tema: tema, ulohy: U.sestavLekci(p, tema), i: 0, pokus: 0, napoprve: 0, serie: 0, napoveda: false,
      ziskano: { mrkve: 0, jablka: 0, podkovy: 0 }, opakovat: [], vstup: "", hotovo: false };
    Z.cval();
    ukazUlohu();
  }

  function ukazUlohu() {
    var p = profil(hra.kdo), u = hra.ulohy[hra.i];
    hra.pokus = 0; hra.vstup = ""; hra.napoveda = false; hra.hotovo = false;
    prepni("lekce", function () {
      var postup = hra.ulohy.map(function (x, i) { return '<i class="' + (i < hra.i ? "hotovo" : i === hra.i ? "ted" : "") + '">' + G.ikona("podkova", "mala") + "</i>"; }).join("");
      var odpoved = u.typ === "vyber"
        ? '<div class="moznosti">' + u.moznosti.map(function (m, i) { return '<button class="moznost" data-hodnota="' + m + '"><small>' + (i + 1) + "</small>" + m + "</button>"; }).join("") + "</div>"
        : '<div class="displej" aria-live="polite"><span id="vstup"></span><i class="kurzor"></i></div>' + klavesnice();
      app.innerHTML = lista(hra.kdo) +
        '<main class="lekce">' +
        '<div class="postup" aria-label="Příklad ' + (hra.i + 1) + " z " + hra.ulohy.length + '">' + postup + "</div>" +
        '<div class="karta-ulohy">' +
        '<div class="kun-maly">' + G.kun(p.kun) + "</div>" + bublina(uvodBubliny(u)) +
        '<p class="zadani" aria-label="' + esc(u.mluva) + '">' + esc(u.zadani) + "</p>" +
        (H.podporovano() ? '<button class="tl-kulate predcist" data-akce="predcist" aria-label="Přečíst nahlas"><svg viewBox="0 0 24 24"><path d="M4 9 H8 L13 5 V19 L8 15 H4z" fill="currentColor"/><path d="M16 9 C 17.5 10.5, 17.5 13.5, 16 15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>' : "") +
        "</div>" + odpoved +
        '<div class="napoveda" id="napoveda" hidden></div>' +
        '<button class="tl-maly stred" data-akce="poradit">Poraď mi</button>' +
        "</main>";
      if (p.predcitani) H.rekni(u.mluva);
    });
  }

  function uvodBubliny(u) {
    if (hra.i === 0) return "Jdeme na to! " + (u.typ === "vyber" ? "Klepni na správné číslo." : "Napiš výsledek.");
    if (u.typ === "chybi") return "Které číslo chybí?";
    return CZ.nahodny(["Tohle zvládneš.", "Další příklad!", "Jen klidně, nikam nespěcháme.", "Hop, a dál!"]);
  }

  function klavesnice() {
    var k = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "smazat", "0", "ok"];
    return '<div class="klavesnice">' + k.map(function (x) {
      if (x === "smazat") return '<button class="klav sm" data-klav="smazat" aria-label="Smazat">⌫</button>';
      if (x === "ok") return '<button class="klav ok" data-klav="ok" aria-label="Potvrdit">✓</button>';
      return '<button class="klav" data-klav="' + x + '">' + x + "</button>";
    }).join("") + "</div>";
  }

  function nastavBublinu(text, trida) {
    var b = $(".karta-ulohy .bublina");
    if (b) { b.textContent = text; b.className = "bublina " + (trida || ""); }
  }

  function ukazNapovedu() {
    var u = hra.ulohy[hra.i], n = $("#napoveda");
    if (!n) return;
    n.innerHTML = window.NAPOVEDA.vytvor(u, hra.tema.ikona);
    n.hidden = false;
    hra.napoveda = true;
    var tl = $('[data-akce="poradit"]'); if (tl) tl.hidden = true;
    setTimeout(function () { n.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 60);
  }

  function psat(znak) {
    if (hra.hotovo) return;
    if (znak === "smazat") hra.vstup = hra.vstup.slice(0, -1);
    else if (hra.vstup.length < 4) hra.vstup += znak;
    Z.klik();
    var v = $("#vstup");
    if (v) v.textContent = hra.vstup;
  }

  function odpovez(hodnota, tlacitko) {
    if (hra.hotovo) return;
    var u = hra.ulohy[hra.i], p = profil(hra.kdo);
    if (hodnota === "" || hodnota == null || isNaN(hodnota)) return;
    hodnota = Number(hodnota);
    if (hodnota === u.vysledek) {
      hra.hotovo = true;
      var prvni = hra.pokus === 0 && !hra.napoveda;
      U.zapis(p, u, prvni);
      if (prvni) { hra.napoprve++; hra.serie++; } else hra.serie = 0;
      pridej(p, "mrkve", 1);
      var bonus = "";
      if (hra.serie > 0 && hra.serie % 3 === 0) { pridej(p, "jablka", 1); bonus = " A k tomu jablko za tři správně za sebou!"; }
      ulozit();
      Z.spravne();
      if (tlacitko) tlacitko.classList.add("spravne");
      var d = $(".displej"); if (d) d.classList.add("spravne");
      nastavBublinu(CZ.nahodny(CHVALA) + bonus, "radost");
      var kun = $(".kun-maly"); if (kun) { kun.classList.remove("skace"); void kun.offsetWidth; kun.classList.add("skace"); }
      letiMrkev();
      obnovPocitadla();
      if (!prvni && hra.opakovat.indexOf(u.fakt.klic) < 0 && hra.ulohy.length < 10) {
        hra.opakovat.push(u.fakt.klic);
        hra.ulohy.push(window.ULOHY_OPAKUJ(u));
      }
      setTimeout(dalsi, bonus ? 1700 : 1100);
      return;
    }
    // chyba = žádný trest, jen pomoc
    hra.pokus++;
    hra.serie = 0;
    Z.zkusZnovu();
    if (tlacitko) { tlacitko.classList.add("vedle"); tlacitko.disabled = true; }
    hra.vstup = ""; var v = $("#vstup"); if (v) v.textContent = "";
    if (hra.pokus === 1) {
      nastavBublinu(CZ.nahodny(SKORO), "premysli");
      ukazNapovedu();
    } else {
      nastavBublinu("Je to " + u.vysledek + ". Podívej se na obrázek a " + (u.typ === "vyber" ? "klepni na něj." : "napiš ho."), "premysli");
      if (!hra.napoveda) ukazNapovedu();
      $$(".moznost").forEach(function (b) { if (Number(b.dataset.hodnota) === u.vysledek) b.classList.add("ukazat"); });
    }
  }

  function pridej(p, co, n) { p[co] += n; hra.ziskano[co] += n; }

  function obnovPocitadla() {
    var p = profil(hra.kdo), b = $$(".pocitadla b");
    if (b.length === 3) { b[0].textContent = p.mrkve; b[1].textContent = p.jablka; b[2].textContent = p.podkovy; }
  }

  function letiMrkev() {
    var el = document.createElement("div");
    el.className = "leti";
    el.innerHTML = G.ikona("mrkev");
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 900);
  }

  function dalsi() {
    if (obrazovka !== "lekce" || !hra) return;
    hra.i++;
    if (hra.i < hra.ulohy.length) return ukazUlohu();
    oslava();
  }

  /* ---------- oslava ---------- */
  function vycet(z) {
    var casti = [];
    if (z.mrkve) casti.push(CZ.pocet(z.mrkve, "mrkev"));
    if (z.jablka) casti.push(CZ.pocet(z.jablka, "jablko"));
    if (z.podkovy) casti.push(CZ.pocet(z.podkovy, "podkova"));
    if (casti.length < 2) return casti.join("");
    return casti.slice(0, -1).join(", ") + " a " + casti[casti.length - 1];
  }

  function oslava() {
    var p = profil(hra.kdo), tema = hra.tema, celkem = hra.ulohy.length;
    pridej(p, "podkovy", 1);
    var posun = U.konecLekce(p, tema, hra.napoprve, celkem);
    p.historie.push({ den: new Date().toISOString().slice(0, 10), tema: tema.id, napoprve: hra.napoprve, celkem: celkem });
    if (p.historie.length > 200) p.historie = p.historie.slice(-200);
    ulozit();
    Z.hotovo();
    var st = p.tema[tema.id];
    prepni("oslava", function () {
      var konfety = "";
      for (var i = 0; i < 16; i++) konfety += '<span class="konfeta" style="left:' + (5 + i * 6) + "%;animation-delay:" + (i % 5) * 120 + 'ms">' + G.ikona(["mrkev", "jablko", "podkova", "hvezda"][i % 4], "mala") + "</span>";
      app.innerHTML = lista(hra.kdo) +
        '<main class="oslava">' + konfety +
        '<h2>Hurá! Lekce je hotová.</h2>' +
        '<div class="kun-velky skace">' + G.kun(p.kun) + "</div>" +
        bublina("Děkuju, " + CZ.osloveni(hra.kdo) + "! Získala jsi " + vycet(hra.ziskano) + ".", "radost") +
        (posun ? '<p class="postup-text">Postupuješ! Teď to zkusíme ' + U.FAZE[st.faze] + ".</p>" : "") +
        '<div class="tlacitka"><button class="tl-velke" data-akce="lekce" data-tema="' + tema.id + '">Ještě jednu</button>' +
        '<button class="tl-velke sv" data-akce="svet" data-kdo="' + hra.kdo + '">Zpět ' + SVET[hra.kdo].domov + "</button></div>" +
        "</main>";
    });
  }

  /* ---------- rodiče ---------- */
  function brana() {
    var a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4), vstup = "";
    var okno = document.createElement("div");
    okno.className = "modal";
    okno.innerHTML = '<div class="modal-okno" role="dialog" aria-modal="true" aria-labelledby="brana-n"><h2 id="brana-n">Pro rodiče</h2><p>Kolik je ' + a + " × " + b + "?</p>" +
      '<div class="displej"><span id="brana-v"></span><i class="kurzor"></i></div>' + klavesnice() +
      '<button class="tl-maly stred" data-zavrit>Zpět</button></div>';
    document.body.appendChild(okno);
    function zavri() { okno.remove(); document.removeEventListener("keydown", klav, true); }
    function zadej(z) {
      if (z === "ok") { if (Number(vstup) === a * b) { zavri(); rodice("laurinka"); } else { vstup = ""; okno.querySelector(".displej").classList.add("vedle"); } }
      else if (z === "smazat") vstup = vstup.slice(0, -1);
      else if (vstup.length < 3) vstup += z;
      okno.querySelector("#brana-v").textContent = vstup;
    }
    function klav(e) {
      if (/^[0-9]$/.test(e.key)) zadej(e.key); else if (e.key === "Backspace") zadej("smazat"); else if (e.key === "Enter") zadej("ok"); else if (e.key === "Escape") zavri(); else return;
      e.preventDefault(); e.stopPropagation();
    }
    document.addEventListener("keydown", klav, true);
    okno.addEventListener("click", function (e) {
      var k = e.target.closest("[data-klav]");
      if (k) zadej(k.dataset.klav);
      if (e.target.closest("[data-zavrit]") || e.target === okno) zavri();
    });
  }

  function rodice(kdo) {
    nastavSvet("");
    var p = profil(kdo);
    prepni("rodice", function () {
      var tez = U.nejtezsi(p, 8);
      var tem = temata(kdo).map(function (t) {
        return '<label class="prepinac' + (t.pripravuje_se ? " ne" : "") + '"><input type="checkbox" data-tema-prep="' + t.id + '"' + (t.aktivni ? " checked" : "") + (t.pripravuje_se ? " disabled" : "") + '><span></span>' + esc(t.nazev) + (t.pripravuje_se ? " <small>připravujeme</small>" : "") + "</label>";
      }).join("");
      app.innerHTML =
        '<main class="rodice">' +
        '<header class="lista"><button class="tl-kulate" data-akce="domu" aria-label="Domů">' + domek() + '</button><span class="lista-nadpis">Pro rodiče</span><span></span></header>' +
        '<div class="zalozky">' + ["laurinka", "julinka"].map(function (x) { return '<button data-akce="rodice-kdo" data-kdo="' + x + '" aria-pressed="' + (x === kdo) + '">' + jmeno(x) + "</button>"; }).join("") + "</div>" +
        '<section class="panel"><h3>Přehled</h3><p>' + CZ.pocet(p.lekci, "lekce") + " hotovo · " + CZ.pocet(p.mrkve, "mrkev") + " · " + CZ.pocet(p.jablka, "jablko") + " · " + CZ.pocet(p.podkovy, "podkova1") + "</p>" +
        (tez.length ? "<h4>Co dělá největší potíže</h4><ul class=\"tezke\">" + tez.map(function (x) { return "<li><b>" + x.text + "</b> <small>chyb " + x.spatne + ", správně " + x.spravne + "</small></li>"; }).join("") + "</ul>" : '<p class="tichy">Zatím žádné potíže – nebo se ještě nehrálo.</p>') +
        "</section>" +
        '<section class="panel"><h3>Témata</h3>' + tem + "</section>" +
        '<section class="panel"><h3>Nastavení</h3>' +
        '<label class="prepinac' + (H.podporovano() ? "" : " ne") + '"><input type="checkbox" data-nast="predcitani"' + (p.predcitani ? " checked" : "") + (H.podporovano() ? "" : " disabled") + "><span></span>Předčítat zadání nahlas" + (H.podporovano() ? "" : " <small>tento prohlížeč neumí</small>") + "</label>" +
        '<label class="prepinac"><input type="checkbox" data-nast="zvuk"' + (data.zvuk ? " checked" : "") + "><span></span>Zvuky</label></section>" +
        '<section class="panel"><h3>Přenést pokrok</h3><p class="tichy">Pokrok se ukládá jen v tomhle zařízení. Na jiné ho přeneseš kódem.</p>' +
        '<button class="tl-maly" data-akce="export">Vytvořit kód pro ' + jmeno(kdo) + "</button>" +
        '<textarea id="kod" rows="3" placeholder="Sem vlož kód z jiného zařízení" spellcheck="false"></textarea>' +
        '<div class="radek"><button class="tl-maly" data-akce="kopirovat">Zkopírovat</button><button class="tl-maly" data-akce="import">Načíst kód</button></div><p id="kod-stav" class="tichy" aria-live="polite"></p></section>' +
        '<section class="panel"><h3>Začít znovu</h3><p class="tichy">Smaže koníka, odměny i pokrok ' + (kdo === "laurinka" ? "Laurinky" : "Julinky") + ".</p>" +
        '<button class="tl-maly cerv" data-akce="reset">Smazat pokrok</button><div id="reset-potvrzeni" hidden><p><b>Opravdu?</b> Tohle nejde vrátit.</p><div class="radek"><button class="tl-maly cerv" data-akce="reset-ano">Ano, smazat</button><button class="tl-maly" data-akce="reset-ne">Ne</button></div></div></section>' +
        "</main>";
      app.dataset.kdo = kdo;
      $$("[data-tema-prep]").forEach(function (c) { c.onchange = function () { p.temata[c.dataset.temaPrep] = c.checked; ulozit(); }; });
      $$("[data-nast]").forEach(function (c) {
        c.onchange = function () {
          if (c.dataset.nast === "zvuk") { data.zvuk = c.checked; Z.nastavit(c.checked); }
          else { p.predcitani = c.checked; if (c.checked) H.rekni("Předčítání je zapnuté."); }
          ulozit();
        };
      });
    });
  }

  /* ---------- ovládání ---------- */
  app.addEventListener("click", function (e) {
    var t = e.target.closest("[data-akce], [data-klav], .moznost");
    if (!t) return;
    if (t.classList.contains("moznost")) return odpovez(t.dataset.hodnota, t);
    if (t.dataset.klav) {
      if (t.dataset.klav === "ok") return odpovez(hra && hra.vstup);
      return psat(t.dataset.klav);
    }
    var kdo = t.dataset.kdo || app.dataset.kdo;
    switch (t.dataset.akce) {
      case "domu": Z.klik(); return uvod();
      case "svet": Z.klik(); return svet(kdo);
      case "lekce": return lekce(hra ? hra.kdo : kdo, t.dataset.tema);
      case "upravit-kone": Z.klik(); return tvorbaKone(kdo, true);
      case "rodice": return brana();
      case "rodice-kdo": return rodice(kdo);
      case "poradit": Z.klik(); if (hra && !hra.napoveda) { ukazNapovedu(); nastavBublinu("Tady máš obrázek. Spočítej to se mnou.", "premysli"); } return;
      case "predcist": if (hra) H.rekni(hra.ulohy[hra.i].mluva); return;
      case "zvuk":
        data.zvuk = !data.zvuk; Z.nastavit(data.zvuk); ulozit(); if (data.zvuk) Z.klik();
        if (obrazovka === "uvod") return uvod();
        t.innerHTML = reproduktor(data.zvuk); t.setAttribute("aria-label", data.zvuk ? "Vypnout zvuk" : "Zapnout zvuk");
        return;
      case "export":
        S.exportKod(kdo).then(function (k) { $("#kod").value = k; $("#kod-stav").textContent = "Kód je připravený. Zkopíruj ho a vlož na druhém zařízení."; });
        return;
      case "kopirovat":
        var pole = $("#kod");
        if (navigator.clipboard && pole.value) navigator.clipboard.writeText(pole.value).then(function () { $("#kod-stav").textContent = "Zkopírováno."; }, function () { pole.select(); });
        else { pole.select(); }
        return;
      case "import":
        S.importKod($("#kod").value).then(function (id) { $("#kod-stav").textContent = "Hotovo: pokrok pro " + jmeno(id) + " je načtený."; data = S.nacist(); },
          function (err) { $("#kod-stav").textContent = err.message || "Kód se nepodařilo načíst."; });
        return;
      case "reset": $("#reset-potvrzeni").hidden = false; return;
      case "reset-ne": $("#reset-potvrzeni").hidden = true; return;
      case "reset-ano": S.resetovat(kdo); data = S.nacist(); return rodice(kdo);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (document.querySelector(".modal")) return;
    if (obrazovka !== "lekce" || !hra) return;
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    var u = hra.ulohy[hra.i];
    if (u.typ === "vyber") {
      var n = Number(e.key);
      if (n >= 1 && n <= 4) { var b = $$(".moznost")[n - 1]; if (b && !b.disabled) { odpovez(b.dataset.hodnota, b); e.preventDefault(); } }
      return;
    }
    if (/^[0-9]$/.test(e.key)) { psat(e.key); e.preventDefault(); }
    else if (e.key === "Backspace") { psat("smazat"); e.preventDefault(); }
    else if (e.key === "Enter") { odpovez(hra.vstup); e.preventDefault(); }
  });

  // opakování příkladu, se kterým byla potíž (na konci lekce, jiným typem úlohy)
  window.ULOHY_OPAKUJ = function (u) {
    var kopie = Object.assign({}, u);
    if (u.typ === "vyber") { kopie.typ = "napis"; delete kopie.moznosti; }
    return kopie;
  };

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  uvod();
})();
