/* ============================================================
   WISSELKOERS IN DE VOETTEKST (geldt voor alle pagina's)
   Haalt de officiële referentiekoers van de Europese Centrale
   Bank (ECB) op via de gratis dienst Frankfurter. De ECB werkt
   deze koers elke werkdag rond 16.00 uur bij.
   Lukt het ophalen niet, dan verschijnt het blokje gewoon niet.
   Zie de privacypagina voor wat dit voor bezoekers betekent.
   ============================================================ */
(function () {
  var kolommen = document.querySelector(".voettekst-kolommen");
  if (!kolommen) { return; }

  var adressen = [
    "https://api.frankfurter.dev/v1/latest?from=EUR&to=SEK",
    "https://api.frankfurter.app/latest?from=EUR&to=SEK"
  ];

  // Geen API-sleutel of wachtwoord nodig: Frankfurter is een openbare dienst.
  // Na 5 seconden zonder antwoord wordt het opgegeven, zodat de site nooit blijft hangen.
  function haalKoers(i) {
    if (i >= adressen.length) { return Promise.reject(new Error("geen koers")); }
    var controle = ("AbortController" in window) ? new AbortController() : null;
    var wekker = controle ? setTimeout(function () { controle.abort(); }, 5000) : null;
    return fetch(adressen[i], controle ? { signal: controle.signal } : {})
      .then(function (r) { if (!r.ok) { throw new Error("fout"); } return r.json(); })
      .finally(function () { if (wekker) { clearTimeout(wekker); } })
      .catch(function () { return haalKoers(i + 1); });
  }

  // Getallen in Nederlandse notatie (komma als decimaalteken)
  function getal(waarde, decimalen) {
    return waarde.toLocaleString("nl-NL", { minimumFractionDigits: decimalen, maximumFractionDigits: decimalen });
  }
  function leesGetal(tekst) {
    return parseFloat(String(tekst).replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
  }

  // Het invoerblok (EUR en SEK)
  function rekenHtml() {
    return '<div class="koers-reken">' +
      '<label><span>EUR</span><input type="text" inputmode="decimal" class="koers-eur" value="10" aria-label="Bedrag in euro"></label>' +
      '<span class="koers-pijl" aria-hidden="true">⇄</span>' +
      '<label><span>SEK</span><input type="text" inputmode="decimal" class="koers-sek" aria-label="Bedrag in Zweedse kronor"></label>' +
      '</div>';
  }

  function koppelRekenaar(blok, koers) {
    var eur = blok.querySelector(".koers-eur");
    var sek = blok.querySelector(".koers-sek");
    sek.value = getal(10 * koers, 2);
    eur.addEventListener("input", function () {
      var w = leesGetal(eur.value);
      sek.value = isNaN(w) ? "" : getal(w * koers, 2);
    });
    sek.addEventListener("input", function () {
      var w = leesGetal(sek.value);
      eur.value = isNaN(w) ? "" : getal(w / koers, 2);
    });
  }

  haalKoers(0).then(function (data) {
    var koers = data && data.rates && data.rates.SEK;
    if (!koers || typeof koers !== "number" || koers <= 0 || !data.date) { throw new Error("geen koers"); }

    var d = data.date.split("-").map(Number);
    var datum = new Date(d[0], d[1] - 1, d[2])
      .toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

    var blok = document.createElement("div");
    blok.className = "voettekst-koers";
    blok.innerHTML =
      '<h2>Wisselkoers</h2>' +
      '<div class="koers-regels">' +
        '<p class="koers-regel">1 euro = <strong>' + getal(koers, 2) + '</strong> kronor</p>' +
        '<p class="koers-regel">1 krona = <strong>' + getal(1 / koers, 3) + '</strong> euro</p>' +
      '</div>' + rekenHtml() +
      '<p class="koers-bron">ECB-referentiekoers van ' + datum + '</p>';
    kolommen.appendChild(blok);
    kolommen.classList.add("met-koers");   // de voettekst krijgt dan een vierde kolom (zie style.css)
    koppelRekenaar(blok, koers);
  }).catch(function () {
    /* geen koers: het blokje blijft weg */
  });
})();
