/* Koňská matika – obrazovky a průběh hry. */
(function () {
  var G = window.GRAFIKA, CZ = window.CZ, U = window.ULOHY, S = window.ULOZISTE, Z = window.ZVUK, H = window.HLAS, NP = window.NAPOVEDA;
  var app = document.getElementById("app");
  var data = S.nacist();
  Z.nastavit(data.zvuk);

  var SVET = {
    laurinka: { nazev: "Ranč u hor", vychoziKun: { srst: "hnedak", hriva: "tmava", odznak: "hvezda" }, domov: "na ranč", rady: [8, 9] },
    julinka: { nazev: "Kvetoucí louka", vychoziKun: { srst: "belous", hriva: "svetla", odznak: "srdce" }, domov: "na louku", rady: [6, 7, 8, 9] }
  };
  var JMENA = ["Hvězdička", "Bobík", "Oříšek", "Měsíček", "Karamelka", "Blesk", "Skořice", "Pírko", "Sněženka", "Fazolka"];

  var hra = null;        // běžící lekce / výlet / závod
  var obrazovka = "";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(sel) { return app.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(app.querySelectorAll(sel)); }
  function ulozit() { S.ulozit(); }
  function profil(kdo) { var p = S.profil(kdo); if (!p.kamaradi) p.kamaradi = []; if (!p.nasazeno) p.nasazeno = {}; if (!p.navstiveno) p.navstiveno = []; return p; }
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
    if (hra && hra.casovac && nazev !== "zavod") { clearInterval(hra.casovac); hra.casovac = null; }
    fn();
    window.scrollTo(0, 0);
    var h = $("h1, h2, .zadani");
    if (h && h.focus) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }

  // doplňky z obchodu → kreslení koně
  function predmetyKone(p) {
    var v = {};
    Object.keys(p.nasazeno || {}).forEach(function (druh) {
      var vec = window.OBCHOD.filter(function (x) { return x.id === p.nasazeno[druh]; })[0];
      if (vec && vec.barva) v[druh] = vec.barva;
      if (vec && druh === "kartac") v.kartac = true;
    });
    return v;
  }
  function kunSvg(p) {
    var v = predmetyKone(p);
    return '<div class="kun-obal' + (v.kartac ? " leskne" : "") + '">' + G.kun(p.kun, v) + "</div>";
  }
  function kamaradi(p) {
    return (p.kamaradi || []).map(function (k) { return '<div class="kamarad ' + k + '" title="' + esc(window.KAMARADI[k].nazev) + '">' + G.kamarad(k) + "</div>"; }).join("");
  }

  /* ---------- úvod ---------- */
  function uvod() {
    nastavSvet("");
    hra = null;
    prepni("uvod", function () {
      var karty = ["laurinka", "julinka"].map(function (kdo) {
        var p = profil(kdo), k = p.kun || SVET[kdo].vychoziKun;
        return '<button class="karta-holka ' + kdo + '" data-akce="svet" data-kdo="' + kdo + '">' +
          '<div class="karta-kun' + (p.kun ? "" : " stin") + '">' + (p.kun ? kunSvg(p) : G.kun(k)) + "</div>" +
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
        "<h2>" + (uprava ? "Jak má koník vypadat?" : "Ahoj, " + CZ.osloveni(kdo) + "! Vyber si svého koníka.") + "</h2>" +
        '<div class="nahled">' + G.kun(navrh, predmetyKone(p)) + "</div>" +
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
        svet(kdo, uprava ? "To je krása! Moc se mi to líbí." : "Ahoj, " + CZ.osloveni(kdo) + "! Já jsem " + navrh.jmeno + ". Půjdeme spolu počítat?");
      };
    }
    prepni("tvorba", kresli);
  }

  /* ---------- svět holčičky ---------- */
  var POZDRAVY = [
    "Ahoj, {o}! Moc se těším, že jsi tu.", "Ahoj, {o}! Dáme si spolu pár příkladů?", "{o}, mám hlad na mrkve! Pomůžeš mi?",
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
        var faze = t.faze ? '<span class="faze" aria-label="fáze ' + U.FAZE[st.faze] + '">' + U.FAZE.map(function (f, i) { return '<i class="' + (i <= st.faze ? "ano" : "") + '"></i>'; }).join("") + "</span>"
          : window.ULOHY2.umi(t.druh) ? '<span class="faze" aria-label="úroveň ' + U.uroven(p, t) + '">' + [1, 2, 3, 4, 5].map(function (i) { return '<i class="' + (i <= U.uroven(p, t) ? "ano" : "") + '"></i>'; }).join("") + "</span>" : "";
        return '<button class="tema" data-akce="lekce" data-tema="' + t.id + '">' + G.ikona(t.ikona) +
          '<span class="tema-text"><b>' + esc(t.nazev) + "</b><small>" + (st.lekci ? CZ.pocet(st.lekci, "lekce") + (t.faze ? " · " + U.FAZE[st.faze] : "") : "zatím nezkoušeno") + "</small></span>" + faze + "</button>";
      }).join("") || '<p class="prazdne">Rodiče zatím nezapnuli žádné téma.</p>';
      var mista = window.MISTA.map(function (m) {
        var otevreno = p.podkovy >= m.podkovy, byla = p.navstiveno.indexOf(m.id) >= 0;
        return otevreno
          ? '<button class="misto otevreno" data-akce="vylet" data-misto="' + m.id + '">' + G.ikona(byla ? "hvezda" : "podkova", "mala") + esc(m.nazev) + (byla ? "<small>znovu</small>" : "<small>nové!</small>") + "</button>"
          : '<span class="misto zamceno">' + G.ikona("podkova", "mala") + esc(m.nazev) + "<small>za " + CZ.pocet(m.podkovy, "podkova") + "</small></span>";
      }).join("");
      var zavodOk = p.navstiveno.indexOf("drahu") >= 0;
      var pozdrav = vita || CZ.nahodny(POZDRAVY).replace(/\{o\}/g, CZ.osloveni(kdo));
      var staj = p.predmety.indexOf("staj") >= 0 ? '<div class="staj">' + G.staj(kdo) + "</div>" : "";
      app.innerHTML = lista(kdo) +
        '<main class="svet">' +
        '<h2 class="svet-nadpis">' + SVET[kdo].nazev + "</h2>" +
        '<div class="scena">' + '<div class="dvur">' + staj + '<div class="kun-velky' + (vita ? " skace" : "") + '">' + kunSvg(p) + "</div>" + kamaradi(p) + "</div>" + bublina(pozdrav) + "</div>" +
        '<section class="panel"><h3>Co dneska procvičíme?</h3><div class="temata">' + tlacitka + "</div></section>" +
        '<section class="panel"><h3>Výlety s koníkem</h3><div class="mista">' + mista + "</div>" +
        '<p class="tichy">Za každou lekci dostaneš podkovu. Podkovy ti zůstávají a otevírají nová místa.</p></section>' +
        '<section class="panel radek-panel"><button class="tl-velke sv" data-akce="obchod">' + G.ikona("mrkev", "mala") + " Obchod pro koníka</button>" +
        (zavodOk ? '<button class="tl-velke sv" data-akce="zavod">Závod s časem</button>' : "") + "</section>" +
        '<button class="tl-maly stred" data-akce="upravit-kone" data-kdo="' + kdo + '">Upravit koníka</button>' +
        "</main>";
      app.dataset.kdo = kdo;
    });
  }

  /* ---------- lekce, výlet a společný průběh úloh ---------- */
  var CHVALA = ["Výborně, to sedí!", "Krásně spočítané!", "Pěkně jsi přemýšlela!", "Přesně tak!", "Jupí, správně!", "Mňam, další mrkev!", "Paráda, jde ti to čím dál líp!"];
  var CHVALA_SNAHA = ["Poctivě jsi to spočítala!", "Vidíš, nevzdala ses – a máš to!", "Rada pomohla a zvládla jsi to sama.", "To bylo pěkné počítání krok za krokem!", "Chyby nevadí, z nich se učíme. Teď to sedí!"];
  var SKORO = ["Skoro! Zkusíme to spolu?", "Hmm, ještě jednou? Klidně si vezmi radu.", "Nevadí! Chyby jsou kamarádi, učíme se z nich."];

  function lekce(kdo, temaId) {
    var p = profil(kdo), tema = temata(kdo).filter(function (t) { return t.id === temaId; })[0];
    if (!tema) return svet(kdo);
    zacni({ kdo: kdo, tema: tema, ulohy: U.sestavLekci(p, tema), rezim: "lekce" });
  }

  function vylet(kdo, mistoId) {
    var p = profil(kdo), m = window.MISTA.filter(function (x) { return x.id === mistoId; })[0];
    if (!m) return svet(kdo);
    prepni("vylet-uvod", function () {
      app.innerHTML = lista(kdo) + '<main class="vylet"><h2 class="svet-nadpis">' + esc(m.nazev) + "</h2>" +
        '<div class="scena"><div class="dvur"><div class="kun-velky">' + kunSvg(p) + "</div>" + kamaradi(p) + "</div>" + bublina(m.uvod) + "</div>" +
        '<button class="tl-velke" data-akce="vylet-start" data-misto="' + m.id + '">Vyrazit!</button>' +
        '<button class="tl-maly stred" data-akce="svet">Zpět</button></main>';
    });
  }
  function vyletStart(kdo, mistoId) {
    var p = profil(kdo), m = window.MISTA.filter(function (x) { return x.id === mistoId; })[0];
    var ur = Math.min(5, 1 + Math.floor(p.lekci / 6) + (p.obtiznost === "tezsi" ? 1 : 0));
    var ulohy = [];
    for (var i = 0; i < 4; i++) ulohy.push(window.ULOHY2.slovni({ rady: SVET[kdo].rady }, ur, m.ulohy[i % m.ulohy.length]));
    var aktivni = temata(kdo).filter(function (t) { return t.aktivni && t.druh !== "slovni"; });
    if (aktivni.length) {
      var t = aktivni[Math.floor(Math.random() * aktivni.length)];
      U.sestavLekci(p, t).slice(0, 3).forEach(function (u) { if (u.typ !== "pexeso") ulohy.push(u); });
    }
    zacni({ kdo: kdo, tema: { id: "vylet-" + m.id, ikona: "jablko", nazev: m.nazev }, ulohy: U.zamichat(ulohy).slice(0, 7), rezim: "vylet", misto: m });
  }

  function zacni(o) {
    hra = Object.assign(o, { i: 0, napoprve: 0, serie: 0, ziskano: { mrkve: 0, jablka: 0, podkovy: 0 }, opakovat: [] });
    Z.cval();
    ukazUlohu();
  }

  function ukazUlohu() {
    var p = profil(hra.kdo), u = hra.ulohy[hra.i];
    hra.pokus = 0; hra.vstup = ""; hra.stupen = 0; hra.hotovo = false; hra.krok = 0; hra.otazka = false;
    prepni("lekce", function () {
      var postup = hra.ulohy.map(function (x, i) { return '<i class="' + (i < hra.i ? "hotovo" : i === hra.i ? "ted" : "") + '">' + G.ikona("podkova", "mala") + "</i>"; }).join("");
      app.innerHTML = lista(hra.kdo) +
        '<main class="lekce">' +
        '<div class="postup" aria-label="Příklad ' + (hra.i + 1) + " z " + hra.ulohy.length + '">' + postup + "</div>" +
        '<div class="karta-ulohy">' +
        '<div class="kun-maly">' + kunSvg(p) + "</div>" + bublina(uvodBubliny(u)) +
        zadaniHtml(u) +
        (H.podporovano() ? '<button class="tl-kulate predcist" data-akce="predcist" aria-label="Přečíst nahlas"><svg viewBox="0 0 24 24"><path d="M4 9 H8 L13 5 V19 L8 15 H4z" fill="currentColor"/><path d="M16 9 C 17.5 10.5, 17.5 13.5, 16 15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>' : "") +
        "</div>" + '<div id="odpoved">' + odpovedHtml(u) + "</div>" +
        '<div class="napoveda" id="napoveda" hidden></div>' +
        (u.typ === "pexeso" ? "" : '<button class="tl-maly stred poradit" data-akce="poradit">' + G.ikona("hvezda", "mala") + " Poraď mi</button>") +
        "</main>";
      if (u.typ === "pretahni") window.HRY.pretahni($("#odpoved .hra"), u, function (t) { nastavBublinu(t, "premysli"); }, poPretazeni);
      if (u.typ === "pexeso") window.HRY.pexeso($("#odpoved .hra"), u, priPari, function () { spravne(null); });
      if (p.predcitani) H.rekni(u.mluva || u.zadani);
    });
  }

  function zadaniHtml(u) {
    if (u.sloupec) {
      var a = String(u.sloupec.a), b = String(u.sloupec.b), w = Math.max(a.length, b.length) + 1;
      function r(t, z) { t = Array(w - t.length + 1).join(" ") + t; return '<div class="sl-radek">' + t.split("").map(function (ch, i) { return "<span>" + (i === 0 && z ? z : ch === " " ? "" : ch) + "</span>"; }).join("") + "</div>"; }
      return '<div class="zadani sloupec" aria-label="' + esc(u.mluva) + '">' + r(a, "") + r(b, u.sloupec.op) + '<div class="sl-cara"></div><div class="sl-radek vysl" id="sl-vysl"></div></div>';
    }
    if (u.osa) return '<p class="zadani-text">' + esc(u.zadani) + "</p>" + NP.obrOsa(u.osa.od, u.osa.krok, u.osa.dilky, u.osa.hodnota, function (k) { return k === 0 || k === 10; });
    if (u.typ === "pretahni" || u.typ === "pexeso" || u.text) return '<p class="zadani-text" aria-label="' + esc(u.mluva || u.text) + '">' + esc(u.text || u.zadani) + "</p>" + (u.slovni ? obrazekSlovni(u) : "");
    return '<p class="zadani' + (u.textove ? " mensi" : "") + '" aria-label="' + esc(u.mluva) + '">' + esc(u.zadani) + "</p>";
  }
  function obrazekSlovni(u) {
    var n = Math.min(u.np && u.np.b ? u.np.b : 3, 8), s = "";
    for (var i = 0; i < n; i++) s += G.ikona(u.ikona || "kun", "mala");
    return '<div class="slovni-obr" aria-hidden="true">' + s + "</div>";
  }
  function odpovedHtml(u) {
    if (u.typ === "vyber") {
      return '<div class="moznosti' + (u.znaky ? " znaky" : "") + (u.moznosti.length === 3 ? " tri" : "") + '">' + u.moznosti.map(function (m, i) {
        return '<button class="moznost" data-hodnota="' + esc(m) + '"><small>' + (i + 1) + "</small>" + (typeof m === "number" ? CZ.cislo(m) : esc(m)) + "</button>";
      }).join("") + "</div>";
    }
    if (u.typ === "pretahni" || u.typ === "pexeso") return '<div class="hra"></div>';
    var otazka = u.typ === "zbytek" ? '<p class="otazka" id="otazka">' + esc(u.kroky[0].otazka) + "</p>" : "";
    return otazka + '<div class="displej" aria-live="polite"><span id="vstup"></span><i class="kurzor"></i></div>' + klavesnice();
  }

  function uvodBubliny(u) {
    if (u.typ === "pretahni") return "Klepni na žlab, nebo do něj přetáhni věci z hromádky.";
    if (u.typ === "pexeso") return "Pexeso! Otáčej kartičky a hledej dvojice.";
    if (u.typ === "zbytek") return "Rozdělíme to spravedlivě. Co zbude, dostane hříbě.";
    if (u.slovni) return "Přečti si to v klidu. Co se tu děje?";
    if (hra.i === 0) return "Jdeme na to! " + (u.typ === "vyber" ? "Klepni na správnou odpověď." : "Napiš výsledek.");
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

  /* „Poraď mi“: každé klepnutí odkryje další stupeň (rada → obrázek → ukázka). */
  function dalsiRada(automaticky) {
    var u = hra.ulohy[hra.i], n = $("#napoveda");
    if (!n || hra.stupen >= 3 || u.typ === "pexeso") return;
    var stupne = NP.stupne(u, hra.tema.ikona);
    hra.stupen++;
    var s = stupne[hra.stupen - 1];
    n.insertAdjacentHTML("beforeend", '<div class="np-stupen s' + hra.stupen + '"><h4>' + G.ikona(["hvezda", "jablko", "podkova"][hra.stupen - 1], "mala") + " " + s.nazev + "</h4>" + s.html + "</div>");
    NP.aktivuj(n.lastElementChild, profil(hra.kdo).predcitani ? H.rekni : null);
    n.hidden = false;
    var tl = $('[data-akce="poradit"]');
    if (tl) {
      if (hra.stupen >= 3) tl.hidden = true;
      else tl.innerHTML = G.ikona("hvezda", "mala") + (hra.stupen === 1 ? " Ukaž mi obrázek" : " Ukaž mi podobný příklad");
    }
    if (!automaticky) nastavBublinu(["Tady máš malou radu. Zkus to sama.", "Klepej na obrázek a počítej se mnou.", "Podívej, jak to jde. Poslední krok je na tobě!"][hra.stupen - 1], "premysli");
    setTimeout(function () { n.lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 60);
  }

  function psat(znak) {
    if (hra.hotovo) return;
    if (znak === "smazat") hra.vstup = hra.vstup.slice(0, -1);
    else if (hra.vstup.length < 6) hra.vstup += znak;
    Z.klik();
    var v = $("#vstup");
    if (v) v.textContent = CZ.cislo(hra.vstup);
    var sl = $("#sl-vysl");
    if (sl) sl.textContent = hra.vstup;
  }

  function aktualniVysledek(u) {
    if (u.typ === "zbytek") return u.kroky[hra.krok].vysledek;
    return u.vysledek;
  }

  function odpovez(hodnota, tlacitko) {
    if (!hra || hra.hotovo) return;
    var u = hra.ulohy[hra.i];
    if (u.typ === "pexeso" || (u.typ === "pretahni" && !hra.otazka)) return;
    if (hodnota === "" || hodnota == null) return;
    var spravna = aktualniVysledek(u);
    if (String(hodnota) === String(spravna)) {
      if (u.typ === "zbytek" && hra.krok === 0) {
        hra.krok = 1; hra.vstup = ""; Z.spravne();
        $("#vstup").textContent = ""; $("#otazka").textContent = u.kroky[1].otazka;
        nastavBublinu("Ano! Každý dostane " + spravna + ". A kolik zbude?", "radost");
        return;
      }
      return spravne(tlacitko);
    }
    // chyba = žádný trest, jen pomoc
    hra.pokus++;
    hra.serie = 0;
    Z.zkusZnovu();
    if (tlacitko) { tlacitko.classList.add("vedle"); tlacitko.disabled = true; }
    hra.vstup = ""; var v = $("#vstup"); if (v) v.textContent = ""; var sl = $("#sl-vysl"); if (sl) sl.textContent = "";
    var rozbor = u.typ === "zbytek" && hra.krok === 1 && Number(hodnota) >= u.np.a ? "Zbytek musí být menší než " + u.np.a + " – jinak by každý dostal ještě jedno." : NP.chyba(u, hodnota);
    if (hra.pokus <= 3) {
      while (hra.stupen < hra.pokus && hra.stupen < 3) dalsiRada(true);
      nastavBublinu(rozbor || CZ.nahodny(SKORO), "premysli");
    } else {
      // ať holčička nikdy nezůstane trčet: spočítáme to spolu
      nastavBublinu("Spočítáme to spolu: je to " + spravna + ". " + (u.typ === "vyber" ? "Klepni na to." : "Napiš to a jedeme dál!"), "premysli");
      $$(".moznost").forEach(function (b) { if (String(b.dataset.hodnota) === String(spravna)) b.classList.add("ukazat"); });
    }
  }

  function poPretazeni() {
    var u = hra.ulohy[hra.i];
    hra.otazka = true;
    Z.odmena();
    nastavBublinu("Hotovo! " + u.otazka, "radost");
    $("#odpoved").insertAdjacentHTML("beforeend", '<p class="otazka">' + esc(u.otazka) + '</p><div class="displej" aria-live="polite"><span id="vstup"></span><i class="kurzor"></i></div>' + klavesnice());
    setTimeout(function () { var d = $(".displej"); if (d) d.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 60);
  }

  function priPari(par, prvni) {
    var p = profil(hra.kdo);
    U.zapis(p, { fakt: { klic: "n" + par.fakt.a + "x" + par.fakt.b } }, prvni);
    pridej(p, "mrkve", 1);
    ulozit(); Z.spravne(); letiMrkev(); obnovPocitadla();
    nastavBublinu(CZ.nahodny(["Dvojice!", "Našla jsi to!", "Hezky!", "Přesně!"]), "radost");
  }

  function spravne(tlacitko) {
    var u = hra.ulohy[hra.i], p = profil(hra.kdo);
    hra.hotovo = true;
    var prvni = hra.pokus === 0 && hra.stupen === 0;
    if (u.typ !== "pexeso") U.zapis(p, u, prvni);
    if (prvni) { hra.napoprve++; hra.serie++; } else hra.serie = 0;
    if (u.typ !== "pexeso") pridej(p, "mrkve", 1);
    var bonus = "";
    if (hra.serie > 0 && hra.serie % 3 === 0) { pridej(p, "jablka", 1); bonus = " A k tomu jablko za tři správně za sebou!"; }
    ulozit();
    Z.spravne();
    if (tlacitko) tlacitko.classList.add("spravne");
    var d = $(".displej"); if (d) d.classList.add("spravne");
    nastavBublinu((u.typ === "pexeso" ? "Celé pexeso je hotové!" : CZ.nahodny(prvni ? CHVALA : CHVALA_SNAHA)) + bonus, "radost");
    var kun = $(".kun-maly"); if (kun) { kun.classList.remove("skace"); void kun.offsetWidth; kun.classList.add("skace"); }
    letiMrkev();
    obnovPocitadla();
    if (!prvni && u.fakt && hra.opakovat.indexOf(u.fakt.klic) < 0 && hra.ulohy.length < 10 && u.fakt.druh !== "jiny" && hra.rezim === "lekce") {
      hra.opakovat.push(u.fakt.klic);
      hra.ulohy.push(opakuj(u));
    }
    setTimeout(dalsi, bonus ? 1800 : 1200);
  }

  // opakování příkladu, se kterým byla potíž (na konci lekce, jiným typem úlohy)
  function opakuj(u) {
    var f = u.fakt, c = f.a * f.b, k = { fakt: f, tema: u.tema, finta9: u.finta9, typ: "napis" };
    if (f.druh === "del") { k.zadani = c + " : " + f.a + " = ?"; k.vysledek = f.b; k.mluva = "Kolik je " + c + " děleno " + f.a + "?"; }
    else { k.zadani = f.a + " × " + f.b + " = ?"; k.vysledek = c; k.mluva = "Kolik je " + f.a + " krát " + f.b + "?"; }
    return k;
  }

  function pridej(p, co, n) { p[co] += n; if (hra) hra.ziskano[co] += n; }

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
    var p = profil(hra.kdo), tema = hra.tema, celkem = hra.ulohy.length, posun = false, pribeh = "", novyKamarad = null;
    var predtim = p.podkovy;
    pridej(p, "podkovy", 1);
    if (hra.rezim === "lekce") {
      posun = U.konecLekce(p, tema, hra.napoprve, celkem);
    } else {
      p.lekci++;
      var m = hra.misto;
      pribeh = m.konec;
      if (p.navstiveno.indexOf(m.id) < 0) p.navstiveno.push(m.id);
      if (m.kamarad && p.kamaradi.indexOf(m.kamarad) < 0) { p.kamaradi.push(m.kamarad); novyKamarad = m.kamarad; }
    }
    var noveMisto = window.MISTA.filter(function (m) { return predtim < m.podkovy && p.podkovy >= m.podkovy; })[0];
    p.historie.push({ den: new Date().toISOString().slice(0, 10), tema: tema.id, napoprve: hra.napoprve, celkem: celkem });
    if (p.historie.length > 300) p.historie = p.historie.slice(-300);
    ulozit();
    Z.hotovo();
    var st = p.tema[tema.id];
    prepni("oslava", function () {
      var konfety = "";
      for (var i = 0; i < 16; i++) konfety += '<span class="konfeta" style="left:' + (5 + i * 6) + "%;animation-delay:" + (i % 5) * 120 + 'ms">' + G.ikona(["mrkev", "jablko", "podkova", "hvezda"][i % 4], "mala") + "</span>";
      app.innerHTML = lista(hra.kdo) +
        '<main class="oslava">' + konfety +
        "<h2>" + (hra.rezim === "vylet" ? "Výlet se povedl!" : "Hurá! Lekce je hotová.") + "</h2>" +
        '<div class="dvur"><div class="kun-velky skace">' + kunSvg(p) + "</div>" + kamaradi(p) + "</div>" +
        bublina((pribeh ? pribeh + " " : "Děkuju, " + CZ.osloveni(hra.kdo) + "! ") + "Získala jsi " + vycet(hra.ziskano) + ".", "radost") +
        (posun === true ? '<p class="postup-text">Postupuješ! Teď to zkusíme ' + U.FAZE[st.faze] + ".</p>" : "") +
        (posun === "uroven" ? '<p class="postup-text">Jde ti to skvěle! Příště přidám o kousek těžší příklady.</p>' : "") +
        (novyKamarad ? '<p class="postup-text">Máš nového kamaráda: ' + esc(window.KAMARADI[novyKamarad].nazev) + "!</p>" : "") +
        (noveMisto ? '<p class="postup-text">Za podkovy se otevřelo nové místo: ' + esc(noveMisto.nazev) + "!</p>" : "") +
        '<div class="tlacitka">' + (hra.rezim === "lekce" ? '<button class="tl-velke" data-akce="lekce" data-tema="' + tema.id + '">Ještě jednu</button>' : "") +
        '<button class="tl-velke sv" data-akce="svet" data-kdo="' + hra.kdo + '">Zpět ' + SVET[hra.kdo].domov + "</button></div>" +
        "</main>";
      app.dataset.kdo = hra.kdo;
    });
  }

  /* ---------- obchod pro koníka ---------- */
  function obchod(kdo, zprava) {
    var p = profil(kdo);
    nastavSvet(kdo);
    prepni("obchod", function () {
      var karty = window.OBCHOD.map(function (v) {
        var ma = p.predmety.indexOf(v.id) >= 0, na = p.nasazeno[v.druh] === v.id;
        var cena = CZ.pocet(v.mrkve || 0, "mrkev") + (v.jablka ? " a " + CZ.pocet(v.jablka, "jablko") : "");
        var staci = p.mrkve >= (v.mrkve || 0) && p.jablka >= (v.jablka || 0);
        var nahled = v.druh === "staj" ? G.staj(kdo) : v.druh === "kartac" ? G.ikona("hvezda") : '<span class="vzorek velky" style="background:' + v.barva + '"></span>';
        var tl = !ma ? '<button class="tl-maly" data-akce="koupit" data-vec="' + v.id + '"' + (staci ? "" : " disabled") + ">" + (staci ? "Koupit" : "Ještě chybí") + "</button>"
          : v.druh === "staj" ? '<span class="tichy">Stojí na dvoře</span>'
          : '<button class="tl-maly" data-akce="nasadit" data-vec="' + v.id + '">' + (na ? "Sundat" : "Dát koníkovi") + "</button>";
        return '<div class="zbozi' + (na ? " nasazeno" : "") + '"><div class="zbozi-nahled">' + nahled + "</div><b>" + esc(v.nazev) + "</b><small>" + (ma ? "máš" : cena) + "</small>" + tl + "</div>";
      }).join("");
      app.innerHTML = lista(kdo) + '<main class="obchod"><h2 class="svet-nadpis">Obchod pro koníka</h2>' +
        '<div class="scena"><div class="kun-velky">' + kunSvg(p) + "</div>" + bublina(zprava || "Za mrkve a jablka mi můžeš něco koupit. Co se ti líbí?") + "</div>" +
        '<div class="zbozi-mrizka">' + karty + "</div>" +
        '<button class="tl-velke sv" data-akce="svet">Zpět ' + SVET[kdo].domov + "</button></main>";
      app.dataset.kdo = kdo;
    });
  }

  /* ---------- závod s časem (jen dobrovolně, bez trestů) ---------- */
  function zavod(kdo) {
    var p = profil(kdo);
    var nas = temata(kdo).filter(function (t) { return t.aktivni && (t.druh === "nasobeni" || t.druh === "nasobilka" || t.druh === "deleni"); });
    if (!nas.length) nas = [{ id: "z", druh: "nasobilka", rady: SVET[kdo].rady, od: 1, do: 10, ikona: "mrkev" }];
    hra = { kdo: kdo, rezim: "zavod", tema: { id: "zavod", ikona: "mrkev" }, spravne: 0, ziskano: { mrkve: 0, jablka: 0, podkovy: 0 }, konec: Date.now() + window.LEKCE.zavodSekund * 1000 };
    function novy() {
      var t = nas[Math.floor(Math.random() * nas.length)];
      var f = U.faktyTematu(t); f = f[Math.floor(Math.random() * f.length)];
      var c = f.a * f.b, u = f.druh === "del" ? { zadani: c + " : " + f.a, vysledek: f.b } : { zadani: f.a + " × " + f.b, vysledek: c };
      var o = [u.vysledek], kand = U.zamichat([u.vysledek + 1, u.vysledek - 1, u.vysledek + f.a, u.vysledek - f.a, u.vysledek + 10, u.vysledek + 2]);
      kand.forEach(function (x) { if (x > 0 && o.indexOf(x) < 0 && o.length < 4) o.push(x); });
      u.moznosti = U.zamichat(o);
      hra.zavodUloha = u;
      $("#zavod-zadani").textContent = u.zadani + " = ?";
      $("#zavod-moznosti").innerHTML = u.moznosti.map(function (m, i) { return '<button class="moznost" data-zavod="' + m + '"><small>' + (i + 1) + "</small>" + m + "</button>"; }).join("");
    }
    prepni("zavod", function () {
      app.innerHTML = lista(kdo) + '<main class="zavod"><h2 class="svet-nadpis">Závod s časem</h2>' +
        '<div class="draha"><div class="draha-kun" id="draha-kun">' + kunSvg(p) + '</div><div class="draha-cil">cíl</div></div>' +
        '<p class="zavod-cas"><b id="zavod-cas">' + window.LEKCE.zavodSekund + "</b> s · spočítáno <b id=\"zavod-pocet\">0</b></p>" +
        '<div class="karta-ulohy jen-zadani"><p class="zadani" id="zavod-zadani"></p></div><div class="moznosti" id="zavod-moznosti"></div>' +
        '<button class="tl-maly stred" data-akce="svet">Ukončit závod</button></main>';
      app.dataset.kdo = kdo;
      novy();
    });
    hra.novy = novy;
    hra.casovac = setInterval(function () {
      var zbyva = Math.max(0, Math.ceil((hra.konec - Date.now()) / 1000));
      var el = $("#zavod-cas"); if (el) el.textContent = zbyva;
      if (zbyva <= 0) { clearInterval(hra.casovac); hra.casovac = null; konecZavodu(); }
    }, 250);
    Z.cval();
  }
  function odpovezZavod(hodnota, b) {
    if (!hra || hra.rezim !== "zavod" || !hra.zavodUloha) return;
    var p = profil(hra.kdo);
    if (Number(hodnota) === hra.zavodUloha.vysledek) {
      hra.spravne++; pridej(p, "mrkve", 1); Z.spravne();
      $("#zavod-pocet").textContent = hra.spravne;
      var kun = $("#draha-kun"); if (kun) kun.style.left = Math.min(82, hra.spravne * 4) + "%";
      obnovPocitadla();
      hra.novy();
    } else { Z.zkusZnovu(); b.classList.add("vedle"); b.disabled = true; }
  }
  function konecZavodu() {
    var p = profil(hra.kdo), rekord = p.rekordZavod || 0, novy = hra.spravne > rekord;
    if (novy) p.rekordZavod = hra.spravne;
    ulozit(); Z.hotovo();
    var kdo = hra.kdo;
    prepni("oslava", function () {
      app.innerHTML = lista(kdo) + '<main class="oslava"><h2>Cíl!</h2><div class="kun-velky skace">' + kunSvg(p) + "</div>" +
        bublina("Spočítala jsi " + CZ.pocet(hra.spravne, "priklad") + " a dostala " + CZ.pocet(hra.spravne, "mrkev") + "." + (novy && rekord ? " To je tvůj nový rekord!" : rekord ? " Tvůj rekord je " + rekord + "." : ""), "radost") +
        '<div class="tlacitka"><button class="tl-velke" data-akce="zavod">Ještě jednou</button><button class="tl-velke sv" data-akce="svet">Zpět ' + SVET[kdo].domov + "</button></div></main>";
      app.dataset.kdo = kdo;
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
    hra = null;
    var p = profil(kdo);
    prepni("rodice", function () {
      var tez = U.nejtezsi(p, 8);
      var tem = temata(kdo).map(function (t) {
        var st = p.tema[t.id] || {}, info = st.lekci ? " <small>" + CZ.pocet(st.lekci, "lekce") + (t.faze ? ", " + U.FAZE[st.faze || 0] : window.ULOHY2.umi(t.druh) ? ", úroveň " + U.uroven(p, t) : "") + "</small>" : "";
        return '<label class="prepinac"><input type="checkbox" data-tema-prep="' + t.id + '"' + (t.aktivni ? " checked" : "") + '><span></span>' + esc(t.nazev) + info + "</label>";
      }).join("");
      var dny = {};
      p.historie.forEach(function (h) { dny[h.den] = (dny[h.den] || 0) + 1; });
      var tyden = [];
      for (var i = 6; i >= 0; i--) { var d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10); tyden.push('<span class="den"><i style="height:' + Math.min(100, (dny[d] || 0) * 25) + '%"></i><small>' + ["ne", "po", "út", "st", "čt", "pá", "so"][new Date(d).getDay()] + "</small></span>"); }
      app.innerHTML =
        '<main class="rodice">' +
        '<header class="lista"><button class="tl-kulate" data-akce="domu" aria-label="Domů">' + domek() + '</button><span class="lista-nadpis">Pro rodiče</span><span></span></header>' +
        '<div class="zalozky">' + ["laurinka", "julinka"].map(function (x) { return '<button data-akce="rodice-kdo" data-kdo="' + x + '" aria-pressed="' + (x === kdo) + '">' + jmeno(x) + "</button>"; }).join("") + "</div>" +
        '<section class="panel"><h3>Přehled</h3><p>' + CZ.pocet(p.lekci, "lekce") + " hotovo · " + CZ.pocet(p.mrkve, "mrkev") + " · " + CZ.pocet(p.jablka, "jablko") + " · " + CZ.pocet(p.podkovy, "podkova1") + "</p>" +
        '<h4>Lekce za posledních 7 dní</h4><div class="tyden">' + tyden.join("") + "</div>" +
        (tez.length ? "<h4>Co dělá největší potíže</h4><ul class=\"tezke\">" + tez.map(function (x) { return "<li><b>" + esc(x.text) + "</b> <small>chyb " + x.spatne + ", správně " + x.spravne + "</small></li>"; }).join("") + "</ul>" : '<p class="tichy">Zatím žádné potíže – nebo se ještě nehrálo.</p>') +
        "</section>" +
        '<section class="panel"><h3>Témata</h3>' + tem + "</section>" +
        '<section class="panel"><h3>Nastavení</h3>' +
        '<label class="pole">Obtížnost na začátku nových témat <select data-nast="obtiznost"><option value="lehci"' + (p.obtiznost === "lehci" ? " selected" : "") + '>lehčí</option><option value="normal"' + (!p.obtiznost || p.obtiznost === "normal" ? " selected" : "") + '>normální</option><option value="tezsi"' + (p.obtiznost === "tezsi" ? " selected" : "") + ">těžší</option></select></label>" +
        '<label class="pole">Příkladů v lekci <select data-nast="delkaLekce">' + [8, 9, 10].map(function (x) { return '<option value="' + x + '"' + ((p.delkaLekce || window.LEKCE.pocetUloh) === x ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></label>" +
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
          var k = c.dataset.nast;
          if (k === "zvuk") { data.zvuk = c.checked; Z.nastavit(c.checked); }
          else if (k === "predcitani") { p.predcitani = c.checked; if (c.checked) H.rekni("Předčítání je zapnuté."); }
          else if (k === "obtiznost") p.obtiznost = c.value;
          else if (k === "delkaLekce") p.delkaLekce = Number(c.value);
          ulozit();
        };
      });
    });
  }

  /* ---------- ovládání ---------- */
  app.addEventListener("click", function (e) {
    var t = e.target.closest("[data-akce], [data-klav], .moznost");
    if (!t) return;
    if (t.dataset.zavod !== undefined) return odpovezZavod(t.dataset.zavod, t);
    if (t.classList.contains("moznost")) return odpovez(t.dataset.hodnota, t);
    if (t.dataset.klav) {
      if (t.dataset.klav === "ok") return odpovez(hra && hra.vstup);
      return psat(t.dataset.klav);
    }
    var kdo = t.dataset.kdo || app.dataset.kdo;
    switch (t.dataset.akce) {
      case "domu": Z.klik(); return uvod();
      case "svet": Z.klik(); return svet(kdo);
      case "lekce": return lekce(kdo, t.dataset.tema);
      case "vylet": Z.klik(); return vylet(kdo, t.dataset.misto);
      case "vylet-start": return vyletStart(kdo, t.dataset.misto);
      case "obchod": Z.klik(); return obchod(kdo);
      case "zavod": return zavod(kdo);
      case "koupit": {
        var p = profil(kdo), v = window.OBCHOD.filter(function (x) { return x.id === t.dataset.vec; })[0];
        if (!v || p.mrkve < (v.mrkve || 0) || p.jablka < (v.jablka || 0)) return;
        p.mrkve -= v.mrkve || 0; p.jablka -= v.jablka || 0; p.predmety.push(v.id);
        if (v.druh !== "staj") p.nasazeno[v.druh] = v.id;
        ulozit(); Z.odmena();
        return obchod(kdo, v.druh === "staj" ? "Nová stáj! Hned se tam nastěhuju." : "Děkuju! Moc mi to sluší.");
      }
      case "nasadit": {
        var p2 = profil(kdo), v2 = window.OBCHOD.filter(function (x) { return x.id === t.dataset.vec; })[0];
        if (p2.nasazeno[v2.druh] === v2.id) delete p2.nasazeno[v2.druh]; else p2.nasazeno[v2.druh] = v2.id;
        ulozit(); Z.klik();
        return obchod(kdo);
      }
      case "upravit-kone": Z.klik(); return tvorbaKone(kdo, true);
      case "rodice": return brana();
      case "rodice-kdo": return rodice(kdo);
      case "poradit": Z.klik(); if (hra) dalsiRada(false); return;
      case "predcist": if (hra && hra.ulohy) { var u = hra.ulohy[hra.i]; H.rekni(u.mluva || u.text || u.zadani); } return;
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
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (obrazovka === "zavod" && hra) {
      var nz = Number(e.key);
      if (nz >= 1 && nz <= 4) { var bz = $$("#zavod-moznosti .moznost")[nz - 1]; if (bz && !bz.disabled) { odpovezZavod(bz.dataset.zavod, bz); e.preventDefault(); } }
      return;
    }
    if (obrazovka !== "lekce" || !hra) return;
    var u = hra.ulohy[hra.i];
    if (u.typ === "vyber") {
      var n = Number(e.key);
      if (n >= 1 && n <= u.moznosti.length) { var b = $$(".moznost")[n - 1]; if (b && !b.disabled) { odpovez(b.dataset.hodnota, b); e.preventDefault(); } }
      return;
    }
    if (u.typ === "pexeso" || (u.typ === "pretahni" && !hra.otazka)) return;
    if (/^[0-9]$/.test(e.key)) { psat(e.key); e.preventDefault(); }
    else if (e.key === "Backspace") { psat("smazat"); e.preventDefault(); }
    else if (e.key === "Enter") { odpovez(hra.vstup); e.preventDefault(); }
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  // jen pro automatické testy (adresa s ?test)
  if (/[?&]test\b/.test(location.search)) window.__hra = function () { return hra; };

  uvod();
})();
