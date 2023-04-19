// Establish a connection with the content script
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const port = chrome.runtime.connect(tabs[0].id, { name: 'popupToContent' });
  
    function pastePromptToTextarea(promptText) {
      // Send a message to the content script using the established connection
      port.postMessage({ action: 'pastePrompt', promptText: promptText });
    }
  
    // Rest of the popup.js code remains the same
  });

  function pastePrompt() {
    chrome.storage.local.get(['savedPrompts'], function (result) {
      const container = document.getElementById('popup-content');
      container.innerHTML = '';
  
      if (result.savedPrompts && result.savedPrompts.length > 0) {
        // Create a list of saved prompts in the popup UI
        const savedPromptsList = document.createElement('ul');
        savedPromptsList.classList.add('saved-prompts-list');
  
        result.savedPrompts.forEach((prompt, index) => {
          const promptItem = document.createElement('li');
          promptItem.classList.add('prompt-item');
  
          const promptText = document.createElement('span');
          promptText.classList.add('prompt-text');
          promptText.innerText = prompt;
          promptText.addEventListener('click', () => {
            pastePromptToTextarea(prompt);
          });

           // Truncate any prompt longer than 200 characters
            const truncatedPrompt = prompt.length > 200 ? prompt.substring(0, 200) + '...' : prompt;

            promptText.innerText = truncatedPrompt;
            promptText.title = prompt; // Add the full prompt text as a tooltip
            promptText.addEventListener('click', () => {
                pastePromptToTextarea(prompt);
            });
  
          const deleteButton = document.createElement('button');
          deleteButton.classList.add('delete-button');
          deleteButton.innerText = 'Delete';
          deleteButton.addEventListener('click', () => {
            deletePrompt(index);
          });
  
          promptItem.appendChild(promptText);
          promptItem.appendChild(deleteButton);
          savedPromptsList.appendChild(promptItem);
        });
  
        container.appendChild(savedPromptsList);
      } else {
        // Display a message when there are no saved prompts
        const noPromptsMessage = document.createElement('p');
        noPromptsMessage.innerText = "It looks like you don't have any prompts saved. Try saving a prompt to get started!";
        container.appendChild(noPromptsMessage);
      }
    });
  }
  
  function pastePromptToTextarea(promptText) {
    // Send message to the content script to paste the prompt
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'pastePrompt', promptText: promptText });
    });
  }

  function deletePrompt(promptIndex) {
    chrome.storage.local.get(['savedPrompts'], function (result) {
      if (result.savedPrompts && result.savedPrompts.length > 0) {
        // Remove the prompt from the saved prompts array
        result.savedPrompts.splice(promptIndex, 1);
  
        // Save the updated prompts array back to the local storage
        chrome.storage.local.set({ 'savedPrompts': result.savedPrompts }, function () {
          // Refresh the list of prompts in the popup UI
          pastePrompt();
        });
      } else {
        alert('No saved prompts found. Please save prompts first.');
      }
    });
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    pastePrompt();
  });



