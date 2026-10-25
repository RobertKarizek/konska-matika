/* Interaktivní úlohy: přetahování do žlabů a pexeso. Funguje myší, prstem i klepáním. */
(function () {
  var G = window.GRAFIKA, CZ = window.CZ;

  /* Přetahování. u.pretahni = { zlaby, naKazdy, ikona } (násobení) nebo { rozdel, celkem, zlaby, ikona } (dělení).
   * Klepnutí na žlab = přesun jedné věci z hromádky. Klepnutí na věc ve žlabu ji vrátí. */
  function pretahni(el, u, hlaska, hotovo) {
    var p = u.pretahni, celkem = p.rozdel ? p.celkem : p.zlaby * p.naKazdy, naHromadce = celkem, ve = [];
    for (var i = 0; i < p.zlaby; i++) ve.push(0);
    var zlaby = "";
    for (var z = 0; z < p.zlaby; z++) zlaby += '<button class="zlab" data-z="' + z + '" aria-label="' + (z + 1) + '. žlab"><span class="zlab-obsah"></span>' + G.ikona("zlab", "zlab-ik") + '<small class="zlab-pocet">0</small></button>';
    el.innerHTML = '<div class="pretahni"><div class="hromada" aria-label="hromádka">' + '<span class="hromada-obsah"></span><small class="hromada-pocet"></small></div>' +
      '<div class="zlaby z' + Math.min(p.zlaby, 5) + '">' + zlaby + "</div></div>";
    var hromada = el.querySelector(".hromada-obsah");
    var skonceno = false;

    function kresli() {
      var h = "";
      for (var i = 0; i < Math.min(naHromadce, 45); i++) h += '<span class="vec" draggable="false">' + G.ikona(p.ikona) + "</span>";
      hromada.innerHTML = h;
      el.querySelector(".hromada-pocet").textContent = naHromadce ? "na hromádce: " + naHromadce : "hromádka je prázdná";
      el.querySelectorAll(".zlab").forEach(function (b, i) {
        var s = "";
        for (var k = 0; k < ve[i]; k++) s += '<span class="vec mala" data-zpet="' + i + '">' + G.ikona(p.ikona, "mala") + "</span>";
        b.querySelector(".zlab-obsah").innerHTML = s;
        b.querySelector(".zlab-pocet").textContent = ve[i];
        b.classList.toggle("plny", !p.rozdel && ve[i] === p.naKazdy);
      });
    }
    function pridej(i) {
      if (skonceno || naHromadce <= 0) return;
      if (!p.rozdel && ve[i] >= p.naKazdy) { hlaska("Tenhle žlab už je plný. Zkus jiný."); return; }
      ve[i]++; naHromadce--;
      if (window.ZVUK) window.ZVUK.klik();
      kresli();
      kontrola();
    }
    function kontrola() {
      if (p.rozdel) {
        if (naHromadce === 0) {
          var stejne = ve.every(function (x) { return x === ve[0]; });
          if (stejne) { skonceno = true; hotovo(); }
          else hlaska("Hromádka je prázdná, ale některé žlaby mají víc. Klepni na jablko v plnějším žlabu a vrať ho.");
        }
      } else if (ve.every(function (x) { return x === p.naKazdy; })) { skonceno = true; hotovo(); }
    }
    el.addEventListener("click", function (e) {
      var zpet = e.target.closest("[data-zpet]");
      if (zpet && !skonceno) { var i = +zpet.dataset.zpet; ve[i]--; naHromadce++; kresli(); e.stopPropagation(); return; }
      var zl = e.target.closest(".zlab");
      if (zl && !tahne) pridej(+zl.dataset.z);
    });

    // tažení z hromádky
    var tahne = false, duch = null;
    el.querySelector(".hromada").addEventListener("pointerdown", function (e) {
      if (skonceno || naHromadce <= 0 || !e.target.closest(".vec")) return;
      e.preventDefault();
      duch = document.createElement("div");
      duch.className = "duch"; duch.innerHTML = G.ikona(p.ikona);
      document.body.appendChild(duch);
      posun(e);
      tahne = true;
      document.addEventListener("pointermove", posun);
      document.addEventListener("pointerup", pust, { once: true });
    });
    function posun(e) { if (duch) { duch.style.left = e.clientX + "px"; duch.style.top = e.clientY + "px"; } }
    function pust(e) {
      document.removeEventListener("pointermove", posun);
      if (duch) { duch.remove(); duch = null; }
      var cil = document.elementFromPoint(e.clientX, e.clientY), zl = cil && cil.closest(".zlab");
      if (zl) pridej(+zl.dataset.z);
      setTimeout(function () { tahne = false; }, 0);
    }
    kresli();
  }

  /* Pexeso: u.pary = [{ a: "8 × 3", b: "24", fakt }]. */
  function pexeso(el, u, priPari, hotovo) {
    var karty = [];
    u.pary.forEach(function (p, i) { karty.push({ text: p.a, par: i }); karty.push({ text: p.b, par: i, vysledek: true }); });
    window.ULOHY.zamichat(karty);
    el.innerHTML = '<div class="pexeso">' + karty.map(function (k, i) {
      return '<button class="pex" data-i="' + i + '" aria-label="karta"><span class="pex-rub">' + G.ikona("podkova") + '</span><span class="pex-lic' + (k.vysledek ? " vysl" : "") + '">' + k.text + "</span></button>";
    }).join("") + "</div>";
    var otocene = [], nalezeno = 0, chyby = {}, zamek = false;
    el.addEventListener("click", function (e) {
      var b = e.target.closest(".pex");
      if (!b || zamek || b.classList.contains("otocena")) return;
      b.classList.add("otocena");
      if (window.ZVUK) window.ZVUK.klik();
      otocene.push(b);
      if (otocene.length < 2) return;
      var k1 = karty[+otocene[0].dataset.i], k2 = karty[+otocene[1].dataset.i];
      if (k1.par === k2.par && k1.vysledek !== k2.vysledek) {
        otocene.forEach(function (x) { x.classList.add("nalezena"); });
        priPari(u.pary[k1.par], !chyby[k1.par]);
        otocene = [];
        if (++nalezeno === u.pary.length) setTimeout(function () { hotovo(); }, 500);
      } else {
        chyby[k1.par] = chyby[k2.par] = true;
        zamek = true;
        setTimeout(function () { otocene.forEach(function (x) { x.classList.remove("otocena"); }); otocene = []; zamek = false; }, 950);
      }
    });
  }

  window.HRY = { pretahni: pretahni, pexeso: pexeso };
})();
