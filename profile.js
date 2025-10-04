document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    
    const profileTabs = document.querySelectorAll('.profile-tab');
    profileTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        profileTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const tabName = this.getAttribute('data-tab');
        switchProfileTab(tabName);
      });
    });
    
    const sensitivitySliders = document.querySelectorAll('.sensitivity-slider input');
    sensitivitySliders.forEach(slider => {
      slider.addEventListener('input', function() {
        updateSensitivityValue(this);
      });
    });
    
    document.querySelector('.change-avatar-btn').addEventListener('click', function() {
      alert('In a real implementation, this would open a file picker to change your profile photo.');
    });
    
    document.querySelector('.add-condition-btn').addEventListener('click', function() {
      addHealthCondition();
    });
    
    document.querySelector('.add-activity-btn').addEventListener('click', function() {
      addActivity();
    });
  });
  
  function initializeProfile() {
    console.log('Profile initialized');
    
    const sensitivitySliders = document.querySelectorAll('.sensitivity-slider input');
    sensitivitySliders.forEach(slider => {
      updateSensitivityValue(slider);
    });
  }
  
  function switchProfileTab(tabName) {
    console.log(`Switching to profile tab: ${tabName}`);
    
    const allSections = document.querySelectorAll('.profile-section');
    allSections.forEach(section => {
      section.classList.remove('active');
    });
    
    const activeSection = document.getElementById(`${tabName}-profile`);
    if (activeSection) {
      activeSection.classList.add('active');
    } else {
      alert(`The ${tabName} section would be shown here in a real implementation.`);
    }
  }
  
  function updateSensitivityValue(slider) {
    const value = slider.value;
    const valueDisplay = slider.parentElement.nextElementSibling;
    
    let textValue;
    switch(parseInt(value)) {
      case 1:
        textValue = 'Very Low';
        break;
      case 2:
        textValue = 'Low';
        break;
      case 3:
        textValue = 'Medium';
        break;
      case 4:
        textValue = 'High';
        break;
      case 5:
        textValue = 'Very High';
        break;
      default:
        textValue = 'Medium';
    }
    
    valueDisplay.textContent = textValue;
    
    const percent = (value - 1) / 4 * 100;
    slider.style.background = `linear-gradient(to right, var(--primary-purple) 0%, var(--primary-purple) ${percent}%, var(--bg-black) ${percent}%, var(--bg-black) 100%)`;
  }
  
  function addHealthCondition() {
    const conditionName = prompt('Enter health condition:');
    if (!conditionName || conditionName.trim() === '') return;
    
    const conditionsContainer = document.querySelector('.condition-tags');
    const addButton = document.querySelector('.add-condition-btn');
    
    const newCondition = document.createElement('span');
    newCondition.className = 'condition-tag';
    newCondition.textContent = conditionName;
    
    conditionsContainer.insertBefore(newCondition, addButton);
  }
  
  function addActivity() {
    const activityName = prompt('Enter activity name:');
    if (!activityName || activityName.trim() === '') return;
    
    const frequency = prompt('Enter frequency (e.g., "2x per week"):');
    if (!frequency || frequency.trim() === '') return;
    
    const activitiesContainer = document.querySelector('.activity-levels');
    const addButton = document.querySelector('.add-activity-btn');
    
    const newActivity = document.createElement('div');
    newActivity.className = 'activity-item';
    
    const icons = ['🏃', '🚴', '🧘', '🏊', '🏋️', '⚽', '🎾', '🏀', '🏐', '🏈'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    
    newActivity.innerHTML = `
      <span class="activity-icon">${randomIcon}</span>
      <span class="activity-label">${activityName}</span>
      <span class="activity-frequency">${frequency}</span>
    `;
    
    activitiesContainer.insertBefore(newActivity, addButton);
  }
  