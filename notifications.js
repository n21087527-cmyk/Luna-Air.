// 🔔 Luna Air Notifications - Interactive Buttons
console.log('🔔 Notifications.js loaded');

document.addEventListener('DOMContentLoaded', function() {
  
  // ========== MARK ALL AS READ BUTTON ==========
  const markAllReadBtn = document.getElementById('mark-all-read');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', function() {
      const unreadNotifications = document.querySelectorAll('.notification-item.unread');
      unreadNotifications.forEach(notification => {
        notification.classList.remove('unread');
      });
      
      // Update notification count
      updateNotificationCount();
      
      // Show success message
      showToast('✅ All notifications marked as read');
    });
  }
  
  // ========== FILTER BUTTONS ==========
  const filterButtons = document.querySelectorAll('.filter-btn');
  const notificationItems = document.querySelectorAll('.notification-item');
  const emptyState = document.getElementById('empty-state');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      let visibleCount = 0;
      
      // Filter notifications
      notificationItems.forEach(item => {
        if (filter === 'all') {
          item.style.display = 'flex';
          visibleCount++;
        } else {
          if (item.getAttribute('data-type') === filter) {
            item.style.display = 'flex';
            visibleCount++;
          } else {
            item.style.display = 'none';
          }
        }
      });
      
      // Show/hide empty state
      if (visibleCount === 0) {
        document.querySelector('.notifications-list').style.display = 'none';
        emptyState.style.display = 'block';
      } else {
        document.querySelector('.notifications-list').style.display = 'flex';
        emptyState.style.display = 'none';
      }
    });
  });
  
  // ========== DISMISS BUTTONS ==========
  const dismissButtons = document.querySelectorAll('.dismiss-btn');
  dismissButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const notificationItem = this.closest('.notification-item');
      
      // Fade out animation
      notificationItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      notificationItem.style.opacity = '0';
      notificationItem.style.transform = 'translateX(100px)';
      
      setTimeout(() => {
        notificationItem.remove();
        updateNotificationCount();
        checkIfEmpty();
      }, 300);
    });
  });
  
  // ========== PRIMARY ACTION BUTTONS ==========
  const primaryButtons = document.querySelectorAll('.notification-actions .btn-primary');
  primaryButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const notificationItem = this.closest('.notification-item');
      const notificationTitle = notificationItem.querySelector('h3').textContent;
      const notificationType = notificationItem.getAttribute('data-type');
      
      // Mark as read
      notificationItem.classList.remove('unread');
      updateNotificationCount();
      
      // Handle different action types
      if (button.textContent.includes('View Details') || button.textContent.includes('View Map')) {
        window.location.href = 'map.html';
      } else if (button.textContent.includes('Explore') || button.textContent.includes('View Location')) {
        window.location.href = 'dashboard.html';
      } else if (button.textContent.includes('Learn More')) {
        window.location.href = 'resources.html';
      } else if (button.textContent.includes('Set Reminder')) {
        showToast('⏰ Reminder set successfully!');
      } else {
        showToast(`✅ Action completed for: ${notificationTitle}`);
      }
    });
  });
  
  // ========== PAGINATION BUTTONS ==========
  const paginationButtons = document.querySelectorAll('.pagination-btn');
  paginationButtons.forEach(button => {
    button.addEventListener('click', function() {
      paginationButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      showToast('📄 Page ' + this.textContent + ' loaded');
    });
  });
  
  // ========== SETTINGS BUTTON ==========
  const settingsBtn = document.querySelector('.notification-actions .btn-secondary:last-child');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
      showToast('⚙️ Notification settings coming soon!');
    });
  }
  
  // ========== EMPTY STATE REFRESH BUTTON ==========
  const refreshBtn = document.querySelector('.empty-state .btn-primary');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      location.reload();
    });
  }
  
  // ========== HELPER FUNCTIONS ==========
  
  function updateNotificationCount() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const notificationCountElement = document.querySelector('.notification-count');
    
    if (notificationCountElement) {
      if (unreadCount === 0) {
        notificationCountElement.style.display = 'none';
      } else {
        notificationCountElement.style.display = 'flex';
        notificationCountElement.textContent = unreadCount;
      }
    }
  }
  
  function checkIfEmpty() {
    const remainingNotifications = document.querySelectorAll('.notification-item').length;
    const emptyState = document.getElementById('empty-state');
    const notificationsList = document.querySelector('.notifications-list');
    
    if (remainingNotifications === 0) {
      notificationsList.style.display = 'none';
      emptyState.style.display = 'block';
    }
  }
  
  function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: linear-gradient(135deg, #8A2BE2, #5D1A9E);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(138, 43, 226, 0.5);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-size: 0.95rem;
      font-weight: 500;
    `;
    toast.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // Initialize notification count
  updateNotificationCount();
  
  console.log('✅ All notification buttons are now functional!');
});

console.log('✅ Notifications functionality ready');




















































































































































































































































































































































































































































































