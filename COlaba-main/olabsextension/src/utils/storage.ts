/**
 * Store data in Chrome storage
 * @param key The key to store the data under
 * @param value The data to store
 */
export function storeData(key: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Retrieve data from Chrome storage
 * @param key The key to retrieve
 * @returns Promise resolving to the stored data
 */
export function getData(key: string): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}