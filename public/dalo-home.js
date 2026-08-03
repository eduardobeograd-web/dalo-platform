(() => {
  function initializeQuiz() {
    const form = document.querySelector("[data-dalo-quiz]");
    if (!form || form.dataset.initialized === "true") return;
    form.dataset.initialized = "true";

    const countryInput = form.querySelector("[data-quiz-country]");
    const destinationList = form.querySelector("[data-quiz-destinations]");
    const submitButton = form.querySelector("[data-quiz-submit]");
    const exactInput = form.querySelector("[data-quiz-exact]");
    const exactRadio = form.querySelector("[data-quiz-exact-radio]");
    const messages = {
      empty: form.querySelector('[data-quiz-message="empty"]'),
      invalid: form.querySelector('[data-quiz-message="invalid"]'),
      valid: form.querySelector('[data-quiz-message="valid"]'),
    };
    let destinations = [];
    let destinationsRequested = false;

    function setMessage(name) {
      Object.entries(messages).forEach(([key, element]) => {
        element?.classList.toggle("hidden", key !== name);
      });
    }

    function validateDestination() {
      const value = countryInput.value.trim();
      const available = value.length > 0 &&
        (destinations.length === 0 || destinations.includes(value));
      submitButton.disabled = !available;
      setMessage(value.length === 0 ? "empty" : available ? "valid" : "invalid");
      return available;
    }

    async function loadDestinations() {
      if (destinationsRequested) return;
      destinationsRequested = true;
      try {
        const response = await fetch("/api/destinations");
        const data = await response.json();
        if (Array.isArray(data.destinations)) {
          destinations = data.destinations;
          const fragment = document.createDocumentFragment();
          destinations.forEach((destination) => {
            const option = document.createElement("option");
            option.value = destination;
            fragment.appendChild(option);
          });
          destinationList.replaceChildren(fragment);
          validateDestination();
        }
      } catch {
        destinationsRequested = false;
      }
    }

    const selectedCountry = new URLSearchParams(window.location.search).get("country");
    if (selectedCountry) countryInput.value = selectedCountry;

    countryInput.addEventListener("focus", loadDestinations);
    countryInput.addEventListener("input", validateDestination);
    exactInput.addEventListener("focus", () => {
      exactRadio.checked = true;
    });
    exactInput.addEventListener("input", () => {
      if (!exactInput.value) return;
      const days = Math.min(30, Math.max(1, Math.ceil(Number(exactInput.value))));
      exactInput.value = String(days);
      exactRadio.value = String(days);
      exactRadio.checked = true;
    });
    form.addEventListener("submit", (event) => {
      if (!validateDestination()) event.preventDefault();
      if (exactRadio.checked && !exactRadio.value) event.preventDefault();
    });

    validateDestination();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeQuiz, { once: true });
  } else {
    initializeQuiz();
  }
})();
