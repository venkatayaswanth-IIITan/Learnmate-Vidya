import { db } from "./firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getData, storeData } from "./utils/storage";

chrome.tabs.onUpdated.addListener(async (_, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const details = await getData("experimentDetails");
    if (details) {
      try {
        await addDoc(collection(db, "experiments"), {
          sub: details.sub,
          sim: details.sim,
          cnt: details.cnt,
          url: tab.url,
          title: await fetchTitle(tab.url),
          timestamp: serverTimestamp()
        });
        console.log("User added to experiment tracking:", details);
      } catch (error) {
        console.error("Error adding document to Firestore:", error);
      }
    }
  }
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  
  if (request.action === "fetchExperimentTitle") {
    fetchTitle(request.url)
      .then(title => {
        storeData("experimentTitle", title);
        sendResponse({ success: true, title });
      })
      .catch(error => {
        console.error("Error in fetchExperimentTitle:", error);
        sendResponse({ success: false, error: error.toString() });
      });
    
    return true;
  }
});

/**
 * Fetches the title from a given URL
 * @param url The URL to fetch the title from
 * @returns Promise resolving to the title string
 */
async function fetchTitle(url: string): Promise<string> {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (currentTab && currentTab.url === url && currentTab.id) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
          const titleElement = document.querySelector(".title");
          return titleElement?.textContent?.trim() || document.title || "Unknown Experiment";
        }
      });
      
      if (results && results[0] && results[0].result) {
        return results[0].result;
      }
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const titleElement = doc.querySelector(".title");
    
    return titleElement?.textContent?.trim() || 
           doc.title || 
           "Unknown Experiment";
  } catch (error) {
    console.error("Error fetching title:", error);
    return "Unknown Experiment";
  }
}