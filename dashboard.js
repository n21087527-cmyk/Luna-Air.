
document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
  
  const dateBtns = document.querySelectorAll('.date-btn');
  dateBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      dateBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const dateRange = this.textContent;
      updateDashboardData(dateRange);
    });
  });
  
  createPlaceholderChart();
});

function initializeDashboard() {
  console.log('Dashboard initialized');
  
  const pollutantBars = document.querySelectorAll('.pollutant-bar');
  pollutantBars.forEach(bar => {
    const valueBar = bar.querySelector('.bar');
    const width = valueBar.style.width;
    
    valueBar.style.width = '0';
    
    setTimeout(() => {
      valueBar.style.transition = 'width 1s ease-in-out';
      valueBar.style.width = width;
    }, 100);
  });
}

function updateDashboardData(dateRange) {
  console.log(`Updating dashboard data for: ${dateRange}`);
  
  const aqiValue = document.querySelector('.aqi-value');
  const currentValue = parseInt(aqiValue.textContent);
  
  let newValue;
  switch(dateRange) {
    case 'Today':
      newValue = 75;
      break;
    case 'Week':
      newValue = 82;
      break;
    case 'Month':
      newValue = 68;
      break;
    case 'Custom':
      newValue = 70;
      break;
    default:
      newValue = 75;
  }
  
  animateNumber(aqiValue, currentValue, newValue, 1000);
  
  const aqiStatus = document.querySelector('.aqi-status');
  if (newValue <= 50) {
    aqiStatus.textContent = 'Good';
    aqiStatus.className = 'aqi-status good';
    aqiStatus.style.backgroundColor = 'var(--status-good)';
  } else if (newValue <= 100) {
    aqiStatus.textContent = 'Moderate';
    aqiStatus.className = 'aqi-status moderate';
    aqiStatus.style.backgroundColor = 'var(--status-moderate)';
  } else if (newValue <= 150) {
    aqiStatus.textContent = 'Unhealthy for Sensitive Groups';
    aqiStatus.className = 'aqi-status unhealthy-sensitive';
    aqiStatus.style.backgroundColor = '#4CC9F0';
  } else {
    aqiStatus.textContent = 'Unhealthy';
    aqiStatus.className = 'aqi-status unhealthy';
    aqiStatus.style.backgroundColor = 'var(--status-poor)';
  }
  
  updateChartForDateRange(dateRange);
}

function animateNumber(element, start, end, duration) {
  let startTime = null;
  
  function animation(currentTime) {
    if (startTime === null)Time = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    const value = Math.floor(start + (end - start) * progress);
    element.textContent = value;
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }
  
  requestAnimationFrame(animation);
}

function createPlaceholderChart() {
  const chartContainer = document.querySelector('.chart-placeholder');
  const chartLines = chartContainer.querySelectorAll('.chart-line');
  
  chartLines.forEach(line => {
    line.style.backgroundColor = 'var(--primary-purple)';
    line.style.width = '10%';
    line.style.margin = '0 2%';
    line.style.borderRadius = '4px 4px 0 0';
    line.style.height = '0';
    
    setTimeout(() => {
      line.style.transition = 'height 1s ease-in-out';
      line.style.height = line.style.height;
    }, 100);
  });
}

function updateChartForDateRange(dateRange) {
  const chartLines = document.querySelectorAll('.chart-line');
  const chartLabels = document.querySelector('.chart-labels').querySelectorAll('span');
  
  let newHeights = [];
  let newLabels = [];
  
  switch(dateRange) {
    case 'Today':
      newHeights = ['20%', '30%', '45%', '60%', '75%', '50%', '35%'];
      newLabels = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', 'Now'];
      break;
    case 'Week':
      newHeights = ['40%', '60%', '75%', '50%', '35%', '45%', '55%'];
      newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      break;
    case 'Month':
      newHeights = ['50%', '40%', '60%', '70%', '55%', '45%', '65%'];
      newLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
      break;
    case 'Custom':
      newHeights = ['45%', '55%', '65%', '40%', '50%', '60%', '70%'];
      newLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
      break;
    default:
      newHeights = ['40%', '60%', '75%', '50%', '35%', '45%', '55%'];
      newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }
  
  chartLines.forEach((line, index) => {
    line.style.transition = 'height 1s ease-in-out';
    line.style.height = newHeights[index];
  });
  
  chartLabels.forEach((label, index) => {
    label.textContent = newLabels[index];
  });
}
