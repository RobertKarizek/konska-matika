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
    kun1: ["kůň", "koně", "koní"],
    balik: ["balík", "balíky", "balíků"],
    balik6: ["balíku", "balících", "balících"],          // „v 1 balíku, ve 3 balících“
    pytel: ["pytel", "pytle", "pytlů"],
    hribe4: ["hříbě", "hříbata", "hříbat"],
    kbelik: ["kbelík", "kbelíky", "kbelíků"],
    km: ["kilometr", "kilometry", "kilometrů"],
    kolo: ["kolo", "kola", "kol"],
    vyskok: ["skok", "skoky", "skoků"],
    minuta: ["minutu", "minuty", "minut"],
    tisic: ["tisíc", "tisíce", "tisíc"],
    desitka: ["desítka", "desítky", "desítek"],
    jednotka: ["jednotka", "jednotky", "jednotek"],
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

  // číslo s mezerou po tisících: 4352 → „4 352“
  function cislo(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

  // shoda slovesa s počtem: „pase se 1 kůň / pasou se 3 koně / pase se 8 koní“
  function sloveso(n, jedno, mnoho) { n = Math.abs(n); return n >= 2 && n <= 4 ? mnoho : jedno; }

  // číslice jako slovo: 8 → „osmička“ (1. pád) / „osmičku“ (4. pád)
  var KA = { 1: "jednička", 2: "dvojka", 3: "trojka", 4: "čtyřka", 5: "pětka", 6: "šestka", 7: "sedmička", 8: "osmička", 9: "devítka", 10: "desítka" };
  function ka(n, pad) { var t = KA[n] || String(n); return pad === 4 && KA[n] ? t.replace(/a$/, "u") : t; }

  window.CZ = {
    tvar: tvar, pocet: pocet, nahodny: nahodny, cislo: cislo, sloveso: sloveso, ka: ka,
    osloveni: function (id) { return OSLOVENI[id] || ""; },
    po: function (n, slovo) { return "po " + n + " " + (PO[slovo] || PO.mrkev); }
  };
})();
