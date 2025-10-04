// 📅 Luna Air Calendar - API Integration
console.log('📅 Calendar API loaded');

const CALENDAR_API_URL = 'http://localhost:3001/api';

// ========== API FUNCTIONS ==========

// Fetch month data
async function fetchMonthData(year, month) {
  try {
    const response = await fetch(`${CALENDAR_API_URL}/calendar/${year}/${month}`);
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error('Failed to fetch month data');
    }
  } catch (error) {
    console.error('Error fetching month data:', error);
    return null;
  }
}

// Fetch day data
async function fetchDayData(year, month, day) {
  try {
    const response = await fetch(`${CALENDAR_API_URL}/calendar/${year}/${month}/${day}`);
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error('Failed to fetch day data');
    }
  } catch (error) {
    console.error('Error fetching day data:', error);
    return null;
  }
}

// Fetch week data
async function fetchWeekData(year, month, day) {
  try {
    const response = await fetch(`${CALENDAR_API_URL}/calendar/week/${year}/${month}/${day}`);
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error('Failed to fetch week data');
    }
  } catch (error) {
    console.error('Error fetching week data:', error);
    return null;
  }
}

// Fetch events
async function fetchEvents(month, year) {
  try {
    const params = month && year ? `?month=${month}&year=${year}` : '';
    const response = await fetch(`${CALENDAR_API_URL}/events${params}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error('Failed to fetch events');
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Fetch statistics
async function fetchStatistics(year, month) {
  try {
    const response = await fetch(`${CALENDAR_API_URL}/statistics/${year}/${month}`);
    const data = await response.json();
    
    if (data.success) {
      return data.statistics;
    } else {
      throw new Error('Failed to fetch statistics');
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return null;
  }
}

// Create event
async function createEvent(eventData) {
  try {
    const response = await fetch(`${CALENDAR_API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error('Failed to create event');
    }
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
}

// ========== UI UPDATE FUNCTIONS ==========

// Render calendar with API data
async function renderCalendarWithAPI(year, month) {
  const monthData = await fetchMonthData(year, month);
  
  if (!monthData) {
    console.error('Failed to load calendar data');
    return;
  }
  
  // Update month display
  const monthDisplay = document.getElementById('current-month');
  if (monthDisplay) {
    monthDisplay.textContent = `${monthData.monthName} ${year}`;
  }
  
  // Get calendar dates
  const calendarDates = document.querySelectorAll('.calendar-date:not(.other-month)');
  
  monthData.data.forEach((dayData, index) => {
    if (calendarDates[index]) {
      const dateElement = calendarDates[index];
      
      // Update AQI
      const aqiSpan = dateElement.querySelector('.aqi-indicator span');
      if (aqiSpan) {
        aqiSpan.textContent = `AQI: ${dayData.aqi}`;
      }
      
      // Update AQI dot color
      const aqiDot = dateElement.querySelector('.aqi-dot');
      if (aqiDot) {
        aqiDot.className = `aqi-dot ${dayData.category}`;
      }
      
      // Update weather icon
      const weatherIcon = dateElement.querySelector('.weather-icon');
      if (weatherIcon) {
        weatherIcon.textContent = dayData.weather;
      }
      
      // Add click handler for detailed view
      dateElement.addEventListener('click', async function() {
        const detailData = await fetchDayData(year, month, dayData.day);
        if (detailData) {
          showDayDetailModal(detailData);
        }
      });
    }
  });
  
  // Load events
  const events = await fetchEvents(month, year);
  displayEvents(events);
}

// Show day detail modal
function showDayDetailModal(dayData) {
  const modal = document.getElementById('day-detail-modal');
  if (!modal) return;
  
  // Update modal content
  const modalTitle = modal.querySelector('.modal-title');
  if (modalTitle) {
    modalTitle.textContent = `${dayData.dayOfWeek}, ${dayData.date}`;
  }
  
  // Update AQI
  const aqiDetail = modal.querySelector('.aqi-detail span');
  if (aqiDetail) {
    aqiDetail.textContent = `AQI: ${dayData.aqi} (${dayData.category.replace('-', ' ')})`;
  }
  
  const aqiDot = modal.querySelector('.aqi-detail-dot');
  if (aqiDot) {
    aqiDot.className = `aqi-detail-dot ${dayData.category}`;
  }
  
  // Update weather
  const weatherValue = modal.querySelector('.detail-item:nth-child(2) .detail-value');
  if (weatherValue) {
    weatherValue.innerHTML = `<span class="weather-icon">${dayData.weather}</span> ${dayData.temperature}°F`;
  }
  
  // Update pollutants
  const pollutantsValue = modal.querySelector('.detail-item:nth-child(3) .detail-value ul');
  if (pollutantsValue) {
    pollutantsValue.innerHTML = `
      <li>PM2.5: ${dayData.pollutants.pm25} μg/m³</li>
      <li>Ozone: ${dayData.pollutants.ozone} ppm</li>
      <li>NO2: ${dayData.pollutants.no2} ppb</li>
      <li>PM10: ${dayData.pollutants.pm10} μg/m³</li>
    `;
  }
  
  // Update health recommendation
  const healthRec = modal.querySelector('.detail-item:nth-child(4) .detail-value');
  if (healthRec) {
    healthRec.textContent = dayData.healthRecommendation;
  }
  
  modal.classList.add('active');
}

// Display events
function displayEvents(events) {
  console.log(`📅 ${events.length} events loaded for this month`);
  
  // You can add visual indicators for events on calendar dates
  events.forEach(event => {
    const eventDate = new Date(event.date);
    const day = eventDate.getDate();
    
    // Find the calendar date element
    const dateElements = document.querySelectorAll('.calendar-date');
    dateElements.forEach(el => {
      const dateNum = el.querySelector('.date-number');
      if (dateNum && parseInt(dateNum.textContent) === day) {
        // Add event indicator
        if (!el.querySelector('.event-indicator')) {
          const indicator = document.createElement('div');
          indicator.className = 'event-indicator';
          indicator.style.cssText = 'position: absolute; top: 5px; right: 5px; width: 8px; height: 8px; background: #FB8500; border-radius: 50%;';
          indicator.title = event.title;
          el.style.position = 'relative';
          el.appendChild(indicator);
        }
      }
    });
  });
}

// Update week view with API data
async function updateWeekView(year, month, day) {
  const weekData = await fetchWeekData(year, month, day);
  
  if (!weekData) {
    console.error('Failed to load week data');
    return;
  }
  
  const calendarGrid = document.querySelector('.calendar-grid');
  if (!calendarGrid) return;
  
  let weekHTML = '<div style="background: var(--bg-black-light); border-radius: 8px; padding: 1.5rem;"><h3 style="color: var(--primary-purple-light); margin-bottom: 1rem;">Week View - ' + weekData.weekStart + '</h3><div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1rem;">';
  
  weekData.data.forEach((dayData, index) => {
    const isToday = dayData.day === day;
    
    weekHTML += `<div style="background: ${isToday ? 'rgba(138, 43, 226, 0.1)' : 'var(--bg-black-dark)'}; border: 1px solid var(--primary-purple-dark); border-radius: 8px; padding: 1rem; text-align: center; cursor: pointer;">
      <div style="color: var(--text-gray); font-size: 0.85rem; margin-bottom: 0.5rem;">${dayData.dayOfWeek} ${dayData.day}</div>
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">${dayData.weather}</div>
      <div style="font-size: 0.9rem;">AQI: ${dayData.aqi}</div>
      <div style="font-size: 0.85rem; color: var(--text-gray); margin-top: 0.5rem;">${dayData.temperature}°F</div>
    </div>`;
  });
  
  weekHTML += '</div></div>';
  calendarGrid.innerHTML = weekHTML;
}

// Export functions
window.CalendarAPI = {
  fetchMonthData,
  fetchDayData,
  fetchWeekData,
  fetchEvents,
  fetchStatistics,
  createEvent,
  renderCalendarWithAPI,
  updateWeekView
};

console.log('✅ Calendar API ready');
