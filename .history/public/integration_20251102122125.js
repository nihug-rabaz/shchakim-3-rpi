// Dynamic content integration for html.html
class ShchakimIntegration {
  constructor() {
    this.apiBase = window.location.origin;
    this.themeColor = '#054a36'; // Default theme color
    this.overlayOpacity = 0.21;
    this.updateInterval = 30000; // 30 seconds
    this.clockInterval = null;
    this.init();
  }

  async init() {
    try {
      await this.loadContent();
      this.setupPeriodicUpdates();
      this.setupThemeIntegration();
      this.setupLiveClock();
    } catch (error) {
      console.error('Failed to initialize Shchakim integration:', error);
    }
  }

  setupLiveClock() {
    const clockElement = document.querySelector('.title-TP2yIe[data-id="1:24"]');
    if (!clockElement) {
      console.warn('Clock element not found');
      return;
    }

    // Update clock immediately
    this.updateClock(clockElement);

    // Update clock every second
    this.clockInterval = setInterval(() => {
      this.updateClock(clockElement);
    }, 1000);
  }

  updateClock(element) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    element.textContent = `${hours}:${minutes}:${seconds}`;
  }

  async loadContent() {
    try {
      const response = await fetch(`${this.apiBase}/api/display/content`);
      if (!response.ok) throw new Error('Failed to fetch content');
      
      const data = await response.json();
      this.content = data;
      this.themeColor = data.theme?.primaryHex || '#054a36';
      
      // Apply dynamic content
      this.updatePrayerTimes(data.prayers);
      this.updateTheme(data.theme);
      this.addSliders(data);
      this.addQRButton();
      
    } catch (error) {
      console.error('Error loading content:', error);
    }
  }

  updatePrayerTimes(prayers) {
    if (!prayers || prayers.length === 0) return;

    // Find prayer time elements and update them
    const prayerElements = document.querySelectorAll('[class*="text_label"]');
    
    prayers.forEach((prayer, index) => {
      if (prayerElements[index]) {
        const timeText = this.calculatePrayerTime(prayer);
        prayerElements[index].textContent = timeText;
        
        // Apply 21% opacity overlay to the prayer time cards
        const cardElement = prayerElements[index].closest('[class*="rectangle"]');
        if (cardElement) {
          const overlayColor = this.hexToRgba(this.themeColor, this.overlayOpacity);
          cardElement.style.backgroundColor = overlayColor;
          cardElement.style.borderRadius = '30px'; // Match the original design
        }
      }
    });
  }

  calculatePrayerTime(prayer) {
    if (prayer.timeType === 'fixed') {
      return prayer.fixedTime;
    } else if (prayer.timeType === 'relative') {
      // This would integrate with Zmanim API
      // For now, return placeholder
      return '--:--';
    }
    return '--:--';
  }

  updateTheme(theme) {
    if (!theme) return;
    
    this.themeColor = theme.primaryHex || '#054a36';
    
    // Update background color
    document.body.style.backgroundColor = this.themeColor;
    
    // Update main frame background
    const mainFrame = document.querySelector('.frame-17');
    if (mainFrame) {
      mainFrame.style.backgroundColor = this.themeColor;
    }
  }

  addSliders(data) {
    // Create pages slider for holiday prayers and Rabbi's Letter
    this.createPagesSlider(data);
    
    // Create promo slider for military orders, daily halacha, and additions
    this.createPromoSlider(data);
  }

  createPagesSlider(data) {
    const pagesContainer = document.createElement('div');
    pagesContainer.className = 'pages-slider';
    pagesContainer.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      width: 400px;
      height: 300px;
      background: ${this.hexToRgba(this.themeColor, 0.8)};
      border-radius: 10px;
      padding: 20px;
      color: white;
      z-index: 1000;
      overflow-y: auto;
    `;

    // Add Rabbi's Letter
    if (data.letter) {
      const letterDiv = document.createElement('div');
      letterDiv.innerHTML = `
        <h3>${data.letter.title}</h3>
        <div>${data.letter.html}</div>
      `;
      pagesContainer.appendChild(letterDiv);
    }

    // Add holiday prayers
    if (data.prayers) {
      const holidayPrayers = data.prayers.filter(p => p.dayOfWeek === 'holiday');
      holidayPrayers.forEach(prayer => {
        const prayerDiv = document.createElement('div');
        prayerDiv.innerHTML = `
          <h4>${prayer.title}</h4>
          <p>${this.calculatePrayerTime(prayer)}</p>
        `;
        pagesContainer.appendChild(prayerDiv);
      });
    }

    document.body.appendChild(pagesContainer);
  }

  createPromoSlider(data) {
    const promoContainer = document.createElement('div');
    promoContainer.className = 'promo-slider';
    promoContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      height: 300px;
      background: ${this.hexToRgba(this.themeColor, 0.8)};
      border-radius: 10px;
      padding: 20px;
      color: white;
      z-index: 1000;
      overflow-y: auto;
    `;

    // Add military orders
    if (data.orders) {
      data.orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.innerHTML = `
          <h4>${order.title}</h4>
          <p>${order.summary}</p>
        `;
        promoContainer.appendChild(orderDiv);
      });
    }

    // Add daily halacha
    if (data.halacha) {
      const halachaDiv = document.createElement('div');
      halachaDiv.innerHTML = `
        <h4>${data.halacha.title}</h4>
        <p>${data.halacha.summary}</p>
      `;
      promoContainer.appendChild(halachaDiv);
    }

    // Add prayer additions
    if (data.additions) {
      const additionsDiv = document.createElement('div');
      additionsDiv.innerHTML = `
        <h4>תוספות תפילה</h4>
        <p>${data.additions.dayNotes?.join(', ') || ''}</p>
      `;
      promoContainer.appendChild(additionsDiv);
    }

    document.body.appendChild(promoContainer);
  }

  addQRButton() {
    const qrButton = document.createElement('button');
    qrButton.textContent = 'QR להתחברות';
    qrButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 15px 30px;
      background: ${this.themeColor};
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      z-index: 1000;
    `;

    qrButton.addEventListener('click', () => {
      // Open QR code modal or redirect to pairing page
      window.open('/pair', '_blank');
    });

    document.body.appendChild(qrButton);
  }

  setupPeriodicUpdates() {
    setInterval(() => {
      this.loadContent();
    }, this.updateInterval);
  }

  setupThemeIntegration() {
    // Listen for theme changes from parent window
    window.addEventListener('message', (event) => {
      if (event.data.type === 'theme-update') {
        this.updateTheme(event.data.theme);
      }
    });
  }

  hexToRgba(hex, alpha) {
    let r = 0, g = 0, b = 0;
    
    if (hex.startsWith('#')) {
      hex = hex.slice(1);
    }

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ShchakimIntegration();
  });
} else {
  new ShchakimIntegration();
}
