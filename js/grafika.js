/* Veškerá grafika jako SVG kreslené v kódu: koně, předměty, světy. */
(function () {
  var SRST = [
    { id: "hnedak", nazev: "hnědák", barva: "#a0603a" },
    { id: "ryzak", nazev: "ryzák", barva: "#d2803f" },
    { id: "plavak", nazev: "plavák", barva: "#e6c47e" },
    { id: "belous", nazev: "bělouš", barva: "#f1ece4" },
    { id: "vranik", nazev: "vraník", barva: "#4a3b3a" },
    { id: "strakac", nazev: "strakáč", barva: "#f6f1ea", skvrny: "#a0603a" },
    { id: "jablecnak", nazev: "jablečňák", barva: "#cfd3d8", puntiky: "#9aa1aa" }
  ];
  var HRIVA = [
    { id: "tmava", nazev: "tmavá", barva: "#3b2a22" },
    { id: "svetla", nazev: "světlá", barva: "#f4e2b0" },
    { id: "rezava", nazev: "rezavá", barva: "#b5542a" },
    { id: "bila", nazev: "bílá", barva: "#fbfaf7" },
    { id: "ruzova", nazev: "růžová", barva: "#f3a3c4" },
    { id: "fialova", nazev: "fialová", barva: "#b59ae8" },
    { id: "modra", nazev: "modrá", barva: "#8fc3f0" }
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

  /* Kůň z boku, hlavou doprava. kun = { srst, hriva, odznak }, vyber = doplňky (deka, masle…) */
  function kun(k, volby) {
    k = k || {};
    volby = volby || {};
    var s = najdi(SRST, k.srst), h = najdi(HRIVA, k.hriva);
    var c = s.barva, cT = odstin(c, -0.18), cS = odstin(c, 0.25), hb = h.barva, hT = odstin(hb, -0.15);
    var kopyto = "#5a4232", tvar = s.id === "vranik" ? "#2b2222" : "#3a2b25";
    var cumak = s.id === "vranik" ? "#6b5653" : odstin(c, 0.35);
    var id = "k" + (++uid);
    var lic = s.id === "vranik" ? "#d98a9a" : "#f29bb0";
    var odz = "";
    var bila = "#fffdf8";
    if (k.odznak === "hvezda") odz = '<path d="M199 33 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1z" fill="' + bila + '"/>';
    if (k.odznak === "lysina") odz = '<path d="M196 31 C 202 31, 205 40, 207 50 C 209 60, 214 66, 219 72 L 211 76 C 206 68, 202 60, 199 50 C 197 42, 193 36, 196 31z" fill="' + bila + '"/>';
    if (k.odznak === "srdce") odz = '<path d="M200 46 C 192 40, 194 32, 200 36 C 206 32, 208 40, 200 46z" fill="' + bila + '"/>';
    var skvrny = s.skvrny ? '<g fill="' + s.skvrny + '"><path d="M92 92 C 108 84, 128 92, 124 108 C 120 124, 96 122, 88 112 C 84 104, 86 96, 92 92z"/><path d="M146 118 C 156 112, 170 118, 166 130 C 160 140, 146 136, 144 128z"/><ellipse cx="186" cy="64" rx="7" ry="6"/></g>' : "";
    var puntiky = s.puntiky ? '<g fill="' + s.puntiky + '" opacity=".55"><circle cx="80" cy="104" r="5"/><circle cx="96" cy="118" r="4"/><circle cx="72" cy="122" r="4"/><circle cx="110" cy="100" r="3"/><circle cx="88" cy="96" r="3"/></g>' : "";
    var deka = volby.deka ? '<path d="M84 84 C 104 78, 140 78, 158 86 L 154 124 C 132 130, 104 130, 86 124z" fill="' + volby.deka + '" stroke="' + odstin(volby.deka, -0.25) + '" stroke-width="2"/><path d="M88 118 C 108 124, 132 124, 152 118" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 5" opacity=".8"/>' : "";
    var ohlavka = volby.ohlavka ? '<g fill="none" stroke="' + volby.ohlavka + '" stroke-width="4" stroke-linecap="round"><path d="M184 40 C 190 58, 200 70, 214 80"/><path d="M205 62 C 211 60, 219 64, 224 70"/><path d="M188 52 L 205 62"/></g><circle cx="205" cy="62" r="3" fill="#e8c35a"/>' : "";
    var masle = volby.masle ? '<g fill="' + volby.masle + '"><path d="M168 48 l-8 -6 0 12z"/><path d="M168 48 l8 -6 0 12z"/><circle cx="168" cy="48" r="3"/></g><g fill="' + volby.masle + '" transform="translate(-118 66)"><path d="M168 48 l-7 -5 0 10z"/><path d="M168 48 l7 -5 0 10z"/><circle cx="168" cy="48" r="2.5"/></g>' : "";

    return '<svg class="kun-svg" viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (k.jmeno ? "kůň " + k.jmeno : "koník") + '">' +
      '<ellipse cx="122" cy="186" rx="80" ry="8" fill="#000" opacity=".12"/>' +
      // ocas
      '<g class="ocas"><path d="M58 92 C 28 84, 14 116, 26 154 C 34 138, 38 128, 46 120 C 40 138, 44 150, 52 160 C 52 136, 58 120, 66 108z" fill="' + hb + '"/>' +
      '<path d="M54 100 C 36 104, 30 124, 34 140" stroke="' + hT + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/></g>' +
      // vzdálené nohy
      '<g class="nohy-zadni"><rect x="74" y="126" width="15" height="50" rx="7" fill="' + cT + '"/><rect x="73" y="170" width="17" height="10" rx="3" fill="' + kopyto + '"/>' +
      '<rect x="150" y="126" width="15" height="50" rx="7" fill="' + cT + '"/><rect x="149" y="170" width="17" height="10" rx="3" fill="' + kopyto + '"/></g>' +
      // tělo
      '<ellipse cx="116" cy="112" rx="62" ry="36" fill="' + c + '"/>' +
      '<ellipse cx="110" cy="100" rx="40" ry="16" fill="' + cS + '" opacity=".35"/>' +
      skvrny + puntiky + deka +
      // blízké nohy
      '<g class="nohy-predni"><rect x="90" y="128" width="16" height="50" rx="8" fill="' + c + '"/><rect x="89" y="172" width="18" height="10" rx="3" fill="' + kopyto + '"/>' +
      '<rect x="134" y="128" width="16" height="50" rx="8" fill="' + c + '"/><rect x="133" y="172" width="18" height="10" rx="3" fill="' + kopyto + '"/></g>' +
      // krk a hlava
      '<g class="hlava">' +
      '<path d="M136 96 C 146 72, 158 54, 172 42 L 200 60 C 190 78, 182 100, 172 122 C 160 124, 146 116, 136 96z" fill="' + c + '"/>' +
      '<path d="M181 30 L 185 12 L 194 31z" fill="' + c + '"/><path d="M184 28 L 186 18 L 190 29z" fill="' + odstin(c, -0.3) + '" opacity=".5"/>' +
      '<path d="M192 32 L 200 16 L 204 36z" fill="' + c + '"/>' +
      '<ellipse cx="194" cy="52" rx="25" ry="20" transform="rotate(28 194 52)" fill="' + c + '"/>' +
      '<ellipse cx="211" cy="72" rx="17" ry="13" transform="rotate(28 211 72)" fill="' + cumak + '"/>' +
      odz +
      '<ellipse cx="219" cy="74" rx="2.4" ry="3.2" fill="' + tvar + '" opacity=".7"/>' +
      '<path d="M206 82 C 210 85, 215 85, 218 82" stroke="' + tvar + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>' +
      '<ellipse cx="205" cy="62" rx="6" ry="3.5" fill="' + lic + '" opacity=".55"/>' +
      '<g class="oko"><ellipse cx="193" cy="49" rx="6.5" ry="7.5" fill="' + tvar + '"/><circle cx="195.5" cy="46" r="2.4" fill="#fff"/><circle cx="191" cy="52" r="1.1" fill="#fff" opacity=".8"/>' +
      '<path d="M187 43 l-4 -3 M190 41 l-2 -4" stroke="' + tvar + '" stroke-width="1.6" stroke-linecap="round"/></g>' +
      // hříva
      '<path d="M176 30 C 166 34, 156 46, 150 58 C 158 54, 156 62, 146 72 C 154 70, 152 78, 140 90 C 150 88, 146 96, 138 104 C 152 100, 162 84, 168 70 C 174 56, 182 44, 186 34z" fill="' + hb + '"/>' +
      '<path d="M182 30 C 190 30, 196 36, 196 42 C 190 38, 186 38, 182 40 C 184 36, 182 34, 182 30z" fill="' + hb + '"/>' +
      '<path d="M170 42 C 162 54, 156 66, 148 80" stroke="' + hT + '" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".55"/>' +
      ohlavka + masle +
      '</g></svg>';
  }

  /* Malé ikony předmětů (40 × 40) */
  var IKONY = {
    mrkev: '<path d="M20 14 C 26 14, 28 18, 26 24 L 18 37 C 17 38, 15 37, 15 36 L 14 22 C 14 17, 16 14, 20 14z" fill="#f28b2b"/><path d="M17 22 l4 1 M16 28 l4 1" stroke="#d56b12" stroke-width="1.6" stroke-linecap="round"/><path d="M20 15 C 17 8, 12 7, 11 9 C 15 10, 17 12, 19 15z M21 15 C 22 7, 27 4, 29 6 C 25 8, 23 11, 22 15z M20 15 C 20 9, 21 5, 20 3 C 18 6, 18 10, 19 15z" fill="#5cb85c"/>',
    jablko: '<path d="M20 13 C 14 8, 6 12, 7 21 C 8 31, 14 36, 20 33 C 26 36, 32 31, 33 21 C 34 12, 26 8, 20 13z" fill="#e94b4b"/><path d="M12 18 C 11 22, 12 26, 14 28" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6"/><path d="M20 13 C 20 9, 21 7, 23 5" stroke="#7a4a2a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M22 9 C 26 5, 31 6, 32 8 C 28 11, 25 11, 22 9z" fill="#5cb85c"/>',
    podkova: '<path d="M8 8 C 8 26, 12 34, 20 34 C 28 34, 32 26, 32 8 L 25 8 C 25 22, 24 27, 20 27 C 16 27, 15 22, 15 8z" fill="#b7bec8" stroke="#8a929c" stroke-width="1.5"/><g fill="#6b737c"><circle cx="11.5" cy="13" r="1.4"/><circle cx="12.5" cy="20" r="1.4"/><circle cx="28.5" cy="13" r="1.4"/><circle cx="27.5" cy="20" r="1.4"/></g><path d="M10 9 C 10 20, 12 27, 16 31" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/>',
    seno: '<rect x="6" y="12" width="28" height="20" rx="4" fill="#efcd5a"/><path d="M6 18 h28 M6 26 h28" stroke="#c9a232" stroke-width="2"/><path d="M14 12 v20 M26 12 v20" stroke="#b5462f" stroke-width="2.2"/><path d="M9 12 l-2 -3 M15 12 l1 -4 M24 12 l-1 -3 M31 12 l2 -4" stroke="#d9b440" stroke-width="1.6" stroke-linecap="round"/>',
    hvezda: '<path d="M20 5 l4.4 9.2 10 1.4 -7.3 7 1.8 10 -8.9 -4.8 -8.9 4.8 1.8 -10 -7.3 -7 10 -1.4z" fill="#ffd34d" stroke="#e8b52a" stroke-width="1.5" stroke-linejoin="round"/>',
    kun: '<path d="M12 34 C 12 24, 14 16, 20 10 L 22 4 L 25 10 C 31 12, 34 18, 33 24 L 28 26 C 26 23, 23 22, 22 24 C 22 28, 24 31, 26 34z" fill="#a0603a"/><path d="M20 10 C 16 14, 13 22, 12 30 C 16 24, 18 18, 22 13z" fill="#3b2a22"/><circle cx="26" cy="15" r="1.8" fill="#2b2222"/>',
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

  window.GRAFIKA = { kun: kun, ikona: ikona, svet: svet, svetSiroky: svetSiroky, SRST: SRST, HRIVA: HRIVA, ODZNAK: ODZNAK, odstin: odstin };
})();
