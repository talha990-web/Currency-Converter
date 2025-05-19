document.addEventListener("DOMContentLoaded", () => {
  const fromInput = document.getElementById("fromCurrency");
  const toInput = document.getElementById("toCurrency");
  const amountInput = document.getElementById("amount");
  const resultDiv = document.getElementById("result");
  const historyList = document.getElementById("history");
  let chart;

  async function getCurrencies() {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    return data.rates;
  }

  async function populateCurrencyInputs() {
    const currencies = await getCurrencies();
    const currencyList = Object.keys(currencies);

    new Awesomplete(fromInput, {
      list: currencyList,
      minChars: 1,
      autoFirst: true,
    });

    new Awesomplete(toInput, {
      list: currencyList,
      minChars: 1,
      autoFirst: true,
    });
  }

  async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const from = fromInput.value.toUpperCase();
    const to = toInput.value.toUpperCase();

    if (isNaN(amount) || amount <= 0 || !from || !to) {
      resultDiv.innerHTML = "🔴 Enter a valid amount and select currencies";
      return;
    }

    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const data = await res.json();
      const rate = data.rates[to];
      const converted = (rate * amount).toFixed(2);
      resultDiv.innerHTML = `💱 ${amount} ${from} = <strong>${converted} ${to}</strong>`;

      addToHistory(`${amount} ${from} ➡️ ${converted} ${to}`);
      drawChart(from, to, rate);
    } catch {
      resultDiv.innerHTML = "⚠️ Error fetching conversion rate";
    }
  }

  function addToHistory(entry) {
    const li = document.createElement("li");
    li.textContent = `${new Date().toLocaleTimeString()}: ${entry}`;
    historyList.prepend(li);

    const history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    history.unshift(li.textContent);
    localStorage.setItem("conversionHistory", JSON.stringify(history.slice(0, 10)));
  }

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    history.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      historyList.appendChild(li);
    });
  }

  function clearHistory() {
    localStorage.removeItem("conversionHistory");
    historyList.innerHTML = ''; 
  }

  function drawChart(from, to, baseRate) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
    const rates = Array.from({ length: 7 }, () =>
      (baseRate + (Math.random() * 0.05 - 0.025)).toFixed(4)
    );

    if (chart) chart.destroy();
    const ctx = document.getElementById("rateChart").getContext("2d");
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: days,
        datasets: [{
          label: `${from} to ${to} Rate`,
          data: rates,
          borderColor: "#4b3f72",
          backgroundColor: "rgba(91, 117, 249, 0.2)",
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        animation: {
          duration: 1200,
          easing: "easeOutBounce"
        }
      }
    });
  }

  populateCurrencyInputs();
  loadHistory();

  window.convertCurrency = convertCurrency; 
  window.clearHistory = clearHistory; 
});
