document.addEventListener('DOMContentLoaded', () => {
    const groupNameInput = document.getElementById('groupName');
    const saveBtn = document.getElementById('saveBtn');
    const groupsDiv = document.getElementById('groups');
  
    saveBtn.addEventListener('click', () => {
      const groupName = groupNameInput.value.trim();
      if (!groupName) return;
  
      chrome.storage.local.get({ savedGroups: {} }, (data) => {
        if (data.savedGroups[groupName]) {
          const confirmOverwrite = confirm(`Group \"${groupName}\" already exists. Do you want to overwrite it?`);
          if (!confirmOverwrite) return;
        }
  
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          const urls = tabs.map(tab => tab.url);
          data.savedGroups[groupName] = urls;
          chrome.storage.local.set({ savedGroups: data.savedGroups }, () => {
            groupNameInput.value = '';
            renderGroups();
          });
        });
      });
    });
  
    function renderGroups() {
      chrome.storage.local.get({ savedGroups: {} }, (data) => {
        groupsDiv.innerHTML = '';
        for (let group in data.savedGroups) {
          const div = document.createElement('div');
          div.className = 'group';
          div.innerHTML = `
            <div class="group-title">${group}</div>
            <button data-action="open" data-group="${group}">Open</button>
            <button data-action="rename" data-group="${group}">Rename</button>
            <button data-action="delete" data-group="${group}">Delete</button>
          `;
          groupsDiv.appendChild(div);
        }
      });
    }
  
    groupsDiv.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action');
      const group = e.target.getAttribute('data-group');
      if (!action || !group) return;
  
      chrome.storage.local.get({ savedGroups: {} }, (data) => {
        if (action === 'open') {
          const urls = data.savedGroups[group];
          chrome.windows.create({ url: urls });
        } else if (action === 'delete') {
          delete data.savedGroups[group];
          chrome.storage.local.set({ savedGroups: data.savedGroups }, renderGroups);
        } else if (action === 'rename') {
          const newName = prompt('Enter new group name:', group);
          if (!newName || newName === group) return;
          if (data.savedGroups[newName]) {
            alert(`Group name \"${newName}\" already exists. Choose a different name.`);
            return;
          }
          data.savedGroups[newName] = data.savedGroups[group];
          delete data.savedGroups[group];
          chrome.storage.local.set({ savedGroups: data.savedGroups }, renderGroups);
        }
      });
    });
  
    renderGroups();
  });