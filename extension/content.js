(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const currentDomain = window.location.hostname;
    console.log(`Injecting interception script for domain: ${currentDomain}`);
    
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("intercept.js");

    // Ensure document.head is available before appending the script
    if (document.head) {
      document.head.appendChild(script);
    } else {
      console.error("Failed to inject script: document.head is null.");
    }
  });
})();

window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INTERCEPTED_REQUEST") {
    chrome.runtime.sendMessage({
      type: "LOAD_TO_SERVER",
      data: event.data.data,
    });
  }
});
