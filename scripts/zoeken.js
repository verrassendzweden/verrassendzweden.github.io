/* ============================================================
   ZOEKFUNCTIE VAN VERRASSEND ZWEDEN (geldt voor alle pagina's)
   De zoeklijst (zoekindex) staat onderaan _layouts/standaard.html.
   Steden komen daar automatisch in uit _data/steden.yml.
   Alles gebeurt in de browser: geen externe dienst, geen cookies.
   ============================================================ */
(function () {
  var zoekveld = document.getElementById("zoekveld");
  var resultaten = document.getElementById("zoekresultaten");
  var zoekknop = document.querySelector(".zoekknop");
  var zoekblok = document.querySelector(".search");
  if (!zoekveld || !resultaten || !zoekknop || !zoekblok || typeof zoekindex === "undefined") { return; }

  // Hoofdletters en accenten negeren (zodat "linkoping" ook "Linköping" vindt)
  function normaliseer(tekst) {
    return String(tekst).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function zoek() {
    var woorden = normaliseer(zoekveld.value).split(/\s+/).filter(Boolean);
    resultaten.innerHTML = "";

    if (woorden.length === 0) {
      resultaten.hidden = true;
      return;
    }

    var treffers = zoekindex.filter(function (item) {
      var inhoud = normaliseer(item.titel + " " + item.label + " " + item.tekst);
      return woorden.every(function (w) { return inhoud.indexOf(w) !== -1; });
    });

    if (treffers.length === 0) {
      var geen = document.createElement("li");
      geen.className = "geen";
      geen.textContent = "Niets gevonden. Probeer een ander woord.";
      resultaten.appendChild(geen);
    } else {
      treffers.slice(0, 10).forEach(function (item) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = item.url;
        var label = document.createElement("span");
        label.className = "zoek-label";
        label.textContent = item.label;
        a.appendChild(label);
        a.appendChild(document.createTextNode(item.titel));
        li.appendChild(a);
        resultaten.appendChild(li);
      });
    }
    resultaten.hidden = false;
  }

  function zetZoekveld(open) {
    zoekblok.classList.toggle("open", open);
    zoekknop.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { zoekveld.focus(); } else { resultaten.hidden = true; }
  }

  zoekveld.addEventListener("input", zoek);

  // Enter opent het eerste resultaat, Escape sluit het zoekveld
  zoekveld.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var eerste = resultaten.querySelector("a");
      if (eerste) { window.location.href = eerste.href; }
    }
    if (e.key === "Escape") { zetZoekveld(false); zoekknop.focus(); }
  });

  zoekknop.addEventListener("click", function () {
    zetZoekveld(!zoekblok.classList.contains("open"));
  });

  // Sluiten als je ergens anders klikt
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search")) { zetZoekveld(false); }
  });
})();
