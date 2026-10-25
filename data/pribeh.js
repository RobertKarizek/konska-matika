/* Příběh, výlety a obchod pro koníka. Ceny a texty jde libovolně měnit.
 * Výlet se odemkne za podkovy (podkovy se neutrácejí, jen se počítají – nic se nikdy neztratí). */
window.MISTA = [
  {
    id: "louka", nazev: "Louka", podkovy: 2, kamarad: "hribe",
    uvod: "Na louce pobíhají hříbata a mají hlad. Pomůžeš spočítat, kolik sena a mrkví potřebují?",
    konec: "Hříbata jsou najedená a jedno se k nám přidalo! Jmenuje se Puntík.",
    ulohy: ["nasobeni", "deleni", "plus"]
  },
  {
    id: "les", nazev: "Les", podkovy: 5, kamarad: "ponik",
    uvod: "V lese potkáme kováře. Potřebuje vědět, kolik podkov má připravit pro koně z celé vesnice.",
    konec: "Kovář děkuje! A z lesa s námi jde malý poník Ořech.",
    ulohy: ["nasobeni", "minus", "deleni"]
  },
  {
    id: "jezero", nazev: "Jezero", podkovy: 9, kamarad: "kocka",
    uvod: "U jezera se koně napájejí. Spočítáme, kolik kbelíků vody a jablek bude potřeba?",
    konec: "Koně se napili a kočka ze stáje, Micka, si sedla koníkovi na hřbet. Bude nás doprovázet!",
    ulohy: ["deleni", "plus", "nasobeni"]
  },
  {
    id: "drahu", nazev: "Závodní dráha", podkovy: 14, zavod: true,
    uvod: "Na závodní dráze se trénuje. Kdo chce, může si zkusit závod s časem – jen pro zábavu, bez trestů.",
    konec: "Paráda! Závodní dráha je odemčená. Závod si můžeš zahrát kdykoli.",
    ulohy: ["plus", "nasobeni", "minus"]
  },
  {
    id: "hory", nazev: "Výlet do hor", podkovy: 20,
    uvod: "Vyrážíme na velký výlet do hor! Cestou je potřeba spočítat jídlo pro všechny koně.",
    konec: "Z vrcholu je vidět celý kraj. Byl to nádherný výlet – jsi skvělá parťačka!",
    ulohy: ["nasobeni", "deleni", "plus", "minus"]
  }
];

window.KAMARADI = {
  hribe: { nazev: "hříbě Puntík" },
  ponik: { nazev: "poník Ořech" },
  kocka: { nazev: "kočka Micka" }
};

/* Obchod: cena v mrkvích a jablkách. druh = kam se věc dává (jedna od druhu může být na koníkovi). */
window.OBCHOD = [
  { id: "masle-ruz", druh: "masle", nazev: "Růžové mašle do hřívy", barva: "#ff6fa8", mrkve: 8 },
  { id: "masle-zlu", druh: "masle", nazev: "Žluté mašle do hřívy", barva: "#ffc93c", mrkve: 8 },
  { id: "ohlavka-cer", druh: "ohlavka", nazev: "Červená ohlávka", barva: "#d63c3c", mrkve: 12 },
  { id: "ohlavka-mod", druh: "ohlavka", nazev: "Modrá ohlávka", barva: "#3c7ad6", mrkve: 12 },
  { id: "deka-fia", druh: "deka", nazev: "Fialová deka", barva: "#7a5ec8", mrkve: 18, jablka: 2 },
  { id: "deka-zel", druh: "deka", nazev: "Zelená deka", barva: "#3f9e57", mrkve: 18, jablka: 2 },
  { id: "deka-cer", druh: "deka", nazev: "Červená deka s bílým lemem", barva: "#c8443a", mrkve: 18, jablka: 2 },
  { id: "kartac", druh: "kartac", nazev: "Kartáč – koník se bude lesknout", mrkve: 15, jablka: 3 },
  { id: "staj", druh: "staj", nazev: "Nová stáj s vlastním boxem", mrkve: 30, jablka: 6 }
];
