/* Obrázková nápověda: příklad se rozloží na skupinky předmětů, které jde spočítat. */
(function () {
  var G = window.GRAFIKA, CZ = window.CZ;
  var PREDMET = { mrkev: "mrkev", jablko: "jablko", podkova: "podkova", seno: "seno", hvezda: "hvezda", kun: "mrkev" };

  function radaIkon(n, ikona) {
    var s = "";
    for (var i = 0; i < n; i++) s += G.ikona(ikona, "mala");
    return s;
  }

  // a × b: b řad po a předmětech + cesta po skocích (poslední zastávka je otazník)
  function nasobeni(a, b, ikona, chybi) {
    var radky = "";
    for (var r = 0; r < b; r++) radky += '<div class="np-rada" style="animation-delay:' + (r * 60) + 'ms"><span class="np-cislo">' + (r + 1) + '.</span>' + radaIkon(a, ikona) + "</div>";
    var cesta = '<div class="np-cesta"><span class="np-stop">0</span>';
    for (var k = 1; k <= b; k++) {
      var konec = k === b;
      cesta += '<span class="np-skok">+' + a + '</span><span class="np-stop' + (konec && !chybi ? " otaznik" : "") + '">' + (konec && !chybi ? "?" : a * k) + "</span>";
    }
    cesta += "</div>";
    var soucet = b <= 6 ? Array(b + 1).join(a + " + ").replace(/ \+ $/, "") + " = ?" : "";
    var nadpis = chybi
      ? "Kůň skáče po " + a + ". Kolik skoků musí udělat, aby doskočil na " + a * b + "?"
      : CZ.pocet(b, "radek") + " " + CZ.po(a, ikona) + ". Spočítej je, nebo skákej s koníkem po " + a + ".";
    return '<p class="np-text">' + nadpis + "</p>" +
      (chybi ? "" : '<div class="np-skupiny">' + radky + "</div>") +
      cesta + (soucet && !chybi ? '<p class="np-soucet">' + a + " × " + b + " = " + soucet + "</p>" : "");
  }

  // c : a = b – spravedlivě rozdělit c předmětů mezi a koní
  function deleni(a, b, ikona) {
    var c = a * b, s = "";
    for (var i = 0; i < a; i++) s += '<div class="np-hromadka" style="animation-delay:' + (i * 70) + 'ms">' + G.ikona("kun", "kunik") + '<div class="np-dily">' + radaIkon(b, ikona) + "</div></div>";
    return '<p class="np-text">Rozdělíme ' + CZ.pocet(c, ikona === "mrkev" ? "mrkev" : ikona === "podkova" ? "podkova" : ikona === "hvezda" ? "hvezda" : "jablko") +
      " spravedlivě mezi " + CZ.pocet(a, "kone4") + ". Kolik dostane každý?</p>" +
      '<div class="np-rozdeleni">' + s + "</div>" +
      '<p class="np-soucet">Pomůže násobilka: ' + a + " × ? = " + c + "</p>";
  }

  // Koňská finta na devítku: 9 × n = 10 × n − n a prstíky
  function finta9(n) {
    var prsty = "";
    for (var i = 1; i <= 10; i++) {
      var ohnuty = i === n;
      prsty += '<rect x="' + (i * 22 - 14 + (i > 5 ? 10 : 0)) + '" y="' + (ohnuty ? 46 : 10) + '" width="16" height="' + (ohnuty ? 22 : 58) + '" rx="8" fill="' + (ohnuty ? "#f3a3c4" : "#f7d6b8") + '" stroke="#d9a983" stroke-width="1.5"/>';
    }
    var svg = '<svg class="np-prsty" viewBox="0 0 240 80" aria-hidden="true">' + prsty +
      '<rect x="4" y="62" width="112" height="16" rx="8" fill="#f7d6b8"/><rect x="124" y="62" width="112" height="16" rx="8" fill="#f7d6b8"/></svg>';
    return '<div class="np-finta"><b>Koňská finta na devítku</b>' +
      '<p>9 × ' + n + " je skoro jako 10 × " + n + ". Spočítej " + (10 * n) + " a uber " + n + ": " + (10 * n) + " − " + n + " = ?</p>" +
      svg + "<p>Nebo prstíky: ohni " + n + ". prstík. Prstíky vlevo jsou desítky, vpravo jednotky.</p></div>";
  }

  function vytvor(u, ikonaTematu) {
    var ik = PREDMET[ikonaTematu] || "mrkev", f = u.fakt, html;
    if (f.druh === "del") html = deleni(f.a, f.b, ik === "seno" ? "jablko" : ik);
    else html = nasobeni(f.a, f.b, ik, u.typ === "chybi");
    if (u.finta9 && f.druh === "nas" && u.typ !== "chybi") html += finta9(f.b);
    return html;
  }

  window.NAPOVEDA = { vytvor: vytvor };
})();
