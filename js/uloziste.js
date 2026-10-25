/* Ukládání pokroku do localStorage, zvlášť pro každou holčičku.
 * Když localStorage nefunguje (anonymní okno, zakázaná data), hraje se dál z paměti
 * a aplikace jen upozorní, že se pokrok neuloží. */
(function () {
  var KLIC = "konska-matika-v1";
  var funguje = true;
  var pamet = null;

  try {
    var t = "__test__";
    window.localStorage.setItem(t, t);
    window.localStorage.removeItem(t);
  } catch (e) {
    funguje = false;
  }

  function novyProfil() {
    return {
      kun: null,                 // { jmeno, srst, hriva, odznak }
      mrkve: 0, jablka: 0, podkovy: 0,
      lekci: 0,                  // počet dokončených lekcí
      fakta: {},                 // "8x7": { box: 0–5, kdy: číslo lekce, kdy se má vrátit, spatne: počet chyb, spravne: počet }
      temata: {},                // id → true/false (přepíše výchozí zapnuto z učiva)
      tema: {},                  // id → { lekci, faze }
      predmety: [],              // koupené věci pro koníka
      mista: ["domov"],          // odemčená místa
      predcitani: false,
      historie: [],              // [{ den, tema, napoprve, celkem }]
      kamaradi: [],              // kamarádi z výletů (hribe, ponik, kocka)
      nasazeno: {},              // co má koník na sobě: druh → id věci z obchodu
      navstiveno: [],            // výlety, kde už holčička byla
      obtiznost: "normal",       // lehci | normal | tezsi (nastavují rodiče)
      delkaLekce: 0,             // 0 = výchozí z učiva
      rekordZavod: 0
    };
  }

  function vychozi() {
    return { verze: 1, zvuk: true, profily: { laurinka: novyProfil(), julinka: novyProfil() } };
  }

  function doplnit(data) {
    var v = vychozi();
    if (!data || typeof data !== "object") return v;
    if (typeof data.zvuk === "boolean") v.zvuk = data.zvuk;
    ["laurinka", "julinka"].forEach(function (id) {
      var p = (data.profily || {})[id];
      if (p && typeof p === "object") {
        var n = novyProfil();
        Object.keys(n).forEach(function (k) { if (p[k] !== undefined) n[k] = p[k]; });
        v.profily[id] = n;
      }
    });
    return v;
  }

  function nacist() {
    if (pamet) return pamet;
    var data = null;
    if (funguje) {
      try { data = JSON.parse(window.localStorage.getItem(KLIC) || "null"); } catch (e) { data = null; }
    }
    pamet = doplnit(data);
    return pamet;
  }

  function ulozit() {
    if (!funguje || !pamet) return false;
    try {
      window.localStorage.setItem(KLIC, JSON.stringify(pamet));
      return true;
    } catch (e) {
      funguje = false;
      return false;
    }
  }

  function profil(id) { return nacist().profily[id]; }

  function resetovat(id) {
    nacist().profily[id] = novyProfil();
    ulozit();
  }

  /* Přenos mezi zařízeními: kód = (zkomprimovaný) JSON v base64. Prefix říká formát. */
  function b64(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function zb64(text) {
    text = text.replace(/-/g, "+").replace(/_/g, "/");
    while (text.length % 4) text += "=";
    var s = atob(text), out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  function proud(bytes, Trida) {
    var s = new Blob([bytes]).stream().pipeThrough(new Trida("deflate-raw"));
    return new Response(s).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }

  function exportKod(id) {
    var json = JSON.stringify({ id: id, p: profil(id) });
    var bytes = new TextEncoder().encode(json);
    if (window.CompressionStream) {
      return proud(bytes, CompressionStream).then(function (z) { return "K1" + b64(z); });
    }
    return Promise.resolve("K0" + b64(bytes));
  }

  function importKod(kod) {
    kod = (kod || "").replace(/\s+/g, "");
    var format = kod.slice(0, 2), telo = kod.slice(2);
    var bytes;
    try { bytes = zb64(telo); } catch (e) { return Promise.reject(new Error("Kód není celý nebo je přepsaný.")); }
    var krok = format === "K1"
      ? (window.DecompressionStream ? proud(bytes, DecompressionStream) : Promise.reject(new Error("Tenhle prohlížeč kód neumí přečíst.")))
      : format === "K0" ? Promise.resolve(bytes) : Promise.reject(new Error("Tohle nevypadá jako kód z Koňské matiky."));
    return krok.then(function (b) {
      var d = JSON.parse(new TextDecoder().decode(b));
      if (!d || !d.id || !nacist().profily[d.id]) throw new Error("V kódu chybí, komu pokrok patří.");
      var cele = nacist();
      var docasne = doplnit({ profily: (function () { var o = {}; o[d.id] = d.p; return o; })() });
      cele.profily[d.id] = docasne.profily[d.id];
      ulozit();
      return d.id;
    });
  }

  window.ULOZISTE = {
    funguje: function () { return funguje; },
    nacist: nacist, ulozit: ulozit, profil: profil, resetovat: resetovat,
    exportKod: exportKod, importKod: importKod
  };
})();
