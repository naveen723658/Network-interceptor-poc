let interceptedRequests = [];

// Listen to messages from content.js and popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "LOAD_TO_SERVER") {
    const data = message.data;
    interceptedRequests.push(data);
    console.log("Captured data:", data);
    sendResponse({ message: "Data stored locally" });
  }

  // When "Send to Server" button is clicked, send the stored data to the local server
  if (message.type === "SEND_TO_SERVER") {
    if (interceptedRequests.length === 0) {
      sendResponse({ message: "No data to send" });
      return;
    }

    fetch('http://localhost:3000/api/traffic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interceptedRequests),
    })
      .then(response => response.text())
      .then(data => {
        console.log("Data sent to server:", data);
        interceptedRequests = []; // Clear stored requests after sending
        sendResponse({ message: "Data sent successfully" });
      })
      .catch(error => {
        console.error("Error sending data to server:", error);
        sendResponse({ message: "Failed to send data" });
      });

    // Ensure the response is sent asynchronously
    return true;
  }
});
