function addSaveButton() {
  const prompts = document.querySelectorAll('div[class*="bg-gray-800"] > .text-base > div:nth-child(2) > div:nth-child(1) > div');

  prompts.forEach((prompt) => {
    if (!prompt.querySelector('.save-prompt-btn')) {
      // Store the original prompt text
      const originalPromptText = prompt.innerText;

      const saveButton = document.createElement('button');
      saveButton.innerText = 'Save Prompt';
      saveButton.classList.add('save-prompt-btn');
      saveButton.addEventListener('click', () => savePrompt(originalPromptText));
      prompt.appendChild(saveButton);
    }
  });
}
  
  function savePrompt(promptText) {
    if (promptText) {
      // Get the existing prompts from local storage
      chrome.storage.local.get(['savedPrompts'], function (result) {
        let savedPrompts = result.savedPrompts || [];
  
        // Check if there are already 100 prompts saved
        if (savedPrompts.length >= 100) {
          alert('Maximum number of prompts (100) reached. Please remove some prompts before adding new ones.');
          return;
        }
  
        // Save the new prompt to the local storage
        savedPrompts.push(promptText);
        chrome.storage.local.set({ 'savedPrompts': savedPrompts }, function () {
          alert('Prompt saved successfully!');
        });
      });
    } else {
      alert('No prompt found to save.');
    }
  }

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'pastePrompt') {
      const textArea = document.querySelector('textarea[data-id]:not([data-id=""])');
      if (textArea) {
        textArea.value = request.promptText;
        textArea.dispatchEvent(new Event('input')); // Trigger any attached input event listeners
      } else {
        alert('No valid textarea found to paste the prompt.');
      }
    }
  });

  // Add a connection listener
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === 'popupToContent') {
      port.onMessage.addListener(function (request) {
        if (request.action === 'pastePrompt') {
          const textArea = document.querySelector('textarea[data-id]:not([data-id=""])');
          if (textArea) {
            textArea.value = request.promptText;
            textArea.dispatchEvent(new Event('input')); // Trigger any attached input event listeners
          } else {
            alert('No valid textarea found to paste the prompt.');
          }
        }
      });
    }
  });
  
  setInterval(addSaveButton, 100);