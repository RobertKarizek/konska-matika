/* Čeština: skloňování podle počtu a pár drobností kolem textů. */
(function () {
  // [1, 2–4, 0 a 5+]
  var TVARY = {
    mrkev: ["mrkev", "mrkve", "mrkví"],
    jablko: ["jablko", "jablka", "jablek"],
    podkova: ["podkovu", "podkovy", "podkov"],          // 4. pád: „získala jsi 1 podkovu“
    podkova1: ["podkova", "podkovy", "podkov"],         // 1. pád: „1 podkova“
    kun: ["kůň", "koně", "koní"],
    kone4: ["koně", "koně", "koní"],                    // 4. pád: „vidím 1 koně“
    priklad: ["příklad", "příklady", "příkladů"],
    lekce: ["lekce", "lekce", "lekcí"],
    zlab: ["žlab", "žlaby", "žlabů"],
    radek: ["řada", "řady", "řad"],
    hribe: ["hříbě", "hříbata", "hříbat"],
    kus: ["kus", "kusy", "kusů"],
    seno: ["balík sena", "balíky sena", "balíků sena"],
    hvezda: ["hvězdičku", "hvězdičky", "hvězdiček"],
    skok: ["skok", "skoky", "skoků"]
  };

  // 6. pád množného čísla po „po“: „3 řady po 8 mrkvích“
  var PO = { mrkev: "mrkvích", jablko: "jablkách", podkova: "podkovách", seno: "balících sena", hvezda: "hvězdičkách", kun: "koních" };

  function tvar(slovo, n) {
    var t = TVARY[slovo];
    if (!t) return slovo;
    n = Math.abs(n);
    if (n === 1) return t[0];
    if (n >= 2 && n <= 4) return t[1];
    return t[2];
  }

  // „5 mrkví“
  function pocet(n, slovo) {
    return n + " " + tvar(slovo, n);
  }

  // Oslovení (5. pád) – kůň mluví na holčičku
  var OSLOVENI = { laurinka: "Laurinko", julinka: "Julinko" };

  function nahodny(pole) {
    return pole[Math.floor(Math.random() * pole.length)];
  }

  window.CZ = {
    tvar: tvar, pocet: pocet, nahodny: nahodny,
    osloveni: function (id) { return OSLOVENI[id] || ""; },
    po: function (n, slovo) { return "po " + n + " " + (PO[slovo] || PO.mrkev); }
  };
})();
