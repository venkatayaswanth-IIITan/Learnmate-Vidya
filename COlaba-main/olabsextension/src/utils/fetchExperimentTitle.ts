async function fetchExperimentTitle(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const htmlText = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const titleElements = doc.querySelectorAll('.title');
    if (titleElements.length === 0) return "Unknown Experiment";

    return titleElements[0].textContent?.trim() || "Unknown Experiment";

    
  } catch (error) {
    console.error("Error fetching experiment title:", error);
    return "Unknown Experiment";
  }
}

export default fetchExperimentTitle;
