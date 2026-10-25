/* „Poraď mi“ – stupňovaná nápověda podle zásad, jak se děti učí nejlépe:
 *  1. Malá rada – otázka nebo opěrný bod, ne výsledek (dítě přemýšlí samo).
 *  2. Obrázek – úloha rozložená na skupinky; dítě klepe a počítá s koníkem (aktivně, ne jen kouká).
 *  3. Ukázka – podobný příklad vyřešený skoro celý, poslední krok dopočítá dítě (neúplný vyřešený příklad).
 * Výsledek se nikdy nevyzradí přímo. K tomu rozbor chyby: koník pozná typický omyl a řekne, co s ním. */
(function () {
  var G = window.GRAFIKA, CZ = window.CZ;
  var PREDMET = { mrkev: "mrkev", jablko: "jablko", podkova: "podkova", seno: "seno", hvezda: "hvezda", kun: "mrkev" };
  var NAZVY = { mrkev: "mrkev", jablko: "jablko", podkova: "podkova", seno: "seno", hvezda: "hvezda" };
  function ik(n, i) { var s = ""; for (var k = 0; k < n; k++) s += G.ikona(i, "mala"); return s; }
  function c(x) { return CZ.cislo(x); }

  /* ---------- obrázky (stupeň 2) ---------- */
  // a × b: b řad po a – klepnutím na řadu ji koník „napočítá“
  function obrNasobeni(a, b, ikona) {
    var r = "";
    for (var i = 0; i < b; i++) r += '<button class="np-rada" data-rada="' + i + '" aria-label="' + (i + 1) + '. řada"><span class="np-cislo">' + (i + 1) + '.</span>' + ik(a, ikona) + '<b class="np-mezisoucet"></b></button>';
    return '<p class="np-text">' + CZ.pocet(b, "radek") + " " + CZ.po(a, ikona) + '. <b>Klepej na řady</b> a počítej s koníkem po ' + a + ".</p>" +
      '<div class="np-skupiny" data-po="' + a + '" data-rad="' + b + '">' + r + '</div><p class="np-stav" aria-live="polite">Zatím máme 0.</p>';
  }
  // c věcí rozdělit mezi a koní – klepnutím dostane každý kůň jednu (rozdávání po kolech)
  function obrDeleni(a, b, r, ikona) {
    var c0 = a * b + (r || 0), k = "";
    for (var i = 0; i < a; i++) k += '<div class="np-hromadka">' + G.ikona("kun", "kunik") + '<div class="np-dily"></div></div>';
    if (r) k += '<div class="np-hromadka hribe">' + G.ikona("kun", "kunik mensi") + '<small>hříbě</small><div class="np-dily"></div></div>';
    return '<p class="np-text">Máme ' + CZ.pocet(c0, ikona === "mrkev" ? "mrkev" : ikona === "podkova" ? "podkova" : "jablko") + " a " + CZ.pocet(a, "kone4") + ". <b>Klepni na hromádku</b> a každý kůň dostane jedno.</p>" +
      '<div class="np-rozdavani" data-zbyva="' + c0 + '" data-koni="' + a + '" data-ikona="' + ikona + '" data-hribe="' + (r ? 1 : 0) + '">' +
      '<button class="np-hromada" aria-label="Rozdat jedno kolo">' + ik(Math.min(c0, 30), ikona) + (c0 > 30 ? "<b>…</b>" : "") + '<span class="np-zbyva">zbývá ' + c0 + "</span></button>" +
      '<div class="np-rozdeleni">' + k + '</div></div><p class="np-stav" aria-live="polite">Rozdáno 0 kol.</p>';
  }
  function obrPlusMinus(a, b, plus) {
    function hromada(x) {
      var s = Math.floor(x / 100), d = Math.floor((x % 100) / 10), j = x % 10;
      return '<div class="np-mista">' + (s ? '<span title="stovky">' + ik(s, "seno") + "</span>" : "") + (d ? '<span title="desítky">' + ik(d, "pytel") + "</span>" : "") + (j ? '<span title="jednotky">' + ik(j, "mrkev") + "</span>" : "") + "</div>";
    }
    return '<p class="np-text">Balík sena = sto, pytel = deset, mrkev = jedna.</p>' +
      '<div class="np-pm"><div><b>' + c(a) + "</b>" + hromada(a) + '</div><div class="np-op">' + (plus ? "+" : "−") + "</div><div><b>" + c(b) + "</b>" + hromada(b) + "</div></div>" +
      '<p class="np-text">' + (plus ? "Sečti nejdřív stejné věci: mrkve k mrkvím, pytle k pytlům. Když je mrkví 10 a víc, deset jich svaž do pytle." : "Ubírej nejdřív mrkve. Když jich je málo, rozvaž jeden pytel na 10 mrkví.") + "</p>";
  }
  function obrOsa(od, krok, dilky, hodnota, popisky) {
    var w = 300, s = '<svg class="np-osa" viewBox="0 0 320 70" aria-hidden="true"><line x1="10" y1="40" x2="310" y2="40" stroke="#6b4fa0" stroke-width="3"/>';
    for (var i = 0; i <= dilky; i++) {
      var x = 10 + i * w / dilky, v = od + i * krok;
      s += '<line x1="' + x + '" y1="32" x2="' + x + '" y2="48" stroke="#6b4fa0" stroke-width="' + (i % 5 ? 2 : 3) + '"/>';
      if (popisky(i)) s += '<text x="' + x + '" y="66" font-size="11" text-anchor="middle" fill="#2d2433">' + c(v) + "</text>";
    }
    if (hodnota != null) { var hx = 10 + (hodnota - od) / krok * w / dilky; s += '<g transform="translate(' + (hx - 12) + ' 2)"><svg width="24" height="24" viewBox="0 0 40 40">' + G.ikona("kun").replace(/<svg[^>]*>|<\/svg>/g, "") + '</svg></g><line x1="' + hx + '" y1="26" x2="' + hx + '" y2="40" stroke="#d9685a" stroke-width="2"/>'; }
    return s + "</svg>";
  }
  function obrSloupec(a, b, op) {
    var sa = String(a), sb = String(b), w = Math.max(sa.length, sb.length) + 1;
    function radek(t, znak) { var s = ""; t = Array(w - t.length + 1).join(" ") + t; for (var i = 0; i < w; i++) s += '<span class="m' + (w - i) + '">' + (i === 0 && znak ? znak : t[i] === " " ? "" : t[i]) + "</span>"; return '<div class="sl-radek">' + s + "</div>"; }
    return '<div class="sloupec np">' + '<div class="sl-radek hlava"><span></span>' + ["T", "S", "D", "J"].slice(4 - (w - 1)).map(function (x) { return "<span>" + x + "</span>"; }).join("") + "</div>" + radek(sa, "") + radek(sb, op) + '<div class="sl-cara"></div>' + radek("?", "") + "</div>";
  }

  /* ---------- stupně podle druhu úlohy ---------- */
  function stupne(u, ikonaTematu) {
    var i = PREDMET[ikonaTematu] || "mrkev", f = u.fakt || {}, np = u.np || {}, a = np.a != null ? np.a : f.a, b = np.b != null ? np.b : f.b;
    var druh = np.druh || (f.druh === "del" ? "deleni" : u.typ === "chybi" ? "chybi" : "nasobeni");
    if (u.typ === "chybi") druh = "chybi";
    var S;
    if (druh === "nasobeni") {
      var rada = a === 9 && u.finta9 ? "Koňská finta: 9 × " + b + " je skoro 10 × " + b + " = " + 10 * b + ". Uber jednu devítku." :
        b === 10 ? "Násobit deseti je snadné: k číslu " + a + " přidej nulu." :
        b === 1 ? "Kolikrát? Jen jednou! Jedna řada po " + a + "." :
        b > 5 ? "Znáš " + a + " × 5 = " + a * 5 + "? Přidej ještě " + CZ.pocet(b - 5, "radek") + " po " + a + "." :
        b === 5 ? "Pět je polovina z deseti: " + a + " × 10 = " + a * 10 + ". Kolik je polovina?" :
        "Kolik je " + a + " × " + (b - 1) + "? Přidej ještě jednu " + CZ.ka(a, 4) + ".";
      S = [rada, obrNasobeni(a, b, i),
        a + " × " + (b - 1) + " = " + a * (b - 1) + ".<br>" + a + " × " + b + " je o jednu " + CZ.ka(a, 4) + " víc:<br><b>" + a * (b - 1) + " + " + a + " = ?</b>"];
      if (b === 1) S[2] = a + " × 2 = " + a * 2 + ", a jedna řada je polovina z toho.";
      if (a === 9 && u.finta9) S[2] += finta9(b);
    } else if (druh === "deleni" || druh === "chybi") {
      var cc = a * b;
      S = ["Které číslo krát " + a + " dá " + cc + "? Zkus " + a + " × 5 = " + a * 5 + ". To je " + (a * 5 > cc ? "víc" : a * 5 < cc ? "míň" : "přesně tolik") + " než " + cc + ".",
        obrDeleni(a, b, 0, i === "seno" ? "jablko" : i),
        a + " × " + (b - 1 || 1) + " = " + a * (b - 1 || 1) + ". " + (b > 1 ? "Do " + cc + " chybí ještě " + (cc - a * (b - 1)) + ", tedy jedna " + CZ.ka(a) + ".<br><b>" + (b - 1) + " + 1 = ?</b>" : "To je přesně ono.")];
    } else if (druh === "zbytek") {
      var c2 = a * b + np.r;
      S = ["Kolikrát se " + a + " vejde do " + c2 + "? Vzpomeň si na násobilku " + a + ".", obrDeleni(a, b, np.r, "jablko"),
        a + " × " + b + " = " + a * b + ". To se vejde. Kolik zbývá do " + c2 + "?<br><b>" + c2 + " − " + a * b + " = ?</b> (to dostane hříbě)"];
    } else if (druh === "plus" || druh === "minus") {
      var plus = druh === "plus", ukazka;
      if (plus && a < 100 && b < 10 && (a % 10) + b >= 10) { var dopl = 10 - (a % 10); ukazka = "Doplň do desítky: " + a + " + " + dopl + " = " + (a + dopl) + ".<br>Zbývá přidat " + (b - dopl) + ":<br><b>" + (a + dopl) + " + " + (b - dopl) + " = ?</b>"; }
      else if (!plus && a < 100 && b < 10 && (a % 10) < b) { var ub = a % 10; ukazka = "Uber nejdřív do desítky: " + a + " − " + ub + " = " + (a - ub) + ".<br>Zbývá ubrat " + (b - ub) + ":<br><b>" + (a - ub) + " − " + (b - ub) + " = ?</b>"; }
      else { var des = b - (b % 10); ukazka = plus ? a + " + " + c(des) + " = " + c(a + des) + ".<br>Teď přidej jednotky:<br><b>" + c(a + des) + " + " + (b % 10) + " = ?</b>" : a + " − " + c(des) + " = " + c(a - des) + ".<br>Teď uber jednotky:<br><b>" + c(a - des) + " − " + (b % 10) + " = ?</b>"; if (!des) ukazka = (plus ? "Sečti jednotky a pak přičti desítky." : "Uber jednotky, desítky zůstanou."); }
      S = [plus ? "Rozlož si druhé číslo: nejdřív přidej desítky, potom jednotky." : "Rozlož si druhé číslo: nejdřív uber desítky, potom jednotky.", obrPlusMinus(a, b, plus), ukazka];
    } else if (druh === "pisemne") {
      var ja = a % 10, jb = b % 10, plus2 = np.op === "+";
      var j = plus2 ? ja + jb : ja - jb;
      S = ["Začni úplně vpravo u jednotek. " + (plus2 ? "Když vyjde 10 a víc, napiš jen jednotky a desítku si přenes o místo doleva." : "Když nahoře je menší číslo, půjč si desítku od souseda vlevo."),
        obrSloupec(a, b, np.op),
        "Jednotky: " + (plus2 ? ja + " + " + jb + " = " + j + (j >= 10 ? " → píšeme " + (j % 10) + ", 1 si pamatujeme." : " → píšeme " + j + ".") : (j >= 0 ? ja + " − " + jb + " = " + j + " → píšeme " + j + "." : "1" + ja + " − " + jb + " = " + (10 + j) + " → píšeme " + (10 + j) + ", 1 jsme si půjčili.")) + "<br><b>Teď stejně desítky, stovky a tisíce.</b>"];
    } else if (druh === "nas2") {
      var d = a - (a % 10), jj = a % 10;
      S = ["Rozlož " + a + " na " + d + (jj ? " a " + jj : "") + ". Každý kousek vynásob zvlášť.",
        '<p class="np-text">' + a + " × " + b + " = " + d + " × " + b + (jj ? " + " + jj + " × " + b : "") + "</p>" + (jj ? "" : "<p class=\"np-text\">" + (d / 10) + " × " + b + " a přidej nulu.</p>"),
        jj ? d + " × " + b + " = " + d * b + ", " + jj + " × " + b + " = " + jj * b + ".<br><b>" + d * b + " + " + jj * b + " = ?</b>" : (d / 10) + " × " + b + " = " + (d / 10) * b + ". <b>Přidej nulu.</b>"];
    } else if (druh === "porovnani") {
      S = ["Porovnej nejdřív nejvyšší místo (tisíce, stovky). Když jsou stejné, podívej se o místo vpravo.",
        tabulka([a, b]), "Špička znaménka ukazuje vždy na menší číslo: 3 < 5, 5 > 3."];
    } else if (druh === "osa") {
      S = ["Podívej se, po kolika jdou čárky: po " + c(np.krok) + ".", obrOsa(np.od, np.krok, 10, np.hodnota, function (k) { return k % 5 === 0; }),
        "Začni u " + c(np.od) + " a skákej po " + c(np.krok) + ", dokud nedoskočíš ke koníkovi."];
    } else if (druh === "rozklad") {
      S = ["Tisíce píšeš první, pak stovky, desítky a nakonec jednotky.", tabulkaRozklad(np), "Když něčeho není nic, napiš na to místo nulu."];
    } else if (druh === "zaokr") {
      S = ["Je " + c(np.x) + " blíž k " + c(np.dolu) + ", nebo k " + c(np.nahoru) + "?", obrOsa(np.dolu, np.na / 10, 10, np.x, function (k) { return k === 0 || k === 10 || k === 5; }),
        "Rozhoduje číslice na místě " + (np.na === 10 ? "jednotek" : "desítek") + ": 0–4 jde dolů, 5–9 nahoru."];
    } else if (druh === "zlomek") {
      var jm = np.j, kk = np.k;
      S = ["Rozděl " + jm * kk + " na " + jm + " stejné hromádky. " + (np.p > 1 ? "Pak vezmi " + np.p + " hromádky." : "Jedna hromádka je výsledek."),
        obrDeleni(jm, kk, 0, "mrkev"), (jm * kk) + " : " + jm + " = ?" + (np.p > 1 ? " a výsledek vynásob " + np.p + "." : "")];
    } else {
      S = ["Přečti si to ještě jednou. Přidáváme, ubíráme, nebo dělíme?", "", ""];
    }
    if (u.slovni) S[0] = "Co se tu děje? " + (druh === "nasobeni" ? "Je víc stejných skupinek – to je násobení." : druh === "deleni" ? "Rozdělujeme spravedlivě – to je dělení." : druh === "plus" ? "Něco přibývá – sčítáme." : "Něco ubývá – odčítáme.") + "<br>Příklad: <b>" + u.vzorec + " = ?</b>";
    return [
      { nazev: "Malá rada", html: '<p class="np-text">' + S[0] + "</p>" },
      { nazev: "Obrázek", html: S[1] || '<p class="np-text">' + S[0] + "</p>" },
      { nazev: "Ukázka", html: '<div class="np-ukazka">' + S[2] + "</div>" }
    ];
  }

  function finta9(n) {
    var prsty = "";
    for (var i = 1; i <= 10; i++) {
      var o = i === n;
      prsty += '<rect x="' + (i * 22 - 14 + (i > 5 ? 10 : 0)) + '" y="' + (o ? 46 : 10) + '" width="16" height="' + (o ? 22 : 58) + '" rx="8" fill="' + (o ? "#f3a3c4" : "#f7d6b8") + '" stroke="#d9a983" stroke-width="1.5"/>';
    }
    return '<div class="np-finta"><b>Finta na prstech</b><svg class="np-prsty" viewBox="0 0 240 80" aria-hidden="true">' + prsty +
      '<rect x="4" y="62" width="112" height="16" rx="8" fill="#f7d6b8"/><rect x="124" y="62" width="112" height="16" rx="8" fill="#f7d6b8"/></svg>' +
      "<p>Ohni " + n + ". prstík. Prstíky vlevo jsou desítky, vpravo jednotky.</p></div>";
  }
  function tabulka(cisla) {
    var w = Math.max.apply(null, cisla.map(function (x) { return String(x).length; }));
    var hl = ["T", "S", "D", "J"].slice(4 - w);
    return '<table class="np-tab"><tr>' + hl.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr>" +
      cisla.map(function (x) { var s = String(x); s = Array(w - s.length + 1).join(" ") + s; return "<tr>" + s.split("").map(function (d) { return "<td>" + (d === " " ? "" : d) + "</td>"; }).join("") + "</tr>"; }).join("") + "</table>";
  }
  function tabulkaRozklad(np) {
    return '<table class="np-tab"><tr><th>tisíce</th><th>stovky</th><th>desítky</th><th>jednotky</th></tr><tr><td>' + np.t + "×</td><td>" + np.s + "×</td><td>" + np.d + "×</td><td>" + np.j + "×</td></tr><tr><td>?</td><td>?</td><td>?</td><td>?</td></tr></table>";
  }

  /* ---------- interakce v obrázku ---------- */
  function aktivuj(el, hlas) {
    var sk = el.querySelector(".np-skupiny");
    if (sk) {
      var po = +sk.dataset.po, rad = +sk.dataset.rad, napocitano = {};
      sk.addEventListener("click", function (e) {
        var r = e.target.closest(".np-rada"); if (!r || napocitano[r.dataset.rada]) return;
        napocitano[r.dataset.rada] = 1;
        var kolik = Object.keys(napocitano).length;
        r.classList.add("napocitano");
        r.querySelector(".np-mezisoucet").textContent = "= " + po * kolik;
        var st = el.querySelector(".np-stav");
        st.textContent = kolik < rad ? "Zatím máme " + po * kolik + ". Klepni na další řadu." : "Všechny řady! Teď už víš, kolik to je. Napiš to.";
        if (window.ZVUK) window.ZVUK.klik();
        if (hlas) hlas(String(po * kolik));
      });
    }
    var roz = el.querySelector(".np-rozdavani");
    if (roz) {
      var zbyva = +roz.dataset.zbyva, koni = +roz.dataset.koni, ikona = roz.dataset.ikona, hribe = roz.dataset.hribe === "1", kol = 0;
      var hromadky = roz.querySelectorAll(".np-hromadka:not(.hribe) .np-dily"), hr = roz.querySelector(".hribe .np-dily");
      roz.querySelector(".np-hromada").addEventListener("click", function () {
        var st = el.querySelector(".np-stav");
        if (zbyva >= koni) {
          for (var i = 0; i < koni; i++) hromadky[i].insertAdjacentHTML("beforeend", G.ikona(ikona, "mala"));
          zbyva -= koni; kol++;
          st.textContent = "Rozdáno " + CZ.pocet(kol, "kolo") + ". " + (zbyva >= koni ? "Klepni znovu." : zbyva ? "Na další kolo to nestačí. Zbylé dostane hříbě – klepni." : "Hotovo! Kolik má každý kůň?");
        } else if (zbyva > 0 && hribe) {
          for (var k = 0; k < zbyva; k++) hr.insertAdjacentHTML("beforeend", G.ikona(ikona, "mala"));
          st.textContent = "Hříbě dostalo " + CZ.pocet(zbyva, ikona === "mrkev" ? "mrkev" : "jablko") + ". Kolik má každý kůň a kolik hříbě?";
          zbyva = 0;
        }
        roz.querySelector(".np-zbyva").textContent = "zbývá " + zbyva;
        var hro = roz.querySelector(".np-hromada"); var ik2 = hro.querySelectorAll(".ikona");
        for (var x = ik2.length - 1; x >= Math.min(zbyva, 30); x--) ik2[x].remove();
        if (!zbyva) hro.disabled = true;
        if (window.ZVUK) window.ZVUK.klik();
      });
    }
  }

  /* ---------- rozbor chyby ---------- */
  function chyba(u, odp) {
    if (odp == null || odp === "") return null;
    var np = u.np || {}, f = u.fakt || {}, v = u.vysledek, o = Number(odp);
    var druh = np.druh || (f.druh === "del" ? "deleni" : u.typ === "chybi" ? "chybi" : "nasobeni");
    if (u.typ === "chybi") druh = "chybi";
    var a = np.a != null ? np.a : f.a, b = np.b != null ? np.b : f.b;
    if (druh === "porovnani") return "Podívej se nejdřív na nejvyšší místo. Které číslo je větší?";
    if (isNaN(o)) return null;
    if (druh === "nasobeni") {
      if (o === a * (b - 1)) return "Skoro! Chybí ti ještě jedna " + CZ.ka(a) + ".";
      if (o === a * (b + 1)) return "Kousek přes! Máš o jednu " + CZ.ka(a, 4) + " víc.";
      if (o === a + b) return "To je sčítání. My násobíme: " + CZ.pocet(b, "radek") + " " + CZ.po(a, "mrkev") + ".";
      if (String(o) === String(v).split("").reverse().join("") && o !== v) return "Číslice máš správně, jen prohozené!";
    }
    if (druh === "deleni" || druh === "chybi") {
      if (a && o > 0 && o <= 12) return a + " × " + o + " = " + a * o + ". To je " + (a * o > a * b ? "víc" : "míň") + " než " + a * b + ". Zkus " + (a * o > a * b ? "menší" : "větší") + " číslo.";
    }
    if (druh === "plus" || druh === "minus") {
      if (druh === "minus" && o === a + b) return "Pozor, tady ubíráme!";
      if (druh === "plus" && o === a - b) return "Pozor, tady přidáváme!";
      if (Math.abs(o - v) === 10) return "Jednotky máš dobře! Jen o jednu desítku vedle.";
      if (Math.abs(o - v) === 100) return "Desítky i jednotky sedí! Zkontroluj stovky.";
    }
    if (druh === "pisemne") {
      if (Math.abs(o - v) % 10 === 0 && o !== v) return "Jednotky máš dobře! Zkontroluj, jestli jsi nezapomněla přenést nebo půjčit.";
    }
    if (Math.abs(o - v) === 1) return "Úplně kousíček vedle! Zkus to přepočítat.";
    return null;
  }

  // zachována starší jednoduchá podoba (obrázek jako celek)
  function vytvor(u, ikona) { return stupne(u, ikona)[1].html; }

  window.NAPOVEDA = { stupne: stupne, aktivuj: aktivuj, chyba: chyba, vytvor: vytvor, obrOsa: obrOsa, obrSloupec: obrSloupec };
})();
