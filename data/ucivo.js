/* Učivo pro obě holčičky. Tohle je jediné místo, kde se mění, co se procvičuje.
 *
 * Každé téma:
 *   id        – krátký jedinečný název (nesmí se měnit, pod ním se ukládá pokrok)
 *   nazev     – co uvidí holčička na tlačítku
 *   ikona     – mrkev | jablko | podkova | seno | kun | hvezda
 *   druh      – jaký generátor příkladů se použije (viz js/ulohy.js):
 *                 nasobeni      – a × b, kde a je z „rady“ a b z rozsahu
 *                 deleni        – c : a, kde c = a × b (beze zbytku)
 *                 nasobilka     – směs násobení a dělení
 *                 scitani       – sčítání a odčítání (rozsah: 100 nebo 1000)
 *                 pisemne       – písemné sčítání a odčítání do 10 000
 *                 nasobeni2     – dvojciferné × jednociferné
 *                 deleni_zbytek – dělení se zbytkem
 *                 porovnani     – porovnávání a číselná osa (rozsah)
 *                 cisla10000    – čísla do 10 000
 *                 zaokrouhleni  – na desítky a stovky
 *                 zlomky        – polovina, třetina, čtvrtina…
 *                 slovni        – slovní úlohy (operace: které počty)
 *   Obtížnost u těchto témat roste sama (úroveň 1–5) podle toho, jak holčičce jdou.
 *   rady      – které řady násobilky (např. [8] nebo [8, 9])
 *   od, do    – rozsah druhého činitele (obvykle 1–10)
 *   faze      – po řadách → napřeskáčku → smíšeně (jen u násobení)
 *   zapnuto   – výchozí stav; rodič to může v aplikaci změnit
 *   pripravuje_se – téma ještě není hotové, zobrazí se jako „brzy“
 */
window.UCIVO = {
  laurinka: {
    jmeno: "Laurinka",
    trida: "4. třída",
    temata: [
      { id: "nas8", nazev: "Násobilka 8", ikona: "podkova", druh: "nasobeni", rady: [8], od: 1, do: 10, faze: true, zapnuto: true },
      { id: "nas9", nazev: "Násobilka 9", ikona: "mrkev", druh: "nasobeni", rady: [9], od: 1, do: 10, faze: true, zapnuto: true, finta9: true },
      { id: "del89", nazev: "Dělení 8 a 9", ikona: "jablko", druh: "deleni", rady: [8, 9], od: 1, do: 10, zapnuto: true },
      { id: "mix89", nazev: "Osmička a devítka napřeskáčku", ikona: "hvezda", druh: "nasobilka", rady: [8, 9], od: 1, do: 10, zapnuto: true },
      { id: "malaL", nazev: "Celá malá násobilka", ikona: "seno", druh: "nasobilka", rady: [2, 3, 4, 5, 6, 7, 8, 9], od: 1, do: 10, zapnuto: true },
      { id: "pisemne", nazev: "Písemné sčítání a odčítání", ikona: "seno", druh: "pisemne", zapnuto: false },
      { id: "dvojcif", nazev: "Násobení dvojciferného čísla", ikona: "podkova", druh: "nasobeni2", zapnuto: false },
      { id: "do10000", nazev: "Čísla do 10 000", ikona: "kun", druh: "cisla10000", zapnuto: false },
      { id: "zaokr", nazev: "Zaokrouhlování", ikona: "mrkev", druh: "zaokrouhleni", zapnuto: false },
      { id: "zlomky", nazev: "Jednoduché zlomky", ikona: "jablko", druh: "zlomky", zapnuto: false },
      { id: "slovniL", nazev: "Slovní úlohy", ikona: "kun", druh: "slovni", rady: [6, 7, 8, 9], operace: ["nasobeni", "deleni", "plus", "minus"], zapnuto: true }
    ]
  },
  julinka: {
    jmeno: "Julinka",
    trida: "3. třída",
    temata: [
      { id: "nas6", nazev: "Násobilka 6", ikona: "mrkev", druh: "nasobeni", rady: [6], od: 1, do: 10, faze: true, zapnuto: true },
      { id: "nas7", nazev: "Násobilka 7", ikona: "jablko", druh: "nasobeni", rady: [7], od: 1, do: 10, faze: true, zapnuto: true },
      { id: "nas8J", nazev: "Násobilka 8", ikona: "podkova", druh: "nasobeni", rady: [8], od: 1, do: 10, faze: true, zapnuto: true },
      { id: "nas9J", nazev: "Násobilka 9", ikona: "hvezda", druh: "nasobeni", rady: [9], od: 1, do: 10, faze: true, zapnuto: true, finta9: true },
      { id: "del6789", nazev: "Dělení 6, 7, 8, 9", ikona: "jablko", druh: "deleni", rady: [6, 7, 8, 9], od: 1, do: 10, zapnuto: true },
      { id: "malaJ", nazev: "Malá násobilka napřeskáčku", ikona: "seno", druh: "nasobilka", rady: [2, 3, 4, 5, 6, 7, 8, 9], od: 1, do: 10, zapnuto: true },
      { id: "scit100", nazev: "Sčítání a odčítání do 100", ikona: "seno", druh: "scitani", rozsah: 100, zapnuto: true },
      { id: "scit1000", nazev: "Sčítání a odčítání do 1000", ikona: "seno", druh: "scitani", rozsah: 1000, zapnuto: true },
      { id: "zbytek", nazev: "Dělení se zbytkem", ikona: "jablko", druh: "deleni_zbytek", zapnuto: true },
      { id: "porov1000", nazev: "Porovnávání a číselná osa do 1000", ikona: "kun", druh: "porovnani", rozsah: 1000, zapnuto: true },
      { id: "slovni", nazev: "Slovní úlohy", ikona: "kun", druh: "slovni", rady: [2, 3, 4, 5, 6, 7, 8, 9], operace: ["nasobeni", "deleni", "plus", "minus"], zapnuto: true }
    ]
  }
};

/* Lekce: kolik příkladů a kolik odměn. */
window.LEKCE = {
  pocetUloh: 9,          // 8–10 příkladů, cca 3–5 minut (rodič může změnit)
  zavodSekund: 60,       // dobrovolný závod s časem
  odmenaSpravne: { mrkve: 1 },      // za každý správný příklad
  odmenaSerie: { jablka: 1 },       // za 3 správně za sebou
  odmenaLekce: { podkovy: 1 }       // za dokončenou lekci
};
