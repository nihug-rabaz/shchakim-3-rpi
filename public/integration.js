// Dynamic content integration for html.html
class ShchakimIntegration {
  constructor() {
    this.apiBase = window.location.origin;
    this.themeColor = '#054a36';
    this.overlayOpacity = 0.21;
    this.updateInterval = 60000;
    this.clockInterval = null;
    this.contentInterval = null;
    this.boardInfo = null;
    this.imageCache = new Map();
    this.lastFabCommand = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCommand = localStorage.getItem('shchakim_last_fab_command_sent');
      if (savedCommand) {
        this.lastFabCommand = savedCommand;
        console.log('[FAB] Loaded last FAB command from storage:', savedCommand);
      }
    }
    this.init();
  }

  getImageCacheKey(imageUrl, updateId) {
    if (!imageUrl || typeof imageUrl !== 'string') return null;
    let hash = 0;
    for (let i = 0; i < imageUrl.length; i++) {
      const char = imageUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `shchakim_img_${updateId}_${Math.abs(hash)}`;
  }

  async cacheImageFromUrl(imageUrl, updateId) {
    if (!imageUrl || typeof imageUrl !== 'string') return null;
    
    const cacheKey = this.getImageCacheKey(imageUrl, updateId);
    if (!cacheKey) return imageUrl;
    
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        this.imageCache.set(cacheKey, cached);
        return cached;
      }
      
      if (imageUrl.startsWith('data:image/')) {
        try {
          localStorage.setItem(cacheKey, imageUrl);
          this.imageCache.set(cacheKey, imageUrl);
          return imageUrl;
        } catch (e) {
          return imageUrl;
        }
      }
      
      const response = await fetch(imageUrl, { cache: 'no-store' });
      if (!response.ok) return imageUrl;
      
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const dataUrl = reader.result;
          if (dataUrl) {
            try {
              localStorage.setItem(cacheKey, dataUrl);
              this.imageCache.set(cacheKey, dataUrl);
              resolve(dataUrl);
            } catch (e) {
              if (e.name === 'QuotaExceededError') {
                console.warn('[IMAGE] localStorage quota exceeded, using URL directly');
                resolve(imageUrl);
              } else {
                resolve(imageUrl);
              }
            }
          } else {
            resolve(imageUrl);
          }
        };
        reader.onerror = () => resolve(imageUrl);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('[IMAGE] Failed to cache image:', error);
      return imageUrl;
    }
  }

  getCachedImage(imageUrl, updateId) {
    if (!imageUrl || typeof imageUrl !== 'string') return null;
    
    const cacheKey = this.getImageCacheKey(imageUrl, updateId);
    if (!cacheKey) return null;
    
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey);
    }
    
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        this.imageCache.set(cacheKey, cached);
        return cached;
      }
    } catch (e) {
      console.warn('[IMAGE] Failed to read from localStorage:', e);
    }
    
    return null;
  }

  async init() {
    try {
      (function silenceTimeLogs() {
        const tags = ['[DAILY]', '[ZMANIM]', '[CALC]', '[PRAYER]', '[SHABBAT-TITLE-DEBUG]', '[DISPLAY]'];
        const origLog = console.log.bind(console);
        const origWarn = console.warn.bind(console);
        console.log = (...args) => {
          if (typeof args[0] === 'string' && tags.some(t => args[0].startsWith(t))) return;
          origLog(...args);
        };
        console.warn = (...args) => {
          if (typeof args[0] === 'string' && tags.some(t => args[0].startsWith(t))) return;
          origWarn(...args);
        };
      })();
      this.disableScrolling();
      this.setupLayout();
      await this.loadLocationConfig();
      await this.loadBoardInfo();
      await this.loadContent();
      this.setupPeriodicUpdates();
      this.setupThemeIntegration();
      this.ensurePolinFontAsync();
      this.setupLiveClock();
      this.setupLiveDate();
      this.setupParasha();
      this.updateOrganization();
      this.setupSlider();
      
      setTimeout(() => {
        if (this.content && this.content.prayers) {
          this.updatePrayerTimes(this.content.prayers);
        }
      }, 1000);
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
    document.documentElement.style.height = '100%';
    // Prevent user-initiated scroll
    const prevent = (e) => { e.preventDefault(); return false; };
    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchmove', prevent, { passive: false });
    window.addEventListener('scroll', () => { window.scrollTo(0, 0); }, { passive: false });
  }

  // Utility: try multiple selectors to find an element
  getFirstElement(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  // Utility: ensure a top overlay exists (RTL) for fallback texts
  ensureTopOverlay() {
    let overlay = document.getElementById('shchakim-top-overlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'shchakim-top-overlay';
    overlay.setAttribute('dir', 'rtl');
    overlay.style.position = 'fixed';
    overlay.style.top = '16px';
    overlay.style.right = '16px';
    overlay.style.zIndex = '2147483647';
    overlay.style.color = '#ffffff';
    overlay.style.fontFamily = 'inherit';
    overlay.style.textAlign = 'right';
    overlay.style.pointerEvents = 'none';
    document.body.appendChild(overlay);
    return overlay;
  }

  async loadLocationConfig() {
    this.latitude = 31.7683;
    this.longitude = -35.2137;
    
    try {
      const response = await fetch(`${this.apiBase}/config.json`);
      if (response.ok) {
        const config = await response.json();
        if (config.location?.latitude) {
          this.latitude = config.location.latitude;
        }
        if (config.location?.longitude) {
          const lng = Number(config.location.longitude);
          this.longitude = -Math.abs(isNaN(lng) ? config.location.longitude : lng);
        }
        this.config = config;
        console.log(`[LOCATION] Loaded from config: ${this.latitude}, ${this.longitude}`);
      } else {
        this.config = {};
        console.log(`[LOCATION] Config not found, using defaults: ${this.latitude}, ${this.longitude}`);
      }
    } catch (error) {
      console.warn('Failed to load location config, using defaults:', error);
      this.config = {};
      console.log(`[LOCATION] Using defaults after error: ${this.latitude}, ${this.longitude}`);
    }
    
    const oldCacheKeys = Object.keys(localStorage).filter(key => key.startsWith('shchakim_zmanim_'));
    if (oldCacheKeys.length > 0) {
      console.log(`[LOCATION] Clearing ${oldCacheKeys.length} old zmanim cache entries`);
      oldCacheKeys.forEach(key => localStorage.removeItem(key));
    }
  }

  setupLiveDate() {
    // Try several selectors to find the date placeholder in the design
    const selectors = [
      '[data-role="date"]',
      '#date',
      '.date',
      '.x1825-TP2yIe[data-id="1:25"]',
      '[class*="date"]'
    ];
    let dateElement = this.getFirstElement(selectors);
    if (!dateElement) {
      // Fallback to overlay if element not found
      const overlay = this.ensureTopOverlay();
      let block = document.getElementById('shchakim-date-block');
      if (!block) {
        block = document.createElement('div');
        block.id = 'shchakim-date-block';
        block.style.fontSize = '24px';
        block.style.lineHeight = '1.2';
        overlay.appendChild(block);
      }
      dateElement = block;
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
      element.setAttribute('dir', 'rtl');
      
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
    if (!parashaName) return;
    const parashaElement = this.getFirstElement([
      '[data-role="parasha"]',
      '#parasha',
      '.parasha',
      '.span0-1CVtT0',
      '[class*="parasha"]'
    ]);
    if (parashaElement) {
      parashaElement.textContent = `פרשת ${parashaName}`;
      parashaElement.setAttribute('dir', 'rtl');
      return;
    }
    // Fallback to overlay if not found
    const overlay = this.ensureTopOverlay();
    let block = document.getElementById('shchakim-parasha-block');
    if (!block) {
      block = document.createElement('div');
      block.id = 'shchakim-parasha-block';
      block.style.marginTop = '8px';
      block.style.fontSize = '20px';
      overlay.appendChild(block);
    }
    block.textContent = `פרשת ${parashaName}`;
  }

  async loadBoardInfo() {
    try {
      const boardId = this.getBoardId();
      if (!boardId) {
        console.warn('No board ID available, cannot load board info');
        return;
      }

      const response = await fetch(`${this.apiBase}/api/board-info?id=${encodeURIComponent(boardId)}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-store' }
      });
      
      if (response.ok) {
        this.boardInfo = await response.json();
      }
    } catch (error) {
      console.warn('Failed to load board info:', error);
    }
  }

  updateOrganization() {
    const orgElement = document.querySelector('body > div.container-center-horizontal > div > div.x5-TP2yIe.leon-regular-normal-white-96px > span.span2-1CVtT0.leon-regular-normal-white-96px') || document.querySelector('.span2-1CVtT0');
    if (orgElement) {
      const displayName = this.boardInfo?.display_name;
      const baseName = this.boardInfo?.base_name;
      const configName = this.config?.organization?.name;
      
      console.log('[ORG] display_name:', displayName, 'base_name:', baseName, 'config:', configName);
      
      if (displayName) {
        orgElement.textContent = displayName.trim();
        console.log('[ORG] Set to display_name:', displayName);
      } else if (baseName) {
        orgElement.textContent = baseName;
        console.log('[ORG] Set to base_name:', baseName);
      } else if (configName) {
        orgElement.textContent = configName;
        console.log('[ORG] Set to config name:', configName);
      } else {
        orgElement.textContent = 'מטה הרבנות הצבאית';
        console.log('[ORG] Set to default');
      }
    } else {
      console.warn('[ORG] Element not found');
    }
  }

  setupLiveClock() {
    const clockElement = this.getFirstElement([
      '[data-role="clock"]',
      '#clock',
      '.clock',
      '.title-TP2yIe[data-id="1:24"]',
      '[class*="clock"]'
    ]);
    if (!clockElement) {
      // Put clock in overlay as a fallback
      const overlay = this.ensureTopOverlay();
      const clock = document.createElement('div');
      clock.id = 'shchakim-clock';
      clock.style.fontSize = '28px';
      clock.style.fontWeight = '600';
      clock.style.fontFamily = "'Open 24 Display St', 'Polin', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      overlay.insertBefore(clock, overlay.firstChild);
      this.updateClock(clock);
      this.clockInterval = setInterval(() => this.updateClock(clock), 1000);
      return;
    }

    // Update clock immediately
    clockElement.style.fontFamily = "'Open 24 Display St', 'Polin', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
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
      const boardId = this.getBoardId();
      if (!boardId) {
        console.warn('No board ID available, cannot load content');
        return;
      }

      const ts = Date.now();
      const response = await fetch(`${this.apiBase}/api/display/content?boardId=${encodeURIComponent(boardId)}&t=${ts}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-store' }
      });
      if (!response.ok) throw new Error('Failed to fetch content');
      
      const data = await response.json();
      const oldContent = this.content;
      this.content = data;
      const locObj = data?.boardInfo?.location;
      if (locObj?.latitude && locObj?.longitude) {
        this.latitude = Number(locObj.latitude);
        const lng = Number(locObj.longitude);
        this.longitude = -Math.abs(isNaN(lng) ? Number(locObj.longitude) : lng);
      }
      const themePrimary = data?.theme?.primaryHex || data?.boardInfo?.theme?.primaryHex || '#054a36';
      this.themeColor = themePrimary;
      
      await this.updatePrayerTimes(data.prayers);
      this.updateTheme({ primaryHex: themePrimary, gradient: (data?.background?.colors || data?.theme?.gradient) });
      await this.loadBoardInfo();
      this.updateOrganization();
      
      const contentChanged = !oldContent || 
        JSON.stringify(oldContent?.updates) !== JSON.stringify(data?.updates) ||
        JSON.stringify(oldContent?.prayers) !== JSON.stringify(data?.prayers);
      
      if (contentChanged) {
        this.updateSliderContent();
      }
      
      await this.updateHalachaInSlider();
      
      if (data.fab && data.fab.command) {
        if (this.lastFabCommand !== data.fab.command) {
          console.log('[FAB] Command changed:', this.lastFabCommand, '->', data.fab.command);
          this.lastFabCommand = data.fab.command;
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('shchakim_last_fab_command_sent', data.fab.command);
          }
          if (window.parent && window.parent !== window) {
            console.log('[FAB] Sending command to parent:', data.fab.command);
            window.parent.postMessage({ command: data.fab.command }, '*');
          } else {
            console.warn('[FAB] Cannot send command - no parent window or same window');
          }
        } else {
          console.log('[FAB] Command unchanged, skipping:', data.fab.command);
        }
      }
      
    } catch (error) {
      console.error('Error loading content:', error);
    }
  }

  getBoardId() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      let boardId = localStorage.getItem('shchakim_board_id');
      if (!boardId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 9);
        boardId = `BOARD${timestamp}${random}`.toUpperCase();
        localStorage.setItem('shchakim_board_id', boardId);
      }
      return boardId;
    } catch {
      return null;
    }
  }

  async updatePrayerTimes(prayers) {
    if (!prayers || prayers.length === 0) return;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekdayPrayers = prayers.filter(p => p.dayOfWeek === 'weekday');
    const shabbatPrayers = prayers.filter(p => p.dayOfWeek === 'shabbat');

    console.log(`[PRAYER] Processing both weekday (${weekdayPrayers.length}) and shabbat (${shabbatPrayers.length}) prayers`);

    let weekdayZmanimData = null;
    let shabbatZmanimData = null;
    
    const weekdayNeedsZmanim = weekdayPrayers.some(p => p.timeType === 'relative');
    const shabbatNeedsZmanim = shabbatPrayers.some(p => p.timeType === 'relative');
    
    const nextFriday = new Date(now);
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    nextFriday.setHours(0, 0, 0, 0);
    const shabbatDateStr = nextFriday.toISOString().slice(0, 10);
    
    console.log(`[PRAYER] Next Friday (for shabbat prayers): ${shabbatDateStr}`);
    
    const fetchZmanim = async (dateStr, forShabbat = false) => {
      const locationKey = `${this.latitude.toFixed(4)}_${this.longitude.toFixed(4)}`;
      const zmanimKey = `shchakim_zmanim_${dateStr}_${locationKey}`;
      
      const cachedZmanim = localStorage.getItem(zmanimKey);
      if (cachedZmanim) {
        try {
          const data = JSON.parse(cachedZmanim);
          console.log(`[PRAYER] Using cached zmanim for ${forShabbat ? 'shabbat' : 'weekday'} (${dateStr})`);
          return data;
        } catch (e) {
          console.warn('[PRAYER] Failed to parse cached zmanim:', e);
        }
      }
      
      try {
        console.log(`[PRAYER] Fetching zmanim for ${forShabbat ? 'shabbat' : 'weekday'} (${dateStr})`);
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

        if (zmanimResponse.ok) {
          const data = await zmanimResponse.json();
          localStorage.setItem(zmanimKey, JSON.stringify(data));
          console.log(`[PRAYER] Saved zmanim data for ${dateStr}`);
          
          const tomorrow = new Date(dateStr);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          const msUntilMidnight = tomorrow.getTime() - new Date().getTime();
          if (msUntilMidnight > 0) {
            setTimeout(() => {
              localStorage.removeItem(zmanimKey);
              console.log(`[PRAYER] Cleared cached zmanim data for ${dateStr}`);
            }, msUntilMidnight);
          }
          return data;
        } else {
          const errorText = await zmanimResponse.text();
          console.error('[PRAYER] Failed to fetch zmanim:', zmanimResponse.status, errorText);
        }
      } catch (error) {
        console.error('[PRAYER] Error fetching zmanim:', error);
      }
      return null;
    };

    const dateStr = now.toISOString().slice(0, 10);
    weekdayZmanimData = await fetchZmanim(dateStr, false);
    if (weekdayZmanimData) {
      await this.updateDailyTimes(weekdayZmanimData);
    }
    
    shabbatZmanimData = await fetchZmanim(shabbatDateStr, true);
    if (shabbatZmanimData) {
      await this.updateDailyTimes(shabbatZmanimData, true);
    }

    const findAllPrayerElements = (forShabbat = false) => {
      const allElements = [];
      
      if (forShabbat) {
        for (let i = 100; i <= 104; i++) {
          const element = document.querySelector(`[data-id="1:${i}"]`);
          if (element && (element.classList.contains('x0645-TP2yIe') || element.classList.contains('x1940-TP2yIe') || element.textContent.match(/^\d{2}:\d{2}$/))) {
            allElements.push(element);
          }
        }
        console.log(`[PRAYER] Found ${allElements.length} shabbat elements by data-id (100-104)`);
      } else {
        for (let i = 105; i <= 120; i++) {
          const element = document.querySelector(`[data-id="1:${i}"]`);
          if (element && (element.classList.contains('x0645-TP2yIe') || element.classList.contains('x1940-TP2yIe') || element.textContent.match(/^\d{2}:\d{2}$/))) {
            allElements.push(element);
          }
        }
        console.log(`[PRAYER] Found ${allElements.length} weekday elements by data-id (105-120)`);
      }
      
      if (allElements.length > 0) {
        return allElements;
      }
      
      const byClass = document.querySelectorAll('.x0645-TP2yIe, .x1940-TP2yIe');
      if (byClass.length > 0) {
        console.log(`[PRAYER] Found ${byClass.length} elements by class`);
        return Array.from(byClass);
      }
      
      return [];
    };

    let shabbatPrayerElements = findAllPrayerElements(true);
    
    if (shabbatPrayerElements.length === 0) {
      console.warn('[PRAYER] No shabbat prayer time elements found');
    } else {
      console.log(`[PRAYER] Found ${shabbatPrayerElements.length} shabbat prayer time elements`);
    }
    
    const shabbatPrayerMap = {};
    
    console.log(`[PRAYER] Processing SHABBAT prayers - total: ${shabbatPrayers.length}`);
    
    shabbatPrayers.forEach((prayer) => {
        const prayerTitleLower = prayer.title.toLowerCase();
        console.log(`[PRAYER] Checking shabbat prayer: "${prayer.title}"`);
        
        if (prayerTitleLower.includes('קבלת שבת') && prayerTitleLower.includes('ערבית')) {
          shabbatPrayerMap['1:101'] = prayer;
          console.log(`[PRAYER] ✓ Mapped "${prayer.title}" to 1:101`);
        } else if (prayerTitleLower.includes('שחרית שבת') || (prayerTitleLower.includes('שחרית') && prayerTitleLower.includes('שבת'))) {
          shabbatPrayerMap['1:102'] = prayer;
          console.log(`[PRAYER] ✓ Mapped "${prayer.title}" to 1:102`);
        } else if (prayerTitleLower.includes('מנחה שבת') && !prayerTitleLower.includes('ערב')) {
          shabbatPrayerMap['1:103'] = prayer;
          console.log(`[PRAYER] ✓ Mapped "${prayer.title}" to 1:103`);
        } else if (prayerTitleLower.includes('ערבית מוצאי') || prayerTitleLower.includes('מוצאי שבת')) {
          shabbatPrayerMap['1:104'] = prayer;
          console.log(`[PRAYER] ✓ Mapped "${prayer.title}" to 1:104`);
        } else if (prayerTitleLower.includes('מנחה ערב שבת')) {
          console.log(`[PRAYER] ✗ Skipping "מנחה ערב שבת" - will use "קבלת שבת וערבית" for 1:101`);
        } else {
          console.log(`[PRAYER] ✗ No mapping for "${prayer.title}"`);
        }
      });
      
    console.log(`[PRAYER] Final shabbat prayer mapping:`, Object.keys(shabbatPrayerMap).map(key => `${key}: ${shabbatPrayerMap[key].title}`));
    
    const shabbatTitleMap = {
      '1:101': '1:50',
      '1:102': '1:54',
      '1:103': '1:52',
      '1:104': '1:150'
    };
    
    Object.entries(shabbatPrayerMap).forEach(([targetDataId, prayer]) => {
      console.log(`[SHABBAT-TITLE-DEBUG] ==========================================`);
      console.log(`[SHABBAT-TITLE-DEBUG] Processing prayer: "${prayer.title}"`);
      console.log(`[SHABBAT-TITLE-DEBUG] Target time element data-id: ${targetDataId}`);
      
      const element = document.querySelector(`[data-id="${targetDataId}"]`);
      
      if (element) {
        const slotIndex = ['1:101','1:102','1:103','1:104'].indexOf(targetDataId) + 1;
        const timeSlot = slotIndex > 0 ? `shabbat-${slotIndex}` : `shabbat-${targetDataId}`;
        element.setAttribute('data-prayer-slot', timeSlot);
        console.log(`[SHABBAT-TITLE-DEBUG] ✓ Found time element ${targetDataId}, current time: "${element.textContent}"`);
        const timeText = this.calculatePrayerTime(prayer, shabbatZmanimData);
        console.log(`[SHABBAT-TITLE-DEBUG] Calculated time: ${timeText}`);
        
        element.textContent = timeText;
        element.innerText = timeText;
        element.innerHTML = timeText;
        
        const prayerTitleLower = prayer.title.toLowerCase();
        let baseTitle = 'ערבית';
        console.log(`[SHABBAT-TITLE-DEBUG] Starting title determination for "${prayer.title}"...`);
        
        if (prayerTitleLower.includes('מוצאי שבת') || (prayerTitleLower.includes('מוצאי') && prayerTitleLower.includes('שבת'))) {
          baseTitle = 'ערבית מוצאי';
          console.log(`[SHABBAT-TITLE-DEBUG] ✓ Matched: "מוצאי שבת" → "${baseTitle}"`);
        } else if (prayerTitleLower.includes('קבלת שבת')) {
          baseTitle = 'קבלת שבת';
          console.log(`[SHABBAT-TITLE-DEBUG] ✓ Matched: "קבלת שבת" → "${baseTitle}"`);
        } else if (prayerTitleLower.includes('שחרית שבת') || (prayerTitleLower.includes('שחרית') && prayerTitleLower.includes('שבת'))) {
          baseTitle = 'שחרית שבת';
          console.log(`[SHABBAT-TITLE-DEBUG] ✓ Matched: "שחרית שבת" → "${baseTitle}"`);
        } else if (prayerTitleLower.includes('מנחה שבת') || (prayerTitleLower.includes('מנחה') && prayerTitleLower.includes('שבת'))) {
          baseTitle = 'מנחה שבת';
          console.log(`[SHABBAT-TITLE-DEBUG] ✓ Matched: "מנחה שבת" → "${baseTitle}"`);
        } else if (prayerTitleLower.includes('שחרית')) {
          baseTitle = 'שחרית';
          console.log(`[SHABBAT-TITLE-DEBUG] ✓ Matched: "שחרית" → "${baseTitle}"`);
        } else if (prayerTitleLower.includes('מנחה')) {
          baseTitle = 'מנחה';
          console.log(`[SHABBAT-TITLE-DEBUG] ✓ Matched: "מנחה" → "${baseTitle}"`);
        } else {
          console.log(`[SHABBAT-TITLE-DEBUG] ✗ No match, using default: "${baseTitle}"`);
        }
        
        console.log(`[SHABBAT-TITLE-DEBUG] Final determined title: "${baseTitle}" for prayer "${prayer.title}"`);
        
        const titleDataId = shabbatTitleMap[targetDataId];
        console.log(`[SHABBAT-TITLE-DEBUG] Mapping: time element ${targetDataId} → title element ${titleDataId} with title "${baseTitle}"`);
        
        if (titleDataId) {
          let titleElement = document.querySelector(`[data-id="${titleDataId}"].text_label`);
          if (!titleElement) {
            console.log(`[SHABBAT-TITLE-DEBUG] Not found with .text_label, trying without class`);
            titleElement = document.querySelector(`[data-id="${titleDataId}"]`);
          }
          
          if (titleElement) {
            titleElement.setAttribute('data-prayer-slot', timeSlot);
            console.log(`[SHABBAT-TITLE-DEBUG] ✓ Found title element at ${titleDataId}`);
            console.log(`[SHABBAT-TITLE-DEBUG] Current title text: "${titleElement.textContent}"`);
            
            const specialMismatch = (baseTitle === 'קבלת שבת' && titleDataId !== '1:50') || (baseTitle === 'ערבית מוצאי' && titleDataId !== '1:150');
            if (specialMismatch) {
              console.log(`[SHABBAT-TITLE-DEBUG] Skipping write of special title "${baseTitle}" to ${titleDataId}`);
            } else {
              titleElement.textContent = baseTitle;
              titleElement.innerText = baseTitle;
              titleElement.innerHTML = baseTitle;
            }
          }
        }
      }
      console.log(`[SHABBAT-TITLE-DEBUG] ==========================================`);
    });
    
    console.log(`[PRAYER] Final pass: Updating all shabbat title elements directly`);
    Object.entries(shabbatPrayerMap).forEach(([timeDataId, prayer]) => {
      const titleDataId = shabbatTitleMap[timeDataId];
      if (titleDataId) {
        const prayerTitleLower = prayer.title.toLowerCase();
        let baseTitle = 'ערבית';
        if (prayerTitleLower.includes('מוצאי שבת') || (prayerTitleLower.includes('מוצאי') && prayerTitleLower.includes('שבת'))) {
          baseTitle = 'ערבית מוצאי';
        } else if (prayerTitleLower.includes('קבלת שבת')) {
          baseTitle = 'קבלת שבת';
        } else if (prayerTitleLower.includes('שחרית שבת') || (prayerTitleLower.includes('שחרית') && prayerTitleLower.includes('שבת'))) {
          baseTitle = 'שחרית שבת';
        } else if (prayerTitleLower.includes('מנחה שבת') || (prayerTitleLower.includes('מנחה') && prayerTitleLower.includes('שבת'))) {
          baseTitle = 'מנחה שבת';
        } else if (prayerTitleLower.includes('שחרית')) {
          baseTitle = 'שחרית';
        } else if (prayerTitleLower.includes('מנחה')) {
          baseTitle = 'מנחה';
        }
        
        console.log(`[SHABBAT-TITLE-DEBUG] Final pass: Prayer "${prayer.title}" (time ${timeDataId}) → title "${baseTitle}" for title data-id="${titleDataId}"`);
        
        const allTitleElements = document.querySelectorAll(`[data-id="${titleDataId}"]`);
        console.log(`[SHABBAT-TITLE-DEBUG] Final pass: Found ${allTitleElements.length} elements with data-id="${titleDataId}"`);
        const specialMismatch = (baseTitle === 'קבלת שבת' && titleDataId !== '1:50') || (baseTitle === 'ערבית מוצאי' && titleDataId !== '1:150');
        if (specialMismatch) {
          console.log(`[SHABBAT-TITLE-DEBUG] Final pass: Skipping write of special title "${baseTitle}" to ${titleDataId}`);
        } else {
          allTitleElements.forEach((titleEl, idx) => {
            console.log(`[SHABBAT-TITLE-DEBUG] Final pass: Element ${idx} - classes: "${titleEl.className}", text: "${titleEl.textContent}", innerText: "${titleEl.innerText}"`);
            if (titleEl.classList.contains('text_label')) {
              console.log(`[SHABBAT-TITLE-DEBUG] Final pass: ✓ Updating text_label element ${idx} from "${titleEl.textContent}" to "${baseTitle}"`);
              titleEl.textContent = baseTitle;
              titleEl.innerText = baseTitle;
              titleEl.innerHTML = baseTitle;
              console.log(`[SHABBAT-TITLE-DEBUG] Final pass: After update - text: "${titleEl.textContent}", innerText: "${titleEl.innerText}"`);
            } else if (titleEl.textContent.trim().length < 15) {
              console.log(`[SHABBAT-TITLE-DEBUG] Final pass: ✓ Updating short text element ${idx} from "${titleEl.textContent}" to "${baseTitle}"`);
              titleEl.textContent = baseTitle;
              titleEl.innerText = baseTitle;
              titleEl.innerHTML = baseTitle;
              console.log(`[SHABBAT-TITLE-DEBUG] Final pass: After update - text: "${titleEl.textContent}", innerText: "${titleEl.innerText}"`);
            }
          });
          
          const textLabelElements = document.querySelectorAll(`[data-id="${titleDataId}"].text_label`);
          if (textLabelElements.length > 0) {
            console.log(`[SHABBAT-TITLE-DEBUG] Final pass: Found ${textLabelElements.length} elements with .text_label class`);
            textLabelElements.forEach((el, idx) => {
              console.log(`[SHABBAT-TITLE-DEBUG] Final pass: Updating .text_label element ${idx} from "${el.textContent}" to "${baseTitle}"`);
              el.textContent = baseTitle;
              el.innerText = baseTitle;
              el.innerHTML = baseTitle;
            });
          }
        }
      }
    });
    
    let prayerElements = findAllPrayerElements(false);
    
    if (prayerElements.length === 0) {
      console.warn('[PRAYER] No weekday prayer time elements found');
      if (!this.prayerRetryCount) {
        this.prayerRetryCount = 0;
      }
      this.prayerRetryCount++;
      
      if (this.prayerRetryCount < 10) {
        console.log(`[PRAYER] Retry attempt ${this.prayerRetryCount}/10`);
        setTimeout(() => this.updatePrayerTimes(prayers), 500);
      }
      return;
    }
    
    console.log(`[PRAYER] Found ${prayerElements.length} weekday prayer time elements, weekday prayers: ${weekdayPrayers.length}`);
    
    this.prayerRetryCount = 0;
    
    const weekdayPrayerMap = {};
    weekdayPrayers.forEach((prayer) => {
      const prayerTitleLower = prayer.title.toLowerCase();
      if (prayerTitleLower.includes('שחרית') || prayerTitleLower.includes('shacharit')) {
        if (!weekdayPrayerMap['shacharit']) {
          weekdayPrayerMap['shacharit'] = prayer;
        }
      } else if (prayerTitleLower.includes('מנחה') || prayerTitleLower.includes('mincha')) {
        if (!weekdayPrayerMap['mincha']) {
          weekdayPrayerMap['mincha'] = prayer;
        }
      } else if (prayerTitleLower.includes('ערבית') || prayerTitleLower.includes('arvit') || prayerTitleLower.includes('maariv')) {
        if (!weekdayPrayerMap['arvit']) {
          weekdayPrayerMap['arvit'] = prayer;
        }
      }
    });
    
    const orderedPrayers = [
      weekdayPrayerMap['shacharit'],
      weekdayPrayerMap['mincha'],
      weekdayPrayerMap['arvit']
    ].filter(p => p !== undefined);
    
    console.log(`[PRAYER] Mapped prayers: shacharit=${!!weekdayPrayerMap['shacharit']}, mincha=${!!weekdayPrayerMap['mincha']}, arvit=${!!weekdayPrayerMap['arvit']}`);
    
    orderedPrayers.forEach((prayer, index) => {
      let element = null;
      
      if (prayerElements[index]) {
        element = prayerElements[index];
        console.log(`[PRAYER] Using weekday element at index ${index} for ${prayer.title}`);
      } else {
        console.warn(`[PRAYER] No element found at index ${index} for weekday prayer ${prayer.title}`);
      }
      
      if (element) {
        const timeSlot = `weekday-${index + 1}`;
        element.setAttribute('data-prayer-slot', timeSlot);
        const timeText = this.calculatePrayerTime(prayer, weekdayZmanimData);
        console.log(`[PRAYER] Processing prayer: ${prayer.title} to ${timeText}`);
        
        let cardElement = element.closest('[class*="rectangle"]');
        if (!cardElement) {
          cardElement = element.parentElement;
          while (cardElement && !cardElement.classList.toString().includes('rectangle') && cardElement !== document.body) {
            cardElement = cardElement.parentElement;
          }
        }
        
        const prayerTitleLower = prayer.title.toLowerCase();
        let baseTitle = prayer.title;
        
        if (prayerTitleLower.includes('שחרית') || prayerTitleLower.includes('shacharit')) {
          baseTitle = 'שחרית';
        } else if (prayerTitleLower.includes('מנחה') || prayerTitleLower.includes('mincha')) {
          baseTitle = 'מנחה';
        } else if (prayerTitleLower.includes('ערבית') || prayerTitleLower.includes('arvit') || prayerTitleLower.includes('maariv') || prayerTitleLower.includes('קבלת שבת')) {
          baseTitle = 'ערבית';
        }
        
        element.textContent = timeText;
        element.innerText = timeText;
        element.innerHTML = timeText;
        console.log(`[PRAYER] Updated time element to ${timeText}`);
        
        if (cardElement) {
          const elementDataId = element.getAttribute('data-id');
          const weekdayTitleIds = ['1:51', '1:52', '1:53'];
          
          let titleInCard = null;
          if (elementDataId) {
            const idNum = parseInt(elementDataId.split(':')[1]);
            const titleId = `1:${idNum - 54}`;
            
            if (weekdayTitleIds.includes(titleId)) {
              titleInCard = cardElement.querySelector(`[data-id="${titleId}"].text_label`);
              if (!titleInCard) {
                titleInCard = cardElement.querySelector('.text_label');
              }
            } else {
              titleInCard = cardElement.querySelector('.text_label');
            }
          } else {
            titleInCard = cardElement.querySelector('.text_label');
          }
          
          if (titleInCard) {
            titleInCard.setAttribute('data-prayer-slot', timeSlot);
            const titleDataId = titleInCard.getAttribute('data-id');
            const isShabbatTitle = titleDataId && ['1:50', '1:54', '1:52', '1:150'].includes(titleDataId);
            
            if (isShabbatTitle) {
              console.log(`[PRAYER] Skipping shabbat title element ${titleDataId} for weekday prayer`);
            } else {
              const forbiddenShabbatTitles = ['קבלת שבת', 'ערבית מוצאי'];
              const currentTitleText = titleInCard.textContent.trim();
              if (forbiddenShabbatTitles.includes(baseTitle)) {
                console.log(`[PRAYER] Skipping forbidden shabbat title "${baseTitle}" on weekday card`);
              } else if (currentTitleText !== baseTitle) {
                titleInCard.textContent = baseTitle;
                titleInCard.innerText = baseTitle;
                titleInCard.innerHTML = baseTitle;
                console.log(`[PRAYER] Updated weekday title from "${currentTitleText}" to "${baseTitle}"`);
              } else {
                console.log(`[PRAYER] Weekday title already correct: "${baseTitle}"`);
              }
            }
          } else {
            const elementDataId = element.getAttribute('data-id');
            if (elementDataId) {
              const idNum = parseInt(elementDataId.split(':')[1]);
              const titleId = `1:${idNum - 54}`;
              const isShabbatTitle = ['1:50', '1:54', '1:52', '1:150'].includes(titleId);
              
              if (!isShabbatTitle) {
                const titleElement = document.querySelector(`[data-id="${titleId}"].text_label`);
                if (titleElement) {
                  titleElement.setAttribute('data-prayer-slot', timeSlot);
                  titleElement.textContent = baseTitle;
                  titleElement.innerText = baseTitle;
                  titleElement.innerHTML = baseTitle;
                  console.log(`[PRAYER] Updated weekday title at ${titleId} to "${baseTitle}"`);
                }
              } else {
                console.log(`[PRAYER] Skipping shabbat title element ${titleId} for weekday prayer`);
              }
            }
          }
          
          const overlayColor = this.hexToRgba(this.themeColor, this.overlayOpacity);
          cardElement.style.backgroundColor = overlayColor;
          cardElement.style.borderRadius = '30px';
        } else {
          console.log(`[PRAYER] No card found, but time updated to ${timeText}`);
        }
        
        if (element.hasAttribute('data-id')) {
          console.log(`[PRAYER] Time element data-id: ${element.getAttribute('data-id')}`);
        }
      } else {
        console.warn(`[PRAYER] No time element found for prayer ${prayer.title}`);
      }
    });
    
    console.log(`[PRAYER] Checking for duplicate titles...`);
    const allTitleLabels = document.querySelectorAll('.text_label');
    const titleCounts = {};
    allTitleLabels.forEach((label) => {
      const labelText = label.textContent.trim();
      const labelDataId = label.getAttribute('data-id');
      
      if (labelText === 'קבלת שבת') {
        if (!titleCounts['קבלת שבת']) {
          titleCounts['קבלת שבת'] = [];
        }
        titleCounts['קבלת שבת'].push({ dataId: labelDataId, element: label });
      }
      
      if (labelText.includes('מנחה קטנה') || labelText.includes('מנחה גדולה') ) {
        const labelDataId = label.getAttribute('data-id');
        const isShabbatTitle = labelDataId && ['1:50', '1:54', '1:52', '1:150'].includes(labelDataId);
        if (!isShabbatTitle) {
          label.textContent = 'מנחה';
          label.innerText = 'מנחה';
          label.innerHTML = 'מנחה';
          console.log(`[PRAYER] Fixed hardcoded title from "${labelText}" to "מנחה"`);
        }
      }
    });
    
    if (titleCounts['קבלת שבת'] && titleCounts['קבלת שבת'].length > 1) {
      console.warn(`[PRAYER] ⚠ Found ${titleCounts['קבלת שבת'].length} elements with "קבלת שבת" title:`, titleCounts['קבלת שבת'].map(t => t.dataId));
      titleCounts['קבלת שבת'].forEach((item, idx) => {
        console.log(`[PRAYER] Element ${idx}: data-id="${item.dataId}", classes="${item.element.className}"`);
      });
      
      const shabbatTitleElements = titleCounts['קבלת שבת'].filter(item => item.dataId === '1:50');
      const otherElements = titleCounts['קבלת שבת'].filter(item => item.dataId !== '1:50');
      
      if (shabbatTitleElements.length > 0 && otherElements.length > 0) {
        console.log(`[PRAYER] Fixing duplicate: keeping "קבלת שבת" at 1:50, removing from others`);
        otherElements.forEach((item) => {
          const prayerTitleLower = item.element.textContent.toLowerCase();
          let newTitle = 'ערבית';
          if (prayerTitleLower.includes('שחרית')) {
            newTitle = 'שחרית';
          } else if (prayerTitleLower.includes('מנחה')) {
            newTitle = 'מנחה';
          }
          console.log(`[PRAYER] Changing duplicate "קבלת שבת" at ${item.dataId} to "${newTitle}"`);
          item.element.textContent = newTitle;
          item.element.innerText = newTitle;
          item.element.innerHTML = newTitle;
        });
      }
    }

    const forcedSelector = 'body > div.container-center-horizontal > div > div.text_label-cHOWXD.text_label.leon-productregular-normal-white-32px';
    const forcedEl = document.querySelector(forcedSelector);
    if (forcedEl) {
      if (forcedEl.textContent.trim() !== 'קבלת שבת') {
        forcedEl.textContent = 'קבלת שבת';
        forcedEl.innerText = 'קבלת שבת';
        forcedEl.innerHTML = 'קבלת שבת';
        console.log(`[PRAYER] Forced override: set ${forcedSelector} to "קבלת שבת"`);
      }
    }

    const forcedSelectorArvitMotzai = 'body > div.container-center-horizontal > div > div.text_label-Hbu8zW.text_label.leon-productregular-normal-white-32px';
    const forcedElArvitMotzai = document.querySelector(forcedSelectorArvitMotzai);
    if (forcedElArvitMotzai) {
      if (forcedElArvitMotzai.textContent.trim() !== 'ערבית מוצאי שבת') {
        forcedElArvitMotzai.textContent = 'ערבית מוצאי שבת';
        forcedElArvitMotzai.innerText = 'ערבית מוצאי שבת';
        forcedElArvitMotzai.innerHTML = 'ערבית מוצאי שבת';
        console.log(`[PRAYER] Forced override: set ${forcedSelectorArvitMotzai} to "ערבית מוצאי שבת"`);
      }
    }
    
    const forcedSelectorMincha = 'body > div.container-center-horizontal > div > div.text_label-hXBgvb.text_label.leon-productregular-normal-white-32px';
    const forcedElMincha = document.querySelector(forcedSelectorMincha);
    if (forcedElMincha) {
      if (forcedElMincha.textContent.trim() !== 'מנחה') {
        forcedElMincha.textContent = 'מנחה';
        forcedElMincha.innerText = 'מנחה';
        forcedElMincha.innerHTML = 'מנחה';
        console.log(`[PRAYER] Forced override: set ${forcedSelectorMincha} to "מנחה"`);
      }
    }
  }

  async updateDailyTimes(zmanimData, forShabbat = false) {
    if (!zmanimData) return;
    
    try {
      console.log(`[DAILY] Using location lat=${this.latitude}, lng=${this.longitude}, forShabbat=${forShabbat}`);
      try { console.log(`[DAILY] Times keys:`, Object.keys(zmanimData?.times || {})); } catch {}
      const dailyMappings = [
        { base: 'sunrise', title: 'זריחה', ids: ['1:75'] },
        { base: 'alot_hashachar', title: 'עלות השחר', ids: ['1:72'] },
        { base: 'talitTefillin', title: 'טלית ותפילין', ids: ['1:81'] },
        { base: 'sunset', title: 'שקיעה', ids: ['1:83'] },
        { base: 'stars_out', title: 'צאת הכוכבים', ids: ['1:82'], titleIds: ['1:66'] },
        { base: 'chatzot', title: 'חצות היום', ids: ['1:84'], titleIds: ['1:70'] }
      ];
      const toHHMM = (value) => {
        if (!value) return '--:--';
        if (typeof value === 'string') {
          if (value.includes('T')) {
            const timePart = value.split('T')[1]?.split(/[Z+-]/)[0] || '';
            const [timeStr] = timePart.split('.')
            const [h, m] = (timeStr || '').split(':');
            return `${String(Number(h)||0).padStart(2,'0')}:${String(Number(m)||0).padStart(2,'0')}`;
          }
          if (/^\d{2}:\d{2}$/.test(value)) return value;
        }
        try {
          const d = new Date(value);
          const hh = String(d.getHours()).padStart(2,'0');
          const mm = String(d.getMinutes()).padStart(2,'0');
          return `${hh}:${mm}`;
        } catch { return '--:--'; }
      };
      dailyMappings.forEach(({ base, title, ids, titleIds }, idx) => {
        const baseTime = this.getZmanimTime(zmanimData, base);
        const hhmm = toHHMM(baseTime);
        console.log(`[DAILY] Calc ${base} -> raw=${baseTime} -> ${hhmm}`);
        ids.forEach((id) => {
          const timeEl = document.querySelector(`[data-id="${id}"]`);
          if (timeEl) {
            timeEl.textContent = hhmm;
            timeEl.innerText = hhmm;
            timeEl.innerHTML = hhmm;
            timeEl.setAttribute('data-daily-slot', `daily-${base}`);
            const card = timeEl.closest('[class*="rectangle"]') || timeEl.parentElement;
            if (card) {
              const titleEl = card.querySelector('.text_label');
              if (titleEl) {
                titleEl.setAttribute('data-daily-slot', `daily-${base}`);
              }
            }
            console.log(`[DAILY] Updated ${base} (${title}) at ${id} -> ${hhmm}`);
          }
        });
        if (Array.isArray(titleIds)) {
          titleIds.forEach((tid) => {
            const labelEl = document.querySelector(`[data-id="${tid}"]`);
            if (labelEl) {
              labelEl.textContent = title;
              labelEl.innerText = title;
              labelEl.innerHTML = title;
              labelEl.setAttribute('data-daily-slot', `daily-${base}`);
              console.log(`[DAILY] Updated title for ${base} at ${tid} -> ${title}`);
            }
          });
        }
      });

      if (forShabbat) {
        const times = zmanimData?.times || {};
        const key = ['kenisatShabbat22','kenisatShabbat30','kenisatShabbat40'].find(k => times[k]);
        const val = key ? times[key] : null;
        const hhmm = toHHMM(val);
        const el = document.querySelector('[data-id="1:76"]');
        if (el && hhmm !== '--:--') {
          el.textContent = hhmm;
          el.innerText = hhmm;
          el.innerHTML = hhmm;
          el.setAttribute('data-daily-slot', 'daily-kenisatShabbat');
          console.log(`[DAILY] Updated kenisatShabbat (${key}) at 1:76 -> ${hhmm}`);
        }

        const labelKnisat = document.querySelector('[data-id="1:59"]');
        if (labelKnisat) {
          labelKnisat.textContent = 'כניסת שבת';
          labelKnisat.innerText = 'כניסת שבת';
          labelKnisat.innerHTML = 'כניסת שבת';
          labelKnisat.setAttribute('data-daily-slot', 'daily-kenisatShabbat');
          console.log('[DAILY] Updated label at 1:59 -> כניסת שבת');
        }

        const yetziat = times['yetziatShabbat'] || null;
        const yetziatHHMM = toHHMM(yetziat);
        const elYetziat = document.querySelector('[data-id="1:73"]');
        if (elYetziat && yetziatHHMM !== '--:--') {
          elYetziat.textContent = yetziatHHMM;
          elYetziat.innerText = yetziatHHMM;
          elYetziat.innerHTML = yetziatHHMM;
          elYetziat.setAttribute('data-daily-slot', 'daily-yetziatShabbat');
          console.log(`[DAILY] Updated yetziatShabbat at 1:73 -> ${yetziatHHMM}`);
        }

        try {
          const now = new Date();
          const dayOfWeek = now.getDay();
          const nextFriday = new Date(now);
          const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
          nextFriday.setDate(now.getDate() + daysUntilFriday);
          nextFriday.setHours(0, 0, 0, 0);
          const nextShabbat = new Date(nextFriday);
          nextShabbat.setDate(nextFriday.getDate() + 1);
          const shabbatDayStr = nextShabbat.toISOString().slice(0, 10);
          const respSat = await fetch(`${this.apiBase}/api/zmanim`, {
            method: 'POST',
            headers: { 'accept': 'application/json', 'content-type': 'application/json' },
            body: JSON.stringify({ latitude: this.latitude, longitude: this.longitude, date: shabbatDayStr })
          });
          if (respSat.ok) {
            const dataSat = await respSat.json();
            const timesSat = dataSat?.times || {};
            let shkiyaSat = timesSat['shkiya'] || timesSat['sunset'] || null;
            let rtMinutes = (this.config?.zmanim?.rabbeinuTamMinutes) || 72;
            const toParts = (value) => {
              if (!value) return null;
              if (typeof value === 'string' && value.includes('T')) {
                const timePart = value.split('T')[1]?.split(/[Z+-]/)[0] || '';
                const [timeStr] = timePart.split('.');
                const [h, m] = (timeStr || '').split(':').map(Number);
                return { h: h || 0, m: m || 0 };
              }
              if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) {
                const [h, m] = value.split(':').map(Number);
                return { h: h || 0, m: m || 0 };
              }
              try {
                const d = new Date(value);
                return { h: d.getHours(), m: d.getMinutes() };
              } catch { return null; }
            };
            const parts = toParts(shkiyaSat);
            if (parts) {
              let total = parts.h * 60 + parts.m + rtMinutes;
              total %= 1440;
              const hh = String(Math.floor(total / 60)).padStart(2, '0');
              const mm = String(total % 60).padStart(2, '0');
              const rt = `${hh}:${mm}`;
              const rtEl = document.querySelector('[data-id="1:80"]');
              if (rtEl) {
                rtEl.textContent = rt;
                rtEl.innerText = rt;
                rtEl.innerHTML = rt;
                rtEl.setAttribute('data-daily-slot', 'daily-rabbeinuTam');
                console.log(`[DAILY] Updated Rabbeinu Tam (sunset+${rtMinutes}) at 1:80 -> ${rt} (for ${shabbatDayStr})`);
              }
            }
          } else {
            console.warn('[DAILY] Failed to fetch shabbat-day zmanim for Rabbeinu Tam');
          }
        } catch (e) {
          console.warn('[DAILY] Error updating Rabbeinu Tam', e);
        }
      }
    } catch (e) {
      console.warn('[DAILY] Failed updating daily times', e);
    }
  }

  calculatePrayerTime(prayer, zmanimData) {
    console.log(`[CALC] Calculating time for prayer: ${prayer.title}, timeType: ${prayer.timeType}, relativeBase: ${prayer.relativeBase}, fixedTime: ${prayer.fixedTime}`);
    
    if (prayer.timeType === 'fixed' && prayer.fixedTime) {
      return prayer.fixedTime;
    } 
    
    if (prayer.timeType === 'relative' && zmanimData && prayer.relativeBase) {
      const baseTime = this.getZmanimTime(zmanimData, prayer.relativeBase);
      console.log(`[CALC] Base time for ${prayer.relativeBase}: ${baseTime}`);
      if (!baseTime) {
        console.warn(`[CALC] No base time found for relativeBase: ${prayer.relativeBase}`);
        return '--:--';
      }
      
      const offsetMinutes = prayer.offsetMinutes || 0;
      
      let baseHours, baseMinutes;
      
      if (typeof baseTime === 'string') {
        if (baseTime.includes('T')) {
          const timePart = baseTime.split('T')[1]?.split(/[Z+-]/)[0] || '';
          const [timeStr] = timePart.split('.');
          const [h, m] = timeStr.split(':').map(Number);
          baseHours = h || 0;
          baseMinutes = m || 0;
          console.log(`[CALC] Parsed time from ISO string: ${baseHours}:${String(baseMinutes).padStart(2, '0')} (already local time)`);
        } else if (baseTime.match(/^\d{2}:\d{2}$/)) {
          const [h, m] = baseTime.split(':').map(Number);
          baseHours = h || 0;
          baseMinutes = m || 0;
        } else {
          const timePart = baseTime.split('T')?.[1]?.split(/[Z+-]/)[0] || '';
          if (timePart) {
            const [timeStr] = timePart.split('.');
            const [h, m] = timeStr.split(':').map(Number);
            baseHours = h || 0;
            baseMinutes = m || 0;
          } else {
            const date = new Date(baseTime);
            baseHours = date.getUTCHours();
            baseMinutes = date.getUTCMinutes();
          }
        }
      } else {
        const date = new Date(baseTime);
        const timePart = baseTime.toString().split('T')?.[1]?.split(/[Z+-]/)[0] || '';
        if (timePart) {
          const [timeStr] = timePart.split('.');
          const [h, m] = timeStr.split(':').map(Number);
          baseHours = h || 0;
          baseMinutes = m || 0;
        } else {
          baseHours = date.getUTCHours();
          baseMinutes = date.getUTCMinutes();
        }
      }
      
      let totalMinutes = baseHours * 60 + baseMinutes + offsetMinutes;
      if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
      }
      if (totalMinutes >= 24 * 60) {
        totalMinutes -= 24 * 60;
      }
      
      const finalHours = Math.floor(totalMinutes / 60) % 24;
      const finalMinutes = totalMinutes % 60;
      
      const hours = String(finalHours).padStart(2, '0');
      const minutes = String(finalMinutes).padStart(2, '0');
      const result = `${hours}:${minutes}`;
      console.log(`[CALC] Calculated time: ${result} (base: ${baseHours}:${String(baseMinutes).padStart(2, '0')}, offset: ${offsetMinutes} minutes)`);
      return result;
    }
    
    console.warn(`[CALC] Missing data - timeType: ${prayer.timeType}, has zmanimData: ${!!zmanimData}, relativeBase: ${prayer.relativeBase}`);
    return '--:--';
  }

  getZmanimTime(zmanimData, relativeBase) {
    if (!zmanimData || !zmanimData.times) {
      console.warn(`[ZMANIM] No times object in zmanimData`);
      return null;
    }

    const times = zmanimData.times;
    console.log(`[ZMANIM] Full times object:`, JSON.stringify(times));
    
    const mapping = {
      'sunrise': ['zricha', 'sunrise', 'hanetz', 'netz'],
      'sunset': ['shkiya', 'sunset', 'shkia'],
      'stars_out': ['tzait', 'tzeit', 'stars_out', 'tzaitHakochavim'],
      'stars_out_90': ['tzait90', 'tzeit90'],
      'alot_hashachar': ['alot72', 'alot', 'alotHashachar'],
      'chatzot': ['chatzot', 'chatzotHayom'],
      'mincha_gedola': ['minchaGedola', 'mincha_gedola'],
      'mincha_ketana': ['minchaKetana', 'mincha_ketana'],
      'plag_mincha': ['plagMincha', 'plag_mincha'],
      'talitTefillin': ['talitTefillin', 'tallitTefillin']
    };

    const possibleKeys = mapping[relativeBase];
    if (!possibleKeys) {
      console.warn(`[ZMANIM] No mapping found for relativeBase: ${relativeBase}`);
      console.log(`[ZMANIM] Available keys in times:`, Object.keys(times));
      return null;
    }

    for (const key of possibleKeys) {
      if (times[key]) {
        console.log(`[ZMANIM] Found time for ${relativeBase} using key: ${key} = ${times[key]} (type: ${typeof times[key]})`);
        return times[key];
      }
    }

    console.warn(`[ZMANIM] No matching key found for relativeBase: ${relativeBase}`);
    console.log(`[ZMANIM] Available keys in times:`, Object.keys(times));
    console.log(`[ZMANIM] Tried keys:`, possibleKeys);
    return null;
  }

  updateTheme(theme) {
    if (!theme) return;
    
    this.themeColor = theme.primaryHex || this.themeColor || '#054a36';
    
    // Prefer provided gradient/colors from payload
    let gradientCss = '';
    const colors = Array.isArray(theme?.gradient) ? theme.gradient : Array.isArray(this.content?.background?.colors) ? this.content.background.colors : null;
    if (colors && colors.length >= 2) {
      gradientCss = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
    } else {
      gradientCss = `linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`;
    }
    this.gradientCss = gradientCss;
    document.body.style.backgroundImage = gradientCss;
    document.body.style.backgroundColor = '';

    // Apply gradient inside the main panel instead of solid green
    const panelCandidates = [
      '.frame-17',
      '.rectangle-27-TP2yIe[data-id="1:38"]',
      '.rectangle-27-TP2yIe',
      '[data-id="1:38"]'
    ];
    const mainPanel = this.getFirstElement(panelCandidates);
    if (mainPanel) {
      mainPanel.style.backgroundImage = gradientCss;
      mainPanel.style.backgroundColor = '';
    }
    
    // Update main frame background
    const mainFrame = document.querySelector('.frame-17');
    if (mainFrame) {
      mainFrame.style.backgroundImage = gradientCss;
      mainFrame.style.backgroundColor = '';
    }

    // Update slider background if exists
    const slider = document.getElementById('shchakim-slider');
    if (slider) {
      slider.style.backgroundImage = gradientCss;
      slider.style.backgroundColor = '';
      // Apply gradient to all slides
      const slides = slider.querySelectorAll(':scope > div');
      slides.forEach((s) => { s.style.backgroundImage = gradientCss; s.style.backgroundColor = ''; });
      // Apply semi-transparent gradient to halacha cards
      const halachaCards = slider.querySelectorAll('.halacha-card');
      halachaCards.forEach((c) => {
        c.style.backgroundImage = '';
      });
    }
  }

  // Dynamically probe font files and register Polin with the first existing match
  async ensurePolinFontAsync() {
    if (document.getElementById('shchakim-fonts-style')) return;
    // Query server for actual font files present
    let files = [];
    try {
      const r = await fetch(`${this.apiBase}/api/fonts/list`, { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        files = Array.isArray(j?.files) ? j.files : [];
      }
    } catch {}

    // Preload and register all Polin font files (e.g., Polin-A-*.otf)
    try {
      const polinFiles = files.filter((f) => /polin/i.test(f.name));
      polinFiles.forEach((f) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.href = f.path;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    } catch {}

    const findFile = (predicates) => {
      for (const p of predicates) {
        const f = files.find((x) => p(x.lower));
        if (f) return f.path;
      }
      return null;
    };

    const regular = findFile([
      (n) => n.includes('polin-regular.'),
      (n) => n.includes('polinregular.'),
      (n) => n === 'polin.ttf',
      (n) => n.endsWith('polin.otf'),
      (n) => n.includes('polin.')
    ]) || '/fonts/Open%2024%20Display%20St.ttf';

    const bold = findFile([
      (n) => n.includes('polin-bold.'),
      (n) => n.includes('polinbold.'),
      (n) => n.includes('bold') && n.includes('polin'),
    ]) || regular;

    const open24 = findFile([
      (n) => n.includes('open 24 display st'),
      (n) => n.includes('open24'),
      (n) => n.includes('display st')
    ]) || '/fonts/Open%2024%20Display%20St.ttf';

    const toFmt = (p) => p.endsWith('.woff2') ? 'woff2' : p.endsWith('.woff') ? 'woff' : p.endsWith('.otf') ? 'opentype' : 'truetype';

    const style = document.createElement('style');
    style.id = 'shchakim-fonts-style';
    // Build @font-face rules for all Polin files present
    const weightFor = (n) => {
      if (n.includes('black')) return 900;
      if (n.includes('extra') && n.includes('bold')) return 800;
      if (n.includes('semibold') || n.includes('semi-bold')) return 600;
      if (n.includes('bold')) return 700;
      if (n.includes('medium')) return 500;
      if (n.includes('extralight') || n.includes('extra-light')) return 200;
      if (n.includes('light')) return 300;
      if (n.includes('hairline')) return 100;
      if (n.includes('thin')) return 100;
      return 400; // regular/default
    };
    const polinFaces = (files || [])
      .filter((f) => /polin/i.test(f.name) && /\.(otf|ttf|woff2?|OTF|TTF|WOFF2?)$/.test(f.name))
      .map((f) => `@font-face { font-family: 'Polin'; src: url('${f.path}') format('${toFmt(f.path)}'); font-weight: ${weightFor(f.lower)}; font-style: normal; font-display: swap; }`)
      .join('\n');

    style.textContent = `
@font-face { font-family: 'Polin'; src: url('${regular}') format('${toFmt(regular)}'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Polin'; src: url('${bold}') format('${toFmt(bold)}'); font-weight: 700; font-style: normal; font-display: swap; }
@font-face { font-family: 'Open 24 Display St'; src: url('${open24}') format('${toFmt(open24)}'); font-weight: 400; font-style: normal; font-display: swap; }
${polinFaces}
body, #shchakim-slider, #shchakim-top-overlay { font-family: 'Polin', Arial, 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', sans-serif; }
/* Force Polin (with Arial fallback for digits) across the site except the digital clock */
body * { font-family: 'Polin', Arial, 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', sans-serif !important; }
#halacha-footer { font-family: 'Polin', Arial, 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', sans-serif !important; }
#shchakim-clock, .title-TP2yIe[data-id="1:24"], [data-role="clock"], .clock { font-family: 'Open 24 Display St', 'Polin', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important; }
`;
    document.head.appendChild(style);
    try { document.fonts && document.fonts.load('1rem Polin'); } catch {}
  }

  // Slider setup: replace the rectangle area with a rotating slider (4 slides, ~20s)
  setupSlider() {
    try {
      console.log('[SLIDER] setupSlider start');

      if (!this._halachaFetched) {
        this._halachaFetched = true;
        (async () => {
          try {
            const r = await fetch(`${this.apiBase}/api/halacha/daily`, { cache: 'no-store' });
            if (!r.ok) {
              console.warn('[SLIDER] prefetch halacha not ok:', r.status);
              return;
            }
            const j = await r.json();
            this.halachaItems = Array.isArray(j?.items) ? j.items : [];
            console.log('[SLIDER] prefetch halacha items:', this.halachaItems.length);
          } catch (e) {
            console.warn('[SLIDER] prefetch halacha failed');
          }
        })();
      }
      // Ensure CSS rule for slide rounding
      if (!document.getElementById('shchakim-slider-style')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'shchakim-slider-style';
        styleEl.textContent = `#shchakim-slider > div { border-radius: 80px; overflow: hidden; }`;
        document.head.appendChild(styleEl);
      }

      let target = this.getFirstElement([
        '.rectangle-27-TP2yIe[data-id="1:38"]',
        '.rectangle-27-TP2yIe',
        '[data-id="1:38"]'
      ]);
      if (!target) {
        target = document.querySelector('.frame-17') || document.body;
        console.warn('[SLIDER] primary target not found; falling back to', target === document.body ? 'body' : '.frame-17');
      }

      // Reference the original image: we'll position the slider exactly there
      const originalImage = document.querySelector('img.x1853632d-c27c-419d-9ae9-ef8c151659c2-2-TP2yIe');

      // Prepare container: prefer placing slider exactly where the original image is
      const parent = (originalImage?.parentElement) || target.parentElement || document.querySelector('.frame-17') || document.body;
      const parentComputed = getComputedStyle(parent);
      if (parentComputed.position === 'static') {
        parent.style.position = 'relative';
      }

      // Determine size from computed styles
      let width = 800;
      let height = 800;
      let top = (target.offsetTop || 0) - 10;
      let left = (target.offsetLeft || 0) - 10;

      if (originalImage) {
        // Use original image exact position and size
        const imgRect = originalImage.getBoundingClientRect();
        width = Math.round(originalImage.clientWidth || imgRect.width || 800);
        height = Math.round(originalImage.clientHeight || imgRect.height || 800);
        top = originalImage.offsetTop;
        left = originalImage.offsetLeft;
      }

      const slider = document.createElement('div');
      slider.id = 'shchakim-slider';
      slider.style.position = 'absolute';
      slider.style.width = width + 'px';
      slider.style.height = height + 'px';
      const sliderGradient = this.gradientCss || (`linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`);
      slider.style.background = '';
      slider.style.backgroundImage = sliderGradient;
      // Match rounded sides: if square, make it a circle; otherwise keep soft corners
      const radiusPx = (width && height && Math.abs(width - height) < 2)
        ? Math.floor(Math.min(width, height) / 2) + 'px'
        : '30px';
      slider.style.borderRadius = radiusPx;
      slider.style.top = top + 'px';
      slider.style.left = left + 'px';
      slider.style.zIndex = '2147483000';
      slider.style.pointerEvents = 'none';
      parent.appendChild(slider);

      // If original image exists, hide it so only the green slider shows there
      if (originalImage) {
        originalImage.style.display = 'none';
      }

      const slides = [];
      const makeSlide = ({ bg, imageUrl, caption, centerCaption }) => {
        const slide = document.createElement('div');
        slide.className = 'shchakim-slide';
        slide.style.position = 'absolute';
        slide.style.inset = '0';
        // background under the image uses site gradient for full sync
        const localGradient = this.gradientCss || (`linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`);
        if (typeof bg === 'string') {
          slide.style.background = bg;
          slide.style.backgroundImage = '';
        } else {
          slide.style.background = '';
          slide.style.backgroundImage = localGradient;
        }
        slide.style.opacity = '0';
        slide.style.transition = 'opacity 600ms ease';
        slide.style.willChange = 'opacity';

        // image element centered, above background
        if (imageUrl) {
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = '';
          img.style.position = 'absolute';
          img.style.left = '50%';
          img.style.top = '50%';
          img.style.transform = 'translate(-50%, -50%)';
          img.style.width = '800px';
          img.style.height = '800px';
          img.style.objectFit = 'contain';
          img.style.borderRadius = 'inherit';
          slide.appendChild(img);
        }

        // optional caption/text overlay
        if (caption) {
          const cap = document.createElement('div');
          cap.textContent = caption;
          cap.setAttribute('dir', 'rtl');
          cap.style.position = 'absolute';
          if (centerCaption) {
            cap.style.left = '50%';
            cap.style.top = '50%';
            cap.style.transform = 'translate(-50%, -50%)';
            cap.style.fontSize = '48px';
            cap.style.fontWeight = '700';
            cap.style.background = 'transparent';
          } else {
            cap.style.left = '50%';
            cap.style.bottom = '16px';
            cap.style.transform = 'translateX(-50%)';
            cap.style.padding = '8px 12px';
            cap.style.background = 'rgba(0,0,0,0.45)';
            cap.style.borderRadius = '8px';
            cap.style.fontSize = '20px';
            cap.style.maxWidth = '90%';
          }
          cap.style.color = '#fff';
          cap.style.textAlign = 'center';
          slide.appendChild(cap);
        }
        slider.appendChild(slide);
        slides.push(slide);
      };

      // Slide 1: use the provided image src only if the original is not visible
      const imgSrc = originalImage?.getAttribute('src') || originalImage?.getAttribute('data-savepage-src');
      const originalVisible = !!(originalImage && getComputedStyle(originalImage).display !== 'none' && originalImage.offsetParent !== null);
      if (imgSrc && !originalVisible) {
        makeSlide({ imageUrl: imgSrc });
      } else {
        makeSlide({});
      }

      // Additional slides from content (images and optional texts)
      const addFrom = [];
      try {
        if (Array.isArray(this.content?.promos?.slides)) {
          addFrom.push(...this.content.promos.slides);
        }
        if (Array.isArray(this.content?.promos?.images)) {
          addFrom.push(...this.content.promos.images.map(url => ({ image: url })));
        }
        if (Array.isArray(this.content?.images)) {
          addFrom.push(...this.content.images.map(url => ({ image: url })));
        }
      } catch {}

      addFrom.slice(0, 3).forEach(entry => {
        const url = entry?.image || entry?.url || (typeof entry === 'string' ? entry : undefined);
        const text = entry?.text || entry?.caption || '';
        makeSlide({ imageUrl: url, caption: text });
      });

      // Reserve slots 1 and 2 for halacha (will be populated by injectHalacha)
      makeSlide({});
      makeSlide({});

      // Add update slides from content.updates (active window only) - AFTER halacha slots
      try {
        const updates = Array.isArray(this.content?.updates) ? this.content.updates : [];
        const todayStr = new Date().toISOString().slice(0, 10);
        const isActive = (u) => {
          const fromOk = !u?.dateFrom || u.dateFrom <= todayStr;
          const toOk = !u?.dateTo || todayStr <= u.dateTo;
          return fromOk && toOk;
        };
        const active = updates.filter(isActive);
        const mkUpdateSlide = (type, title, content, imageUrl) => {
          const slide = document.createElement('div');
          slide.className = 'shchakim-slide';
          slide.style.position = 'absolute';
          slide.style.inset = '0';
          slide.style.opacity = '0';
          slide.style.transition = 'opacity 600ms ease';
          slide.style.willChange = 'opacity';
          const localGradient = this.gradientCss || (`linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`);
          slide.style.background = '';
          slide.style.backgroundImage = localGradient;

          const wrap = document.createElement('div');
          wrap.style.position = 'absolute';
          wrap.style.inset = '0';
          wrap.style.display = 'flex';
          wrap.style.flexDirection = 'column';
          wrap.style.alignItems = 'center';
          wrap.style.justifyContent = 'center';
          wrap.style.padding = '36px';
          wrap.style.gap = '20px';
          wrap.style.direction = 'rtl';
          wrap.style.textAlign = 'center';

          const heading = document.createElement('div');
          heading.textContent = type || 'עדכון';
          heading.style.fontSize = '64px';
          heading.style.fontWeight = '800';
          heading.style.letterSpacing = '0.5px';
          heading.style.color = '#ffffff';
          heading.style.textShadow = '0 2px 6px rgba(0,0,0,0.35)';

          const card = document.createElement('div');
          card.className = 'update-card';
          card.style.background = 'transparent';
          card.style.backgroundColor = 'transparent';
          card.style.borderRadius = '20px';
          card.style.padding = '28px 34px 22px';
          card.style.maxWidth = '90%';
          card.style.maxHeight = '80%';
          card.style.overflow = 'hidden';
          card.style.direction = 'rtl';
          card.style.textAlign = 'right';
          card.style.position = 'relative';

          if (imageUrl) {
            // אם יש תמונה, מציגים רק את התמונה על כל המרובע (ללא כותרת וללא טקסט)
            card.style.padding = '0';
            card.style.width = '100%';
            card.style.height = '100%';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '12px';
            img.style.display = 'block';
            card.appendChild(img);
            wrap.appendChild(card);
            // לא מוסיפים את heading כשיש תמונה
          } else {
            // אם אין תמונה, מציגים כותרת וטקסט
            const t = document.createElement('div');
            t.textContent = title || 'עדכון';
            t.style.fontSize = '40px';
            t.style.fontWeight = '700';
            t.style.color = '#ffffff';
            t.style.margin = '0 0 12px 0';
            t.style.textAlign = 'center';
            t.style.borderBottom = '1px solid rgba(255,255,255,0.6)';
            t.style.paddingBottom = '8px';

            const s = document.createElement('div');
            s.textContent = (content || '').toString();
            s.style.fontSize = '26px';
            s.style.lineHeight = '1.8';
            s.style.color = 'rgba(255,255,245,0.95)';
            s.style.whiteSpace = 'pre-wrap';

            card.appendChild(t);
            card.appendChild(s);
            wrap.appendChild(heading);
            wrap.appendChild(card);
          }
          slide.appendChild(wrap);
          slider.appendChild(slide);
          slides.push(slide);
          return slide; // החזר את הסלייד כדי שנוכל לשמור עליו מידע
        };

        active.forEach((u) => {
          const content = u.content || '';
          const isImageDataUri = typeof content === 'string' && content.trim().startsWith('data:image/');
          let imageUrl = u.image || u.imageUrl || (isImageDataUri ? content.trim() : null);
          const displayContent = isImageDataUri ? '' : content;
          const displayTime = u.displayTime || null;
          
          if (imageUrl) {
            const cached = this.getCachedImage(imageUrl, u.id);
            if (cached) {
              imageUrl = cached;
            } else {
              this.cacheImageFromUrl(imageUrl, u.id).then(cachedUrl => {
                if (cachedUrl && cachedUrl !== imageUrl) {
                  const slide = slider.querySelector(`[data-update-id="${u.id}"]`);
                  if (slide) {
                    const img = slide.querySelector('img');
                    if (img) {
                      img.src = cachedUrl;
                    }
                  }
                }
              });
            }
          }
          
          const slide = mkUpdateSlide(u.type, u.title, displayContent, imageUrl);
          if (slide) {
            slide.dataset.updateId = u.id;
            if (displayTime !== null) {
              slide.dataset.displayTime = displayTime.toString();
            }
          }
        });
      } catch {}

      // If content API includes images, replace backgrounds
      // (no-op now; handled above with explicit img elements)

      // Fetch daily halacha and populate slide 2 and 3
      const injectHalacha = async () => {
        console.log('[SLIDER] injectHalacha start');
        try {
          let items = Array.isArray(this.halachaItems) ? this.halachaItems : [];
          if (!items.length) {
            const resp = await fetch(`${this.apiBase}/api/halacha/daily`, { cache: 'no-store' });
            if (resp.ok) {
          const data = await resp.json();
              items = Array.isArray(data?.items) ? data.items : [];
            }
          }
          console.log('[SLIDER] halacha items:', items.length);
          const mkHalachaSlide = (title, summary) => {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.inset = '0';
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.justifyContent = 'center';
            wrapper.style.padding = '36px';
            wrapper.style.gap = '20px';
            wrapper.style.direction = 'rtl';
            wrapper.style.textAlign = 'center';
            
            const heading = document.createElement('div');
            heading.textContent = 'הלכה יומית';
            heading.style.fontSize = '64px';
            heading.style.fontWeight = '800';
            heading.style.letterSpacing = '0.5px';
            heading.style.color = '#ffffff';
            heading.style.textShadow = '0 2px 6px rgba(0,0,0,0.35)';
            heading.style.fontFamily = "Polin, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
            const card = document.createElement('div');
            card.className = 'halacha-card';
            card.style.background = 'transparent';
            card.style.backgroundColor = 'transparent';
            card.style.borderRadius = '20px';
            card.style.padding = '28px 34px 22px';
            card.style.backdropFilter = 'blur(2px)';
            card.style.maxWidth = '90%';
            card.style.maxHeight = '80%';
            card.style.overflow = 'hidden';
            card.style.direction = 'rtl';
            card.style.textAlign = 'right';
            card.style.position = 'relative';
            card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';

            const t = document.createElement('div');
            t.textContent = title || 'הלכה יומית';
            t.style.fontSize = '40px';
            t.style.fontWeight = '700';
            t.style.color = '#ffffff';
            t.style.margin = '0 0 12px 0';
            t.style.textAlign = 'center';
            t.style.borderBottom = '1px solid rgba(255,255,255,0.6)';
            t.style.paddingBottom = '8px';
            t.style.fontFamily = "Polin, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

            const s = document.createElement('div');
            s.textContent = summary || '';
            s.style.fontSize = '26px';
            s.style.lineHeight = '1.8';
            s.style.color = 'rgba(255,255,245,0.95)';
            s.style.whiteSpace = 'pre-wrap';

            // Footer credit line
            const footer = document.createElement('div');
            footer.id = 'halacha-footer';
            footer.style.marginTop = '14px';
            footer.style.fontSize = '25px';
            footer.style.color = 'rgba(255,255,255,0.7)';
            footer.style.textAlign = 'center';
            footer.style.borderTop = '1px solid rgba(255,255,255,0.25)';
            footer.style.paddingTop = '8px';

            card.appendChild(t);
            card.appendChild(s);
            card.appendChild(footer);

            wrapper.appendChild(heading);
            wrapper.appendChild(card);
            return wrapper;
          };
          const buildFooter = (chapter, credit) => {
            const chap = chapter ? `פרק ${chapter}` : '';
            let cred = credit || 'קיצור תורת המחנה';
            // Avoid double "מתוך"
            if (!/^\s*מתוך/.test(cred)) {
              cred = `מתוך ${cred}`;
            }
            return `${chap}${chap && cred ? ' – ' : ''}${cred}`.trim();
          };

          const slot1 = slides[1] && !slides[1].querySelector('.update-card') ? 1 : null;
          if (items[0] && slot1 !== null && slides[slot1]) {
            slides[slot1].innerHTML = '';
            const localGradient = this.gradientCss || (`linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`);
            slides[slot1].style.background = '';
            slides[slot1].style.backgroundImage = localGradient;
            const el = mkHalachaSlide(items[0].title, items[0].summary);
            const footer = el.querySelector('#halacha-footer');
            if (footer) {
              footer.textContent = buildFooter(items[0].chapter, items[0].credit);
            }
            slides[slot1].appendChild(el);
            slides[slot1].style.opacity = '0';
          }
          const slot2 = slides[2] && !slides[2].querySelector('.update-card') ? 2 : null;
          if (items[1] && slot2 !== null && slides[slot2]) {
            slides[slot2].innerHTML = '';
            const localGradient2 = this.gradientCss || (`linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`);
            slides[slot2].style.background = '';
            slides[slot2].style.backgroundImage = localGradient2;
            const el2 = mkHalachaSlide(items[1].title, items[1].summary);
            const footer2 = el2.querySelector('#halacha-footer');
            if (footer2) {
              footer2.textContent = buildFooter(items[1].chapter, items[1].credit);
            }
            slides[slot2].appendChild(el2);
            slides[slot2].style.opacity = '0';
          }
          if (!items.length) {
            console.warn('[SLIDER] No halacha items returned; keeping default slides');
          }

          // If we successfully built at least one halacha slide, show it immediately
          if (items[0] && slot1 !== null && slides[slot1]) {
            try {
              slides[0] && (slides[0].style.opacity = '0');
              slides[slot1].style.opacity = '1';
              console.log('[SLIDER] Halacha slide shown immediately');
            } catch {}
          } else if (items[0] && slides[0] && !slides[0].querySelector('.update-card')) {
            // Fallback: render halacha into first slide if secondary slide missing and it's not an update
            slides[0].innerHTML = '';
            const localGradientFallback = this.gradientCss || (`linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`);
            slides[0].style.background = '';
            slides[0].style.backgroundImage = localGradientFallback;
            const el = mkHalachaSlide(items[0].title, items[0].summary);
            const footer = el.querySelector('#halacha-footer');
            if (footer) {
              footer.textContent = buildFooter(items[0].chapter, items[0].credit);
            }
            slides[0].appendChild(el);
            slides[0].style.opacity = '1';
            console.log('[SLIDER] Fallback: Halacha rendered in first slide');
          }
        } catch {}
      };
      injectHalacha();

      if (slides.length === 0) {
        console.warn('[SLIDER] no slides created');
        return;
      }
      let current = 0;
      let cycleCount = 0;
      let advanceTimeout = null;
      let isPaused = false;
      
      const findUpdateSlides = () => {
        const updateSlides = [];
        slides.forEach((slide, index) => {
          if (slide && slide.querySelector('.update-card')) {
            updateSlides.push(index);
          }
        });
        return updateSlides.sort((a, b) => a - b);
      };
      
      const updateSlides = findUpdateSlides();
      const lastUpdateIndex = updateSlides.length > 0 ? updateSlides[updateSlides.length - 1] : -1;
      const hasUpdates = updateSlides.length > 0;
      
      console.log('[SLIDER] Update slides indices:', updateSlides);
      console.log('[SLIDER] Last update index:', lastUpdateIndex);
      console.log('[SLIDER] Total slides:', slides.length);
      
      const findFirstHalachaSlide = () => {
        for (let i = 1; i <= 2 && i < slides.length; i++) {
          if (slides[i] && slides[i].querySelector('.halacha-card')) {
            return i;
          }
        }
        return null;
      };
      
      const stopSlider = () => {
        if (advanceTimeout) {
          clearTimeout(advanceTimeout);
          advanceTimeout = null;
        }
        isPaused = true;
      };
      
      const getSlideDuration = (slideIndex) => {
        if (slideIndex === 0) return 10000;
        
        const slide = slides[slideIndex];
        if (slide) {
          const displayTime = slide?.dataset?.displayTime;
          if (displayTime) {
            const timeInMs = parseFloat(displayTime) * 1000;
            return Math.max(5000, Math.min(timeInMs, 5 * 60 * 1000));
          }
        }
        
        return 30000;
      };
      
      const startFromSlide = (startIndex) => {
        if (advanceTimeout) {
          clearTimeout(advanceTimeout);
          advanceTimeout = null;
        }
        isPaused = false;
        slides.forEach((slide, idx) => {
          if (slide) slide.style.opacity = idx === startIndex ? '1' : '0';
        });
        current = startIndex;
        cycleCount = 0;
        const d = getSlideDuration(current);
        advanceTimeout = setTimeout(advance, d);
      };
      
      const advance = () => {
        if (isPaused || !slides[current]) return;
        
        console.log('[SLIDER] Advancing to slide:', current, 'Last update index:', lastUpdateIndex);
        
        if (hasUpdates && current === lastUpdateIndex) {
          console.log('[SLIDER] Reached last update, will transition after display time');
          const d = getSlideDuration(current);
          advanceTimeout = setTimeout(() => {
            console.log('[SLIDER] Last update display time finished, transitioning to letter screen');
            stopSlider();
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ type: 'slider-cycle-complete' }, '*');
            }
          }, d);
          return;
        }
        
        const prev = current;
        current = (current + 1) % slides.length;
        
        if (current === 0) {
          cycleCount++;
          if (!hasUpdates && cycleCount > 0) {
            stopSlider();
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ type: 'slider-cycle-complete' }, '*');
            }
            return;
          }
        }
        
        if (slides[prev]) slides[prev].style.opacity = '0';
        if (slides[current]) slides[current].style.opacity = '1';
        const d = getSlideDuration(current);
        advanceTimeout = setTimeout(advance, d);
      };
      
      const handleMessage = (event) => {
        if (event.data?.type === 'stop-slider') {
          stopSlider();
        } else if (event.data?.type === 'start-from-halacha') {
          const halachaIndex = findFirstHalachaSlide();
          if (halachaIndex !== null) {
            startFromSlide(halachaIndex);
          } else {
            startFromSlide(1);
          }
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      slides[current].style.opacity = '1';
      const initialDuration = getSlideDuration(current);
      advanceTimeout = setTimeout(advance, initialDuration);
    } catch (e) {
      console.error('Failed to setup slider', e);
    }
  }


  calculateScale() {
    const targetWidth = 3840;
    const targetHeight = 2160;
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    
    const scaleX = currentWidth / targetWidth;
    const scaleY = currentHeight / targetHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const multiplier = 1.3;
    return Math.max(0.3, Math.min(2.5, scale * multiplier));
  }

  setupLayout() {
    const body = document.body;
    const frame = document.querySelector('.frame-17');
    
    if (body) {
      body.style.margin = '0';
      body.style.padding = '0';
      body.style.width = '100%';
      body.style.height = '100%';
      body.style.overflow = 'hidden';
    }
    
    const updateScale = () => {
      const scale = this.calculateScale();
      
      if (frame) {
        frame.style.margin = '0 auto';
        frame.style.padding = '0';
        frame.style.left = '50%';
        frame.style.top = '50%';
        frame.style.transform = `translate(-50%, -50%) scale(${scale})`;
        frame.style.transformOrigin = 'center center';
        frame.style.position = 'absolute';
        frame.style.boxSizing = 'border-box';
        frame.style.width = '2642px';
        frame.style.height = '1531px';
        frame.style.overflow = 'hidden';
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    
    const screen = document.querySelector('.screen');
    if (screen) {
      screen.style.boxSizing = 'border-box';
      screen.style.width = '100vw';
      screen.style.height = '100vh';
      screen.style.overflow = 'hidden';
      screen.style.display = 'flex';
      screen.style.alignItems = 'center';
      screen.style.justifyContent = 'center';
    }
    
    const style = document.createElement('style');
    style.textContent = `
      .frame-17 * { box-sizing: border-box; }
      .frame-17 {
        margin: 0 auto !important;
        left: 50% !important;
        top: 50% !important;
        transform-origin: center center !important;
        position: absolute !important;
        width: 2642px !important;
        height: 1531px !important;
        overflow: hidden !important;
      }
      body {
        overflow: hidden !important;
        width: 100vw !important;
        height: 100vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      html {
        overflow: hidden !important;
        width: 100vw !important;
        height: 100vh !important;
      }
      .screen {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
    `;
    document.head.appendChild(style);
  }

  setupPeriodicUpdates() {
    this.contentInterval = setInterval(() => {
      this.loadContent();
    }, this.updateInterval);
  }

  async updateHalachaInSlider() {
    try {
      const slider = document.getElementById('shchakim-slider');
      if (!slider) return;
      
      const slides = Array.from(slider.querySelectorAll('.shchakim-slide'));
      if (slides.length < 2) return;
      
      const resp = await fetch(`${this.apiBase}/api/halacha/daily`, { cache: 'no-store' });
      if (!resp.ok) return;
      
      const data = await resp.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      
      if (!items.length) return;
      
      const mkHalachaSlide = (title, summary, chapter, credit) => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.inset = '0';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.padding = '36px';
        wrapper.style.gap = '20px';
        wrapper.style.direction = 'rtl';
        wrapper.style.textAlign = 'center';
        
        const heading = document.createElement('div');
        heading.textContent = 'הלכה יומית';
        heading.style.fontSize = '64px';
        heading.style.fontWeight = '800';
        heading.style.letterSpacing = '0.5px';
        heading.style.color = '#ffffff';
        heading.style.textShadow = '0 2px 6px rgba(0,0,0,0.35)';
        heading.style.fontFamily = "Polin, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
        
        const card = document.createElement('div');
        card.className = 'halacha-card';
        card.style.background = 'transparent';
        card.style.backgroundColor = 'transparent';
        card.style.borderRadius = '20px';
        card.style.padding = '28px 34px 22px';
        card.style.backdropFilter = 'blur(2px)';
        card.style.maxWidth = '90%';
        card.style.maxHeight = '80%';
        card.style.overflow = 'hidden';
        card.style.direction = 'rtl';
        card.style.textAlign = 'right';
        card.style.position = 'relative';
        card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';

        const t = document.createElement('div');
        t.textContent = title || 'הלכה יומית';
        t.style.fontSize = '40px';
        t.style.fontWeight = '700';
        t.style.color = '#ffffff';
        t.style.margin = '0 0 12px 0';
        t.style.textAlign = 'center';
        t.style.borderBottom = '1px solid rgba(255,255,255,0.6)';
        t.style.paddingBottom = '8px';
        t.style.fontFamily = "Polin, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

        const s = document.createElement('div');
        s.textContent = summary || '';
        s.style.fontSize = '26px';
        s.style.lineHeight = '1.8';
        s.style.color = 'rgba(255,255,245,0.95)';
        s.style.whiteSpace = 'pre-wrap';

        const footer = document.createElement('div');
        footer.id = 'halacha-footer';
        footer.style.marginTop = '14px';
        footer.style.fontSize = '25px';
        footer.style.color = 'rgba(255,255,255,0.7)';
        footer.style.textAlign = 'center';
        footer.style.borderTop = '1px solid rgba(255,255,255,0.25)';
        footer.style.paddingTop = '8px';
        
        const buildFooter = (chapter, credit) => {
          const chap = chapter ? `פרק ${chapter}` : '';
          let cred = credit || 'קיצור תורת המחנה';
          if (!/^\s*מתוך/.test(cred)) {
            cred = `מתוך ${cred}`;
          }
          return `${chap}${chap && cred ? ' – ' : ''}${cred}`.trim();
        };
        footer.textContent = buildFooter(chapter, credit);

        card.appendChild(t);
        card.appendChild(s);
        card.appendChild(footer);
        wrapper.appendChild(heading);
        wrapper.appendChild(card);
        return wrapper;
      };

      const slot1 = slides[1] && !slides[1].querySelector('.update-card') ? 1 : null;
      if (items[0] && slot1 !== null && slides[slot1]) {
        const currentOpacity = slides[slot1].style.opacity;
        slides[slot1].innerHTML = '';
        const localGradient = this.gradientCss || (`linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`);
        slides[slot1].style.background = '';
        slides[slot1].style.backgroundImage = localGradient;
        const el = mkHalachaSlide(items[0].title, items[0].summary, items[0].chapter, items[0].credit);
        slides[slot1].appendChild(el);
        slides[slot1].style.opacity = currentOpacity;
      }
      
      const slot2 = slides[2] && !slides[2].querySelector('.update-card') ? 2 : null;
      if (items[1] && slot2 !== null && slides[slot2]) {
        const currentOpacity = slides[slot2].style.opacity;
        slides[slot2].innerHTML = '';
        const localGradient2 = this.gradientCss || (`linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`);
        slides[slot2].style.background = '';
        slides[slot2].style.backgroundImage = localGradient2;
        const el2 = mkHalachaSlide(items[1].title, items[1].summary, items[1].chapter, items[1].credit);
        slides[slot2].appendChild(el2);
        slides[slot2].style.opacity = currentOpacity;
      }
      
      this.halachaItems = items;
    } catch (error) {
      console.error('[SLIDER] Error updating halacha:', error);
    }
  }

  updateSliderContent() {
    try {
      const slider = document.getElementById('shchakim-slider');
      if (!slider) return;
      
      const slides = Array.from(slider.querySelectorAll('.shchakim-slide'));
      const updateSlides = slides.filter(slide => slide.querySelector('.update-card'));
      
      const updates = Array.isArray(this.content?.updates) ? this.content.updates : [];
      const todayStr = new Date().toISOString().slice(0, 10);
      const isActive = (u) => {
        const fromOk = !u?.dateFrom || u.dateFrom <= todayStr;
        const toOk = !u?.dateTo || todayStr <= u.dateTo;
        return fromOk && toOk;
      };
      const active = updates.filter(isActive);
      
      if (active.length === updateSlides.length) {
        active.forEach((update, index) => {
          if (updateSlides[index]) {
            const wrap = updateSlides[index].querySelector('div[style*="flex-direction: column"]');
            const headingEl = wrap ? wrap.querySelector('div:first-child') : null;
            const card = updateSlides[index].querySelector('.update-card');
            const titleEl = card ? card.querySelector('div:first-child') : null;
            const contentEl = card ? card.querySelector('div:last-child') : null;
            const existingImg = card ? card.querySelector('img') : null;
            // בדוק אם content הוא תמונה base64
            const content = update.content || '';
            const isImageDataUri = typeof content === 'string' && content.trim().startsWith('data:image/');
            const imageUrl = update.image || update.imageUrl || (isImageDataUri ? content.trim() : null);
            const displayTime = update.displayTime || null;
            
            if (updateSlides[index] && displayTime !== null) {
              updateSlides[index].dataset.displayTime = displayTime.toString();
            } else if (updateSlides[index] && displayTime === null) {
              delete updateSlides[index].dataset.displayTime;
            }
            
            if (imageUrl && card) {
              let finalImageUrl = imageUrl;
              const cached = this.getCachedImage(imageUrl, update.id);
              if (cached) {
                finalImageUrl = cached;
              } else {
                this.cacheImageFromUrl(imageUrl, update.id).then(cachedUrl => {
                  if (cachedUrl && cachedUrl !== imageUrl) {
                    const img = card.querySelector('img');
                    if (img) {
                      img.src = cachedUrl;
                    }
                  }
                });
              }
              
              card.style.padding = '0';
              card.style.width = '100%';
              card.style.height = '100%';
              
              if (headingEl) headingEl.style.display = 'none';
              if (titleEl) titleEl.style.display = 'none';
              if (contentEl) contentEl.style.display = 'none';
              
              if (existingImg) {
                existingImg.src = finalImageUrl;
                existingImg.style.width = '100%';
                existingImg.style.height = '100%';
                existingImg.style.objectFit = 'contain';
                existingImg.style.marginBottom = '0';
              } else {
                const img = document.createElement('img');
                img.src = finalImageUrl;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '12px';
                img.style.display = 'block';
                card.innerHTML = '';
                card.appendChild(img);
              }
            } else {
              // אם אין תמונה, מציגים כותרת וטקסט
              if (headingEl) {
                headingEl.textContent = update.type || 'עדכון';
                headingEl.style.display = 'block';
              }
              if (titleEl) {
                titleEl.textContent = update.title || 'עדכון';
                titleEl.style.display = 'block';
              }
              if (contentEl) {
                // אם content הוא תמונה, לא מציגים אותו כטקסט
                const content = update.content || '';
                const isImageDataUri = typeof content === 'string' && content.trim().startsWith('data:image/');
                if (!isImageDataUri) {
                  contentEl.textContent = content.toString();
                  contentEl.style.display = 'block';
                } else {
                  contentEl.style.display = 'none';
                }
              }
              if (existingImg) {
                existingImg.remove();
              }
              card.style.padding = '28px 34px 22px';
              card.style.width = 'auto';
              card.style.height = 'auto';
            }
          }
        });
      } else {
        updateSlides.forEach(slide => {
          if (slide.parentElement) {
            slide.parentElement.removeChild(slide);
          }
        });
        
        const mkUpdateSlide = (type, title, content, imageUrl) => {
          const slide = document.createElement('div');
          slide.className = 'shchakim-slide';
          slide.style.position = 'absolute';
          slide.style.inset = '0';
          slide.style.opacity = '0';
          slide.style.transition = 'opacity 600ms ease';
          slide.style.willChange = 'opacity';
          const localGradient = this.gradientCss || (`linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`);
          slide.style.background = '';
          slide.style.backgroundImage = localGradient;

          const wrap = document.createElement('div');
          wrap.style.position = 'absolute';
          wrap.style.inset = '0';
          wrap.style.display = 'flex';
          wrap.style.flexDirection = 'column';
          wrap.style.alignItems = 'center';
          wrap.style.justifyContent = 'center';
          wrap.style.padding = '36px';
          wrap.style.gap = '20px';
          wrap.style.direction = 'rtl';
          wrap.style.textAlign = 'center';

          const heading = document.createElement('div');
          heading.textContent = type || 'עדכון';
          heading.style.fontSize = '64px';
          heading.style.fontWeight = '800';
          heading.style.letterSpacing = '0.5px';
          heading.style.color = '#ffffff';
          heading.style.textShadow = '0 2px 6px rgba(0,0,0,0.35)';

          const card = document.createElement('div');
          card.className = 'update-card';
          card.style.background = 'transparent';
          card.style.backgroundColor = 'transparent';
          card.style.borderRadius = '20px';
          card.style.padding = '28px 34px 22px';
          card.style.maxWidth = '90%';
          card.style.maxHeight = '80%';
          card.style.overflow = 'hidden';
          card.style.direction = 'rtl';
          card.style.textAlign = 'right';
          card.style.position = 'relative';

          if (imageUrl) {
            // אם יש תמונה, מציגים רק את התמונה על כל המרובע (ללא כותרת וללא טקסט)
            card.style.padding = '0';
            card.style.width = '100%';
            card.style.height = '100%';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '12px';
            img.style.display = 'block';
            card.appendChild(img);
            wrap.appendChild(card);
            // לא מוסיפים את heading כשיש תמונה
          } else {
            // אם אין תמונה, מציגים כותרת וטקסט
            const t = document.createElement('div');
            t.textContent = title || 'עדכון';
            t.style.fontSize = '40px';
            t.style.fontWeight = '700';
            t.style.color = '#ffffff';
            t.style.margin = '0 0 12px 0';
            t.style.textAlign = 'center';
            t.style.borderBottom = '1px solid rgba(255,255,255,0.6)';
            t.style.paddingBottom = '8px';

            const s = document.createElement('div');
            s.textContent = (content || '').toString();
            s.style.fontSize = '26px';
            s.style.lineHeight = '1.8';
            s.style.color = 'rgba(255,255,245,0.95)';
            s.style.whiteSpace = 'pre-wrap';

            card.appendChild(t);
            card.appendChild(s);
            wrap.appendChild(heading);
            wrap.appendChild(card);
          }
          slide.appendChild(wrap);
          slider.appendChild(slide);
          return slide; // החזר את הסלייד כדי שנוכל לשמור עליו מידע
        };

        active.forEach((u) => {
          const content = u.content || '';
          const isImageDataUri = typeof content === 'string' && content.trim().startsWith('data:image/');
          let imageUrl = u.image || u.imageUrl || (isImageDataUri ? content.trim() : null);
          const displayContent = isImageDataUri ? '' : content;
          const displayTime = u.displayTime || null;
          
          if (imageUrl) {
            const cached = this.getCachedImage(imageUrl, u.id);
            if (cached) {
              imageUrl = cached;
            } else {
              this.cacheImageFromUrl(imageUrl, u.id).then(cachedUrl => {
                if (cachedUrl && cachedUrl !== imageUrl) {
                  const slide = slider.querySelector(`[data-update-id="${u.id}"]`);
                  if (slide) {
                    const img = slide.querySelector('img');
                    if (img) {
                      img.src = cachedUrl;
                    }
                  }
                }
              });
            }
          }
          
          const slide = mkUpdateSlide(u.type, u.title, displayContent, imageUrl);
          if (slide) {
            slide.dataset.updateId = u.id;
            if (displayTime !== null) {
              slide.dataset.displayTime = displayTime.toString();
            }
          }
        });
      }
    } catch (error) {
      console.error('[SLIDER] Error updating slider content:', error);
    }
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
const initIntegration = () => {
  console.log('[INTEGRATION] Initializing ShchakimIntegration, DOM ready state:', document.readyState);
  setTimeout(() => {
    new ShchakimIntegration();
  }, 100);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIntegration);
} else {
  initIntegration();
}
