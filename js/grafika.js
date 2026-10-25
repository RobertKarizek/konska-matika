/* Veškerá grafika jako SVG kreslené v kódu: koně, předměty, světy. */
(function () {
  // barvy srsti jako u skutečných koní; konce = tmavé spodní nohy (hnědák, vraník)
  var SRST = [
    { id: "hnedak", nazev: "hnědák", barva: "#7a4528", konce: "#241a16" },
    { id: "ryzak", nazev: "ryzák", barva: "#a9582a" },
    { id: "plavak", nazev: "plavák", barva: "#d6ab63" },
    { id: "belous", nazev: "bělouš", barva: "#e6e2dc" },
    { id: "vranik", nazev: "vraník", barva: "#2b2426", konce: "#1a1517" },
    { id: "strakac", nazev: "strakáč", barva: "#f1ede6", skvrny: "#6b3e24" },
    { id: "jablecnak", nazev: "jablečňák", barva: "#a9adb4", puntiky: "#dfe2e6" }
  ];
  var HRIVA = [
    { id: "tmava", nazev: "tmavá", barva: "#1f1714" },
    { id: "svetla", nazev: "světlá", barva: "#ecdcb4" },
    { id: "rezava", nazev: "rezavá", barva: "#8e3e1c" },
    { id: "bila", nazev: "bílá", barva: "#f2efe8" },
    { id: "ruzova", nazev: "růžová", barva: "#ee9fbf" },
    { id: "fialova", nazev: "fialová", barva: "#a88be0" },
    { id: "modra", nazev: "modrá", barva: "#86b9e6" }
  ];
  var ODZNAK = [
    { id: "hvezda", nazev: "hvězdička" },
    { id: "lysina", nazev: "lysina" },
    { id: "srdce", nazev: "srdíčko" },
    { id: "zadny", nazev: "bez odznaku" }
  ];

  function najdi(pole, id) { return pole.filter(function (x) { return x.id === id; })[0] || pole[0]; }

  // ztmavení / zesvětlení barvy (#rrggbb, k: -1…1)
  function odstin(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function f(c) { return Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k); }
    return "#" + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }

  var uid = 0;

  /* Kůň z boku, hlavou doprava – realistické proporce a stínování, „živý“ (dýchá, mrká, hýbe ušima a ocasem).
   * k = { srst, hriva, odznak, jmeno }, volby = doplňky { deka, ohlavka, masle } (barvy). */
  function kun(k, volby) {
    k = k || {};
    volby = volby || {};
    var s = najdi(SRST, k.srst), h = najdi(HRIVA, k.hriva);
    var id = "k" + (++uid);
    var c = s.barva, cS = odstin(c, 0.28), cT = odstin(c, -0.32), cTT = odstin(c, -0.55);
    var hb = h.barva, hS = odstin(hb, 0.3), hT = odstin(hb, -0.35);
    var nohy = s.konce || c;                      // hnědák a vraník mají tmavé „ponožky“
    var kopyto = s.id === "belous" || s.id === "plavak" ? "#6e6258" : "#3a302b";
    var bila = "#f7f4ee";

    var defs = '<defs>' +
      '<linearGradient id="' + id + 't" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + cS + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + cT + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c + '"/><stop offset=".55" stop-color="' + odstin(c, -0.12) + '"/><stop offset=".7" stop-color="' + nohy + '"/><stop offset="1" stop-color="' + odstin(nohy, -0.2) + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'z" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + cT + '"/><stop offset=".6" stop-color="' + odstin(nohy === c ? cT : nohy, -0.15) + '"/><stop offset="1" stop-color="' + odstin(nohy, -0.35) + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'l" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 's" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + hS + '"/><stop offset=".5" stop-color="' + hb + '"/><stop offset="1" stop-color="' + hT + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + odstin(kopyto, 0.2) + '"/><stop offset="1" stop-color="' + kopyto + '"/></linearGradient>' +
      '<clipPath id="' + id + 'c"><path d="' + TELO + '"/></clipPath>' +
      "</defs>";

    function noha(d, fill) { return '<path d="' + d + '" fill="' + fill + '"/>'; }
    function kopytoNa(x, y, w) { return '<path d="M' + (x - w / 2) + " " + (y - 9) + " L" + (x + w / 2) + " " + (y - 9) + " L" + (x + w / 2 + 3) + " " + y + " L" + (x - w / 2 - 2) + " " + y + 'z" fill="url(#' + id + 'k)"/>'; }

    // vzdálené nohy (posunuté a tmavší)
    var vzdalene = '<g class="nohy-vzdalene">' +
      noha(NOHA_ZADNI, "url(#" + id + "z)") .replace('d="', 'transform="translate(20 -2)" d="') +
      kopytoNa(115, 282, 18) +
      noha(NOHA_PREDNI, "url(#" + id + "z)").replace('d="', 'transform="translate(-24 -2)" d="') +
      kopytoNa(217, 282, 18) + "</g>";

    // ocas – hustý pramen a jemné vlasy
    var ocas = '<g class="ocas"><path d="M76 110 C 56 112, 46 130, 44 160 C 42 200, 40 230, 50 264 C 54 252, 58 238, 58 222 C 62 238, 66 250, 74 258 C 66 222, 64 182, 70 142 C 72 128, 76 118, 82 114z" fill="url(#' + id + 'h)"/>';
    [[74, 114, 52, 150, 46, 210, 50, 258], [76, 116, 60, 150, 54, 200, 58, 240], [78, 118, 66, 160, 62, 210, 70, 252], [74, 116, 50, 140, 44, 180, 46, 232], [80, 120, 68, 150, 66, 190, 64, 226]].forEach(function (p, i) {
      ocas += '<path d="M' + p[0] + " " + p[1] + " C " + p[2] + " " + p[3] + ", " + p[4] + " " + p[5] + ", " + p[6] + " " + p[7] + '" stroke="' + (i % 2 ? hT : hS) + '" stroke-width="' + (1.6 + (i % 3) * 0.6) + '" fill="none" stroke-linecap="round" opacity=".55"/>';
    });
    ocas += "</g>";

    // znaky na srsti
    var znaky = "";
    if (s.skvrny) znaky += '<g fill="' + s.skvrny + '" clip-path="url(#' + id + 'c)" opacity=".95"><path d="M92 112 C 120 96, 150 112, 146 140 C 142 168, 104 170, 88 150 C 78 136, 80 120, 92 112z"/><path d="M182 128 C 196 118, 222 124, 222 146 C 222 166, 196 172, 184 160 C 174 150, 174 136, 182 128z"/><path d="M262 72 C 274 64, 290 70, 288 84 C 286 98, 270 100, 262 92z"/></g>';
    if (s.puntiky) {
      znaky += '<g fill="' + s.puntiky + '" clip-path="url(#' + id + 'c)" opacity=".55">';
      [[96, 126, 9], [118, 120, 7], [140, 132, 8], [108, 146, 7], [160, 126, 6], [182, 140, 7], [130, 150, 6], [86, 140, 6], [200, 126, 5], [150, 112, 5]].forEach(function (p) {
        znaky += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '"/>';
      });
      znaky += "</g>";
    }
    var odz = "";
    if (k.odznak === "hvezda") odz = '<path d="M304 62 C 308 58, 314 60, 314 65 C 314 70, 308 72, 305 69 C 301 68, 301 64, 304 62z" fill="' + bila + '"/>';
    if (k.odznak === "lysina") odz = '<path d="M302 58 C 308 56, 313 60, 313 66 C 317 80, 327 96, 337 110 C 339 116, 335 120, 331 118 C 323 104, 311 88, 305 76 C 301 70, 299 62, 302 58z" fill="' + bila + '"/>';
    if (k.odznak === "srdce") odz = '<path d="M308 72 C 300 66, 301 58, 308 62 C 314 58, 317 66, 308 72z" fill="' + bila + '"/>';

    var deka = volby.deka ? '<path d="M140 104 C 168 108, 196 110, 216 106 L 214 160 C 190 166, 160 166, 140 160z" fill="' + volby.deka + '" stroke="' + odstin(volby.deka, -0.3) + '" stroke-width="2.5"/><path d="M146 152 C 170 158, 196 158, 214 152" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="7 5" opacity=".75"/>' : "";
    var ohlavka = volby.ohlavka ? '<g fill="none" stroke="' + volby.ohlavka + '" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M288 52 C 290 72, 292 92, 296 112"/><path d="M296 112 C 308 116, 322 118, 334 112"/><path d="M291 76 C 304 80, 318 92, 330 106"/></g><circle cx="296" cy="112" r="3.5" fill="#d9b44a"/>' : "";
    var masle = volby.masle ? '<g fill="' + volby.masle + '" class="masle"><path d="M264 70 l-9 -7 0 14z"/><path d="M264 70 l9 -7 0 14z"/><circle cx="264" cy="70" r="3.2"/></g><g fill="' + volby.masle + '"><path d="M70 122 l-8 -6 0 12z"/><path d="M70 122 l8 -6 0 12z"/><circle cx="70" cy="122" r="2.8"/></g>' : "";

    // hříva – hustý pás podél hřebene krku a jemné prameny
    var hriva = '<g class="hriva"><path d="M294 42 C 268 52, 236 88, 202 106 L 206 118 C 236 104, 262 80, 280 62 C 288 56, 294 54, 300 54z" fill="url(#' + id + 'h)"/>';
    for (var i = 0; i < 14; i++) {
      var t = i / 13, x = 292 - t * 88, y = 46 + t * 62, d = 16 + (i % 4) * 5 + Math.sin(i) * 3;
      hriva += '<path d="M' + x.toFixed(1) + " " + y.toFixed(1) + " C " + (x - 4).toFixed(1) + " " + (y + d * 0.4).toFixed(1) + ", " + (x - 10).toFixed(1) + " " + (y + d * 0.7).toFixed(1) + ", " + (x - 15 - (i % 3) * 2).toFixed(1) + " " + (y + d).toFixed(1) +
        '" stroke="' + (i % 3 === 0 ? hT : i % 3 === 1 ? hb : hS) + '" stroke-width="' + (3.4 - (i % 3) * 0.6) + '" fill="none" stroke-linecap="round"/>';
    }
    hriva += '<path d="M292 46 C 298 50, 304 56, 306 66 C 300 62, 294 58, 288 56z" fill="url(#' + id + 'h)"/></g>';

    return '<svg class="kun-svg realny" viewBox="20 10 350 285" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (k.jmeno ? "kůň " + k.jmeno : "koník") + '">' + defs +
      '<ellipse cx="170" cy="284" rx="130" ry="9" fill="url(#' + id + 's)"/>' +
      vzdalene + ocas +
      // blízké nohy (pod trupem, ať se horní část schová pod tělo)
      '<g class="nohy-blizke">' + noha(NOHA_ZADNI, "url(#" + id + "n)") + kopytoNa(93, 286, 19) + noha(NOHA_PREDNI, "url(#" + id + "n)") + kopytoNa(241, 286, 20) + "</g>" +
      '<g class="trup">' +
      '<path d="' + TELO + '" fill="url(#' + id + 't)"/>' +
      // svaly a stíny
      '<g clip-path="url(#' + id + 'c)">' +
      '<ellipse cx="96" cy="132" rx="42" ry="30" fill="url(#' + id + 'l)"/>' +
      '<ellipse cx="230" cy="140" rx="28" ry="26" fill="url(#' + id + 'l)"/>' +
      '<ellipse cx="262" cy="90" rx="18" ry="30" fill="url(#' + id + 'l)" transform="rotate(-40 262 90)"/>' +
      '<ellipse cx="304" cy="96" rx="14" ry="12" fill="url(#' + id + 'l)"/>' +
      '<path d="M120 174 C 160 164, 200 166, 236 174 L 236 192 L 120 192z" fill="' + cTT + '" opacity=".22"/>' +
      '<path d="M208 116 C 216 132, 220 150, 218 170" stroke="' + cT + '" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>' +
      '<path d="M114 112 C 106 128, 104 146, 108 164" stroke="' + cT + '" stroke-width="3" fill="none" opacity=".28" stroke-linecap="round"/>' +
      '<path d="M250 104 C 258 118, 262 130, 262 140" stroke="' + cT + '" stroke-width="2.5" fill="none" opacity=".25" stroke-linecap="round"/>' +
      znaky + "</g>" +
      deka +
      "</g>" +
      // hlava: uši, oko, nozdry, ústa
      '<g class="hlava">' +
      '<path class="ucho-vzadu" d="M290 48 C 292 36, 298 26, 304 20 C 306 30, 302 42, 297 50z" fill="' + cT + '"/>' +
      '<path class="ucho" d="M281 50 C 279 36, 283 24, 289 16 C 293 26, 293 40, 290 50z" fill="' + c + '"/><path d="M284 44 C 284 34, 286 27, 289 22 C 291 30, 290 38, 288 44z" fill="' + cTT + '" opacity=".45"/>' +
      odz +
      '<ellipse cx="336" cy="122" rx="10" ry="8" fill="' + cTT + '" opacity=".25"/>' +
      '<path d="M334 116 C 339 113, 343 117, 341 122 C 339 125, 335 124, 335 121" fill="' + cTT + '"/>' +
      '<path d="M320 133 C 326 136, 334 136, 340 133" stroke="' + cTT + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M290 104 C 296 96, 306 92, 314 96" stroke="' + cT + '" stroke-width="2.2" fill="none" opacity=".4" stroke-linecap="round"/>' +
      '<g class="oko"><path d="M293 72 C 297 67, 305 67, 309 72 C 305 77, 297 78, 293 72z" fill="#1e1512"/><circle cx="304" cy="70.5" r="1.6" fill="#fff" opacity=".85"/>' +
      '<path class="vicko" d="M292 71 C 297 65, 305 65, 310 71" stroke="' + cTT + '" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>' +
      hriva + ohlavka + masle +
      "</g></svg>";
  }

  // tělo (trup + krk + hlava) a nohy – sdílené tvary
  var TELO = "M205 110 C 228 100, 250 82, 266 62 C 272 52, 282 44, 292 46 C 302 52, 318 76, 336 104 C 344 116, 348 126, 342 133 " +
    "C 336 139, 326 139, 320 134 C 316 131, 314 128, 310 128 C 300 126, 290 118, 288 106 C 286 100, 282 98, 278 100 " +
    "C 266 116, 256 128, 252 140 C 250 150, 252 160, 246 168 C 240 176, 228 180, 216 180 C 190 184, 150 184, 124 176 " +
    "C 112 172, 104 168, 100 172 C 84 168, 70 160, 64 146 C 60 134, 62 120, 72 112 C 92 102, 120 102, 140 106 C 165 112, 185 112, 205 110z";
  var NOHA_ZADNI = "M104 158 C 108 178, 106 196, 98 210 C 94 218, 94 228, 96 238 L 96 262 C 96 268, 98 272, 102 278 L 84 278 " +
    "C 84 272, 82 268, 82 262 L 82 236 C 80 226, 76 220, 72 214 C 64 200, 62 180, 66 150z";
  var NOHA_PREDNI = "M222 150 C 238 158, 246 174, 242 196 C 240 206, 240 214, 242 220 L 241 262 C 242 268, 246 272, 250 278 L 232 278 " +
    "C 230 272, 228 268, 228 262 L 228 226 C 226 220, 224 214, 222 206 C 220 190, 214 176, 206 164z";

  /* Malé ikony předmětů (40 × 40) */
  var IKONY = {
    mrkev: '<path d="M20 14 C 26 14, 28 18, 26 24 L 18 37 C 17 38, 15 37, 15 36 L 14 22 C 14 17, 16 14, 20 14z" fill="#f28b2b"/><path d="M17 22 l4 1 M16 28 l4 1" stroke="#d56b12" stroke-width="1.6" stroke-linecap="round"/><path d="M20 15 C 17 8, 12 7, 11 9 C 15 10, 17 12, 19 15z M21 15 C 22 7, 27 4, 29 6 C 25 8, 23 11, 22 15z M20 15 C 20 9, 21 5, 20 3 C 18 6, 18 10, 19 15z" fill="#5cb85c"/>',
    jablko: '<path d="M20 13 C 14 8, 6 12, 7 21 C 8 31, 14 36, 20 33 C 26 36, 32 31, 33 21 C 34 12, 26 8, 20 13z" fill="#e94b4b"/><path d="M12 18 C 11 22, 12 26, 14 28" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6"/><path d="M20 13 C 20 9, 21 7, 23 5" stroke="#7a4a2a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M22 9 C 26 5, 31 6, 32 8 C 28 11, 25 11, 22 9z" fill="#5cb85c"/>',
    podkova: '<path d="M8 8 C 8 26, 12 34, 20 34 C 28 34, 32 26, 32 8 L 25 8 C 25 22, 24 27, 20 27 C 16 27, 15 22, 15 8z" fill="#b7bec8" stroke="#8a929c" stroke-width="1.5"/><g fill="#6b737c"><circle cx="11.5" cy="13" r="1.4"/><circle cx="12.5" cy="20" r="1.4"/><circle cx="28.5" cy="13" r="1.4"/><circle cx="27.5" cy="20" r="1.4"/></g><path d="M10 9 C 10 20, 12 27, 16 31" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/>',
    seno: '<rect x="6" y="12" width="28" height="20" rx="4" fill="#efcd5a"/><path d="M6 18 h28 M6 26 h28" stroke="#c9a232" stroke-width="2"/><path d="M14 12 v20 M26 12 v20" stroke="#b5462f" stroke-width="2.2"/><path d="M9 12 l-2 -3 M15 12 l1 -4 M24 12 l-1 -3 M31 12 l2 -4" stroke="#d9b440" stroke-width="1.6" stroke-linecap="round"/>',
    hvezda: '<path d="M20 5 l4.4 9.2 10 1.4 -7.3 7 1.8 10 -8.9 -4.8 -8.9 4.8 1.8 -10 -7.3 -7 10 -1.4z" fill="#ffd34d" stroke="#e8b52a" stroke-width="1.5" stroke-linejoin="round"/>',
    kun: '<path d="M12 34 C 12 24, 14 16, 20 10 L 22 4 L 25 10 C 31 12, 34 18, 33 24 L 28 26 C 26 23, 23 22, 22 24 C 22 28, 24 31, 26 34z" fill="#a0603a"/><path d="M20 10 C 16 14, 13 22, 12 30 C 16 24, 18 18, 22 13z" fill="#3b2a22"/><circle cx="26" cy="15" r="1.8" fill="#2b2222"/>',
    pytel: '<path d="M12 12 C 10 18, 8 26, 10 32 C 12 36, 28 36, 30 32 C 32 26, 30 18, 28 12z" fill="#d8b98a"/><path d="M12 12 C 16 9, 24 9, 28 12 L 26 15 C 22 13, 18 13, 14 15z" fill="#b8955f"/><path d="M14 9 C 18 6, 22 6, 26 9" stroke="#8a6a3c" stroke-width="2.4" fill="none" stroke-linecap="round"/><text x="20" y="28" font-size="10" text-anchor="middle" fill="#7a5a2c" font-family="sans-serif" font-weight="700">10</text>',
    zlab: '<path d="M4 18 h32 l-4 14 h-24z" fill="#9b6a43"/><path d="M4 18 h32" stroke="#7a5233" stroke-width="3"/><path d="M8 32 v4 M32 32 v4" stroke="#7a5233" stroke-width="3" stroke-linecap="round"/>',
    box: '<rect x="4" y="6" width="32" height="28" rx="3" fill="#c78b56"/><rect x="8" y="10" width="24" height="20" rx="2" fill="#f5e3c4"/><path d="M8 20 h24" stroke="#c78b56" stroke-width="2"/>'
  };
  function ikona(nazev, trida) {
    return '<svg class="ikona ' + (trida || "") + '" viewBox="0 0 40 40" aria-hidden="true">' + (IKONY[nazev] || IKONY.hvezda) + "</svg>";
  }

  /* Pozadí světů */
  function svet(kdo) {
    if (kdo === "laurinka") {
      return '<svg class="svet-svg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
        '<defs><linearGradient id="nebeL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c5ba8"/><stop offset=".45" stop-color="#f08a7e"/><stop offset=".75" stop-color="#ffc27a"/><stop offset="1" stop-color="#ffe2a6"/></linearGradient></defs>' +
        '<rect width="400" height="700" fill="url(#nebeL)"/>' +
        '<g fill="#fff" opacity=".7"><circle cx="40" cy="60" r="1.6"/><circle cx="120" cy="30" r="1.2"/><circle cx="300" cy="50" r="1.5"/><circle cx="360" cy="110" r="1.1"/><circle cx="210" cy="80" r="1"/></g>' +
        '<g class="obj"><circle cx="290" cy="400" r="70" fill="#ffd27a" opacity=".9"/><circle cx="290" cy="400" r="100" fill="#ffd27a" opacity=".25"/></g>' +
        '<path d="M0 440 L 70 330 L 120 390 L 190 280 L 260 380 L 320 310 L 400 410 L 400 700 L 0 700z" fill="#8a6aa8"/>' +
        '<path d="M190 280 L 172 308 L 186 302 L 196 314 L 206 296 z M70 330 L 58 350 L 72 346 L 80 354z M320 310 L 308 330 L 322 326 L 330 334z" fill="#f7eef5" opacity=".9"/>' +
        '<path d="M0 480 C 80 430, 140 470, 210 440 C 280 410, 340 450, 400 430 L 400 700 L 0 700z" fill="#b67a92"/>' +
        '<path d="M0 540 C 90 500, 180 530, 260 510 C 330 494, 370 510, 400 500 L 400 700 L 0 700z" fill="#e7a45f"/>' +
        '<path d="M0 600 C 100 570, 250 590, 400 570 L 400 700 L 0 700z" fill="#d48b45"/>' +
        '<g stroke="#7a4b2a" stroke-width="5" stroke-linecap="round"><path d="M0 610 L 400 590"/><path d="M0 640 L 400 620"/></g>' +
        '<g fill="#7a4b2a"><rect x="30" y="590" width="8" height="70" rx="2"/><rect x="130" y="585" width="8" height="70" rx="2"/><rect x="230" y="580" width="8" height="70" rx="2"/><rect x="330" y="575" width="8" height="70" rx="2"/></g>' +
        '<g fill="#a86a3a" opacity=".8"><path d="M60 680 l4 -14 l4 14z"/><path d="M200 690 l3 -12 l3 12z"/><path d="M340 684 l4 -14 l4 14z"/></g>' +
        "</svg>";
    }
    return '<svg class="svet-svg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<defs><linearGradient id="nebeJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3f4"/><stop offset=".7" stop-color="#d4f1ff"/><stop offset="1" stop-color="#f0fbff"/></linearGradient></defs>' +
      '<rect width="400" height="700" fill="url(#nebeJ)"/>' +
      '<g class="obj"><circle cx="330" cy="90" r="56" fill="#fff" opacity=".35"/><circle cx="330" cy="90" r="38" fill="#fff07a"/></g>' +
      '<g class="obj" fill="#fff"><ellipse cx="80" cy="120" rx="44" ry="16"/><ellipse cx="110" cy="108" rx="28" ry="16"/><ellipse cx="240" cy="190" rx="38" ry="13"/><ellipse cx="262" cy="180" rx="22" ry="13"/></g>' +
      '<path d="M0 470 C 80 420, 170 450, 240 430 C 310 410, 360 430, 400 420 L 400 700 L 0 700z" fill="#9ed98a"/>' +
      // stáj
      '<g class="obj" transform="translate(30 360)"><path d="M0 70 L 55 30 L 110 70z" fill="#c0463a"/><rect x="8" y="68" width="94" height="66" fill="#e0574a"/><rect x="38" y="88" width="34" height="46" fill="#fff4e6"/><path d="M38 88 L 72 134 M72 88 L 38 134" stroke="#e0574a" stroke-width="4"/><rect x="48" y="48" width="14" height="14" fill="#fff4e6"/></g>' +
      '<path d="M0 520 C 90 490, 200 520, 280 500 C 340 486, 380 494, 400 488 L 400 700 L 0 700z" fill="#7cc56b"/>' +
      // potůček
      '<path d="M400 560 C 320 560, 300 600, 230 606 C 160 612, 120 640, 60 646 C 30 650, 10 660, 0 664 L 0 700 L 30 700 C 60 680, 120 672, 170 662 C 240 650, 290 620, 340 610 C 370 604, 390 602, 400 602z" fill="#7cc8ee"/>' +
      '<path d="M330 580 C 300 590, 280 600, 250 604 M180 630 C 150 640, 120 648, 90 652" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>' +
      // kytičky
      '<g>' + [[40, 540, "#ff8fb8"], [90, 560, "#fff36b"], [150, 530, "#c9a2ff"], [210, 560, "#ff8fb8"], [270, 540, "#fff"], [330, 530, "#fff36b"], [370, 560, "#ff8fb8"], [120, 690, "#fff36b"], [260, 680, "#c9a2ff"], [360, 670, "#fff"]].map(function (k) {
        return '<g transform="translate(' + k[0] + " " + k[1] + ')"><path d="M0 0 v10" stroke="#4e9a3e" stroke-width="2"/><circle cx="-3" cy="-2" r="3" fill="' + k[2] + '"/><circle cx="3" cy="-2" r="3" fill="' + k[2] + '"/><circle cx="0" cy="-5" r="3" fill="' + k[2] + '"/><circle cx="0" cy="1" r="3" fill="' + k[2] + '"/><circle cx="0" cy="-2" r="2" fill="#ffcf33"/></g>';
      }).join("") + "</g></svg>";
  }

  /* Na širokém displeji (počítač) se krajina zrcadlově prodlouží do stran; slunce, mraky a stáj zůstanou jen uprostřed. */
  function svetSiroky(kdo) {
    var s = svet(kdo);
    var vnitrek = s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
    var bezDefs = vnitrek.replace(/<defs>.*?<\/defs>/, "");
    var nebe = (vnitrek.match(/linearGradient id="([^"]+)"/) || [])[1];
    var defs = (vnitrek.match(/<defs>.*?<\/defs>/) || [""])[0];
    // kopie se o kousek překrývají, ať na švech nejsou vidět čáry
    return '<svg class="svet-svg" viewBox="-400 0 1200 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + defs +
      '<rect x="-400" width="1200" height="700" fill="url(#' + nebe + ')"/>' +
      '<g class="zrcadlo" transform="matrix(-1 0 0 1 1.5 0)">' + bezDefs + "</g>" +
      '<g class="zrcadlo" transform="matrix(-1 0 0 1 798.5 0)">' + bezDefs + "</g>" + bezDefs + "</svg>";
  }

  /* Kamarádi z výletů: hříbě a poník jsou menší koně, kočka sedí. */
  function kamarad(k) {
    if (k === "hribe") return kun({ srst: "ryzak", hriva: "svetla", odznak: "hvezda" });
    if (k === "ponik") return kun({ srst: "strakac", hriva: "tmava", odznak: "lysina" });
    return '<svg class="kocka-svg" viewBox="0 0 120 120" aria-label="kočka">' +
      '<defs><radialGradient id="kockaG" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f0a35e"/><stop offset="1" stop-color="#b8692c"/></radialGradient></defs>' +
      '<ellipse cx="62" cy="112" rx="34" ry="5" fill="#000" opacity=".15"/>' +
      '<path d="M88 104 C 112 102, 114 76, 100 70" stroke="#b8692c" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<path d="M36 108 C 30 84, 36 62, 56 56 C 76 52, 92 66, 92 90 C 92 104, 86 110, 76 110z" fill="url(#kockaG)"/>' +
      '<path d="M48 70 C 56 74, 64 74, 72 70 M44 84 C 54 88, 66 88, 78 84" stroke="#a35a22" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>' +
      '<ellipse cx="60" cy="40" rx="24" ry="21" fill="url(#kockaG)"/>' +
      '<path d="M40 30 L 38 8 L 54 22z M80 30 L 82 8 L 66 22z" fill="#c8773a"/><path d="M42 26 L 41 14 L 50 22z M78 26 L 79 14 L 70 22z" fill="#f2b8a8"/>' +
      '<path d="M50 38 C 52 34, 56 34, 57 38 C 56 41, 52 41, 50 38z M63 38 C 64 34, 68 34, 70 38 C 68 41, 64 41, 63 38z" fill="#5c8a3a"/><path d="M53.5 35.5 v5 M66.5 35.5 v5" stroke="#1c1c1c" stroke-width="1.8"/>' +
      '<path d="M57 46 L 63 46 L 60 49z" fill="#e88a8a"/><path d="M60 49 C 58 53, 54 53, 52 51 M60 49 C 62 53, 66 53, 68 51" stroke="#6b3a1a" stroke-width="1.4" fill="none"/>' +
      '<path d="M44 46 L 26 44 M44 49 L 27 51 M76 46 L 94 44 M76 49 L 93 51" stroke="#fff" stroke-width="1" opacity=".8"/>' +
      '<path d="M48 108 C 48 98, 54 96, 56 108 M64 108 C 64 98, 70 96, 72 108" fill="#f0a35e" stroke="#a35a22" stroke-width="1.5"/></svg>';
  }

  /* Stáj z obchodu */
  function staj(kdo) {
    var drevo = kdo === "julinka" ? "#c0503f" : "#8a5a36", tmave = odstin(drevo, -0.3);
    return '<svg class="staj-svg" viewBox="0 0 200 160" aria-label="stáj">' +
      '<path d="M10 70 L 100 18 L 190 70z" fill="' + tmave + '"/><path d="M4 74 L 100 16 L 196 74" stroke="#5a3a22" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<rect x="20" y="70" width="160" height="84" fill="' + drevo + '"/>' +
      [30, 50, 70, 90, 110, 130, 150, 170].map(function (x) { return '<line x1="' + x + '" y1="72" x2="' + x + '" y2="152" stroke="' + tmave + '" stroke-width="1.5" opacity=".5"/>'; }).join("") +
      '<rect x="74" y="94" width="52" height="60" fill="#f4e6cc"/><path d="M74 94 L 126 154 M126 94 L 74 154" stroke="' + drevo + '" stroke-width="5"/><rect x="74" y="94" width="52" height="60" fill="none" stroke="#5a3a22" stroke-width="3"/>' +
      '<rect x="88" y="42" width="24" height="20" fill="#f4e6cc" stroke="#5a3a22" stroke-width="3"/>' +
      '<rect x="30" y="92" width="30" height="22" fill="#2a2420"/><rect x="140" y="92" width="30" height="22" fill="#2a2420"/>' +
      '<path d="M30 112 h30 M140 112 h30" stroke="#5a3a22" stroke-width="3"/><path d="M14 154 h172" stroke="#5a3a22" stroke-width="4"/></svg>';
  }

  window.GRAFIKA = { kun: kun, ikona: ikona, svet: svet, svetSiroky: svetSiroky, kamarad: kamarad, staj: staj, SRST: SRST, HRIVA: HRIVA, ODZNAK: ODZNAK, odstin: odstin };
})();
