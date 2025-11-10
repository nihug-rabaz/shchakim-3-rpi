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
      this.disableScrolling();
      await this.loadLocationConfig();
      await this.loadContent();
      this.setupPeriodicUpdates();
      this.setupThemeIntegration();
      this.setupLiveClock();
      this.setupLiveDate();
      this.setupParasha();
      this.updateOrganization();
    } catch (error) {
      console.error('Failed to initialize Shchakim integration:', error);
    }
  }

  disableScrolling() {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
  }

  async loadLocationConfig() {
    try {
      const response = await fetch(`${this.apiBase}/config.json`);
      if (response.ok) {
        const config = await response.json();
        this.latitude = config.location?.latitude || 31.7683;
        this.longitude = config.location?.longitude || 35.2137;
        this.config = config; // Store full config for later use
      } else {
        // Default to Jerusalem coordinates
        this.latitude = 31.7683;
        this.longitude = 35.2137;
        this.config = {};
      }
    } catch (error) {
      console.warn('Failed to load location config, using defaults:', error);
      this.latitude = 31.7683;
      this.longitude = 35.2137;
      this.config = {};
    }
  }

  setupLiveDate() {
    const dateElement = document.querySelector('.x1825-TP2yIe[data-id="1:25"]');
    if (!dateElement) {
      console.warn('Date element not found');
      return;
    }

    // Update date immediately
    this.updateDate(dateElement);

    // Update date every minute (at start of new minute)
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    
    setTimeout(() => {
      this.updateDate(dateElement);
      setInterval(() => {
        this.updateDate(dateElement);
      }, 60000); // Update every minute
    }, msUntilNextMinute);
  }

  async setupParasha() {
    // Update parasha immediately
    await this.updateParashaFromAPI();

    // Update parasha once per day (at midnight or on load)
    const now = new Date();
    const msUntilMidnight = (24 * 60 * 60 * 1000) - (now.getHours() * 60 * 60 * 1000 + now.getMinutes() * 60 * 1000 + now.getSeconds() * 1000 + now.getMilliseconds());
    
    setTimeout(() => {
      this.updateParashaFromAPI();
      setInterval(() => {
        this.updateParashaFromAPI();
      }, 24 * 60 * 60 * 1000); // Update every 24 hours
    }, msUntilMidnight);
  }

  async updateParashaFromAPI() {
    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);

      const zmanimResponse = await fetch(`${this.apiBase}/api/zmanim`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          latitude: this.latitude,
          longitude: this.longitude,
          date: dateStr
        })
      });

      if (!zmanimResponse.ok) {
        throw new Error('Failed to fetch zmanim data');
      }

      const zmanimData = await zmanimResponse.json();
      
      if (zmanimData.parasha) {
        this.updateParasha(zmanimData.parasha);
      }
    } catch (error) {
      console.error('Error updating parasha:', error);
    }
  }

  async updateDate(element) {
    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD format

      // Call local zmanim API to get Hebrew date (works offline after first load)
      const zmanimResponse = await fetch(`${this.apiBase}/api/zmanim`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          latitude: this.latitude,
          longitude: this.longitude,
          date: dateStr
        })
      });

      if (!zmanimResponse.ok) {
        throw new Error('Failed to fetch zmanim data');
      }

      const zmanimData = await zmanimResponse.json();
      
      // Format Hebrew date
      const hebrewDate = this.formatHebrewDate(zmanimData, now);
      
      // Format Gregorian date
      const gregorianDate = this.formatGregorianDate(now);

      // Update the element
      element.innerHTML = hebrewDate + '<br>יום ' + this.getDayOfWeekHebrew(now) + '&nbsp;&nbsp;' + gregorianDate;
      
      // Update parasha if available
      if (zmanimData.parasha) {
        this.updateParasha(zmanimData.parasha);
      }
    } catch (error) {
      console.error('Error updating date:', error);
      // Fallback to basic date display
      const now = new Date();
      const gregorianDate = this.formatGregorianDate(now);
      element.innerHTML = 'טעינה...<br>יום ' + this.getDayOfWeekHebrew(now) + '&nbsp;&nbsp;' + gregorianDate;
    }
  }

  formatHebrewDate(zmanimData, date) {
    // Use the formatted Hebrew date from local API
    if (zmanimData.hebrew?.formatted) {
      return zmanimData.hebrew.formatted;
    }
    
    if (zmanimData.hebrew?.date) {
      return zmanimData.hebrew.date;
    }
    
    // If API has day/month/year fields, format them
    if (zmanimData.hebrew?.day && zmanimData.hebrew?.month && zmanimData.hebrew?.year) {
      const hebrewMonths = [
        'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר',
        'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
      ];
      const day = zmanimData.hebrew.day;
      const monthIndex = zmanimData.hebrew.month - 1;
      const year = zmanimData.hebrew.year;
      const yearStr = year.toString();
      // Format year as תש"ה or תשפ"ה format
      if (yearStr.length === 4) {
        const lastDigit = yearStr.slice(-1);
        const secondLastDigit = yearStr.slice(-2, -1);
        if (secondLastDigit === '0') {
          return `${day} ${hebrewMonths[monthIndex]} תש${lastDigit}"ה`;
        } else {
          return `${day} ${hebrewMonths[monthIndex]} תש${secondLastDigit}${lastDigit}"ה`;
        }
      }
      return `${day} ${hebrewMonths[monthIndex]} ${year}`;
    }
    
    // Fallback (shouldn't happen with local API)
    return 'טעינה...';
  }

  formatGregorianDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}.${month}.${year.toString().slice(-2)}`;
  }

  getDayOfWeekHebrew(date) {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[date.getDay()];
  }

  updateParasha(parashaName) {
    const parashaElement = document.querySelector('.span0-1CVtT0');
    if (parashaElement && parashaName) {
      parashaElement.textContent = `פרשת ${parashaName}`;
    }
  }

  updateOrganization() {
    const orgElement = document.querySelector('.span2-1CVtT0');
    if (orgElement && this.config?.organization?.name) {
      orgElement.textContent = this.config.organization.name;
    } else if (orgElement) {
      // Default fallback
      orgElement.textContent = 'מטה הרבנות הצבאית';
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
