// Establish a connection with the content script
function pastePromptToTextarea(promptText) {
  // Send message to the content script to paste the prompt
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'pastePrompt', promptText: promptText });
  });
}

  function displayPrompts(prompts) {
    const container = document.getElementById('popup-content');
    container.innerHTML = '';
  
    if (prompts && prompts.length > 0) {
      prompts.forEach(function (prompt, index) {
        const promptWrapper = document.createElement('div');
        promptWrapper.classList.add('prompt-wrapper');
  
        const promptText = document.createElement('textarea');
        promptText.value = prompt;
        promptText.readOnly = true;
        promptText.wrap = 'hard';
        promptText.rows = 3;
  
        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.style.display = 'flex';
        buttonsWrapper.style.justifyContent = 'space-between';
  
        const saveBtn = document.createElement('button');
        saveBtn.innerText = 'Save Prompt';
        saveBtn.onclick = function () {
          savePrompt(prompt);
        };
  
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.onclick = function () {
          deletePrompt(index);
        };
  
        buttonsWrapper.appendChild(saveBtn);
        buttonsWrapper.appendChild(deleteBtn);
        promptWrapper.appendChild(promptText);
        promptWrapper.appendChild(buttonsWrapper);
        container.appendChild(promptWrapper);
      });
    } else {
      // Display a message when there are no saved prompts
      const noPromptsMessage = document.createElement('p');
      noPromptsMessage.innerText = "It looks like you don't have any prompts saved. Try saving a prompt to get started!";
      container.appendChild(noPromptsMessage);
    }
  }

  function createEditablePrompt(promptText, promptIndex) {
    const editablePrompt = document.createElement('input');
    editablePrompt.type = 'text';
    editablePrompt.value = promptText;
    editablePrompt.addEventListener('blur', () => {
      updatePrompt(promptIndex, editablePrompt.value);
    });
    editablePrompt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        editablePrompt.blur();
      }
    });
    return editablePrompt;
  }
  
  function updatePrompt(promptIndex, newPromptText) {
    chrome.storage.local.get(['savedPrompts'], function (result) {
      if (result.savedPrompts && result.savedPrompts.length > 0) {
        result.savedPrompts[promptIndex] = newPromptText;
        chrome.storage.local.set({ 'savedPrompts': result.savedPrompts }, function () {
          pastePrompt();
        });
      } else {
        alert('No saved prompts found. Please save prompts first.');
      }
    });
  }
  
  
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

          const editButton = document.createElement('button');
            editButton.classList.add('edit-button');
            editButton.innerText = 'Edit';
            editButton.addEventListener('click', () => {
              const editablePrompt = createEditablePrompt(prompt, index);
              promptItem.replaceChild(editablePrompt, promptText);
              editablePrompt.focus();
            });
  
          promptItem.appendChild(promptText);
          promptItem.appendChild(editButton);
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
  

  function updatePrompt(promptIndex, newPromptText) {
    chrome.storage.local.get(['savedPrompts'], function (result) {
      if (result.savedPrompts && result.savedPrompts.length > 0) {
        // Update the prompt text in the saved prompts array
        result.savedPrompts[promptIndex] = newPromptText;
  
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

  // Function for search prompt
  function searchPrompts(searchQuery) {
    chrome.storage.local.get(['savedPrompts'], function (result) {
      const container = document.getElementById('popup-content');
      container.innerHTML = '';
  
      if (result.savedPrompts && result.savedPrompts.length > 0) {
        const filteredPrompts = result.savedPrompts.filter(prompt =>
          prompt.toLowerCase().includes(searchQuery.toLowerCase())
        );
  
        if (filteredPrompts.length > 0) {
          displayPrompts(filteredPrompts);
        } else {
          const noResultsMessage = document.createElement('p');
          noResultsMessage.innerText = 'No results found for your search query.';
          container.appendChild(noResultsMessage);
        }
      } else {
        const noPromptsMessage = document.createElement('p');
        noPromptsMessage.innerText = "It looks like you don't have any prompts saved. Try saving a prompt to get started!";
        container.appendChild(noPromptsMessage);
      }
    });
  }
// Made the search function work
function searchPrompts() {
  const searchTerm = document.getElementById('search-box').value.toLowerCase();

  chrome.storage.local.get(['savedPrompts'], function (result) {
    const savedPrompts = result.savedPrompts || [];

    // Filter the prompts based on the search term
    const filteredPrompts = savedPrompts.filter(prompt =>
      prompt.toLowerCase().includes(searchTerm)
    );

    displayPrompts(filteredPrompts);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('search-button').addEventListener('click', searchPrompts);
   // Add a keyup event listener to the search input field
   const searchInput = document.getElementById('search-box');
   searchInput.addEventListener('keyup', function (event) {
     // Check if the "Enter" key was pressed
     if (event.key === 'Enter') {
       searchPrompts();
     }
   });
});


  
  document.addEventListener('DOMContentLoaded', function () {
    pastePrompt();
  });



