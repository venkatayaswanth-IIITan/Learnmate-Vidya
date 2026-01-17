function storeData(key: string, value: any) {
  chrome.storage.local.set({ [key]: value }, () => {
    console.log(`Stored ${key}:`, value);
  });
}

function extractExperimentDetails() {
  const url = window.location.href;
  const params = new URLSearchParams(new URL(url).search);
  const sub = params.get("sub");
  const sim = params.get("sim");
  const cnt = params.get("cnt");

  if (sub && sim && cnt) {
    const experimentData = { sub, sim, cnt };
    storeData("experimentDetails", experimentData);
    console.log("Experiment Details Stored:", experimentData);
  }
}

extractExperimentDetails();
