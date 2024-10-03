// Get the current active tab's domain
document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const url = new URL(currentTab.url);
    const domain = url.hostname;

    // Save the domain to chrome storage and display it in the popup
    chrome.storage.local.set({ interceptDomain: domain }, () => {
      console.log(`Intercepting requests for domain: ${domain}`);
      document.getElementById("currentDomain").textContent = domain;
    });
  });
});

// Add event listener for the "Send to Server" button
document.getElementById("sendData").addEventListener("click", () => {
  // Trigger sending the captured data to the server
  chrome.runtime.sendMessage({ type: "SEND_TO_SERVER" }, (response) => {
    console.log(response.message);
  });
});
