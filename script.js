document.getElementById("validate-btn").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.textContent = "Fetching data...";
  try {
    const res = await fetch(
      "https://hacker-news.firebaseio.com/v0/newstories.json"
    );
    const ids = await res.json();
    const first100Ids = ids.slice(0, 100);
    const items = await Promise.all(
      first100Ids.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
          (r) => r.json()
        )
      )
    );
    const times = items.map((item) => item.time);
    let isSorted = true;
    for (let i = 1; i < times.length; i++) {
      if (times[i] > times[i - 1]) {
        isSorted = false;
        break;
      }
    }
    output.textContent = isSorted
      ? "Success: First 100 articles are sorted from newest to oldest."
      : "Failure: Articles are not sorted correctly.";
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});
