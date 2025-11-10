class LetterIntegration {
  constructor() {
    this.apiBase = window.location.origin;
    this.themeColor = '#054a36';
    this.latitude = 31.7683;
    this.longitude = -35.2137;
    this.config = null;
    this.content = null;
    this.zmanimData = null;
    this.clockInterval = null;
    this.init();
  }

  async init() {
    try {
      this.disableScrolling();
      this.setupLayout();
      await this.loadLocationConfig();
      await this.loadContent();
      setTimeout(() => {
        if (this.content?.theme || this.content?.background) {
          const themePrimary = this.content?.theme?.primaryHex || this.content?.boardInfo?.theme?.primaryHex || this.themeColor;
          this.updateTheme({ 
            primaryHex: themePrimary,
            gradient: this.content?.background?.colors || this.content?.theme?.gradient 
          });
        }
      }, 200);
      this.setupLiveClock();
      this.setupLiveDate();
      this.updateParasha();
      this.updateOrganization();
      this.updateLetter();
      this.updateDailyTimes();
      this.setupFonts();
      this.setupPeriodicUpdates();
    } catch (error) {
      console.error('Failed to initialize Letter integration:', error);
    }
  }

  disableScrolling() {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    const prevent = (e) => { e.preventDefault(); return false; };
    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchmove', prevent, { passive: false });
    window.addEventListener('scroll', () => { window.scrollTo(0, 0); }, { passive: false });
  }

  async loadLocationConfig() {
    try {
      const response = await fetch('/config.json');
      if (response.ok) {
        this.config = await response.json();
        if (this.config.location) {
          this.latitude = Number(this.config.location.latitude) || 31.7683;
          let lng = Number(this.config.location.longitude) || -35.2137;
          this.longitude = -Math.abs(isNaN(lng) ? Number(this.config.location.longitude) : lng);
        }
      }
    } catch (e) {
      console.warn('Failed to load config.json', e);
    }
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
      this.content = data;
      const locObj = data?.boardInfo?.location;
      if (locObj?.latitude && locObj?.longitude) {
        this.latitude = Number(locObj.latitude);
        const lng = Number(locObj.longitude);
        this.longitude = -Math.abs(isNaN(lng) ? Number(locObj.longitude) : lng);
      }
      const themePrimary = data?.theme?.primaryHex || data?.boardInfo?.theme?.primaryHex || '#054a36';
      this.themeColor = themePrimary;
      
      this.updateTheme({ primaryHex: themePrimary, gradient: (data?.background?.colors || data?.theme?.gradient) });
      
      await this.fetchZmanim();
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

  async fetchZmanim() {
    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const locationKey = `${this.latitude.toFixed(4)}_${this.longitude.toFixed(4)}`;
      const zmanimKey = `shchakim_zmanim_${dateStr}_${locationKey}`;
      
      const cached = localStorage.getItem(zmanimKey);
      if (cached) {
        try {
          this.zmanimData = JSON.parse(cached);
          return;
        } catch (e) {
          console.warn('Failed to parse cached zmanim', e);
        }
      }

      const response = await fetch(`${this.apiBase}/api/zmanim`, {
        method: 'POST',
        headers: { 'accept': 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ latitude: this.latitude, longitude: this.longitude, date: dateStr })
      });

      if (response.ok) {
        const data = await response.json();
        this.zmanimData = data;
        localStorage.setItem(zmanimKey, JSON.stringify(data));
        
        const nextMidnight = new Date(now);
        nextMidnight.setDate(now.getDate() + 1);
        nextMidnight.setHours(0, 0, 0, 0);
        const msUntilMidnight = nextMidnight.getTime() - now.getTime();
        setTimeout(() => {
          localStorage.removeItem(zmanimKey);
        }, msUntilMidnight);
      }
    } catch (error) {
      console.error('Error fetching zmanim:', error);
    }
  }

  setupLiveClock() {
    const clockElement = document.querySelector('h1.title-7kVli2[data-id="1007:125"]');
    if (!clockElement) return;

    clockElement.style.fontFamily = "'Open 24 Display St', 'Open 24 Display St-Regular', monospace";

    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    };

    updateClock();
    this.clockInterval = setInterval(updateClock, 1000);
  }

  setupLiveDate() {
    const dateElement = document.querySelector('p.x1825-7kVli2[data-id="1007:126"]');
    if (!dateElement) return;

    const updateDate = async () => {
      const now = new Date();
      const hebrewDate = await this.getHebrewDate(now);
      const dayOfWeek = this.getDayOfWeekHebrew(now);
      const gregorianDate = this.getGregorianDate(now);
      dateElement.textContent = `${hebrewDate}\n${dayOfWeek}  ${gregorianDate}`;
    };

    updateDate();
    setInterval(updateDate, 60000);
  }

  async getHebrewDate(date) {
    if (this.zmanimData?.hebrew?.formatted) {
      return this.zmanimData.hebrew.formatted;
    }
    
    if (this.zmanimData?.hebrew?.date) {
      return this.zmanimData.hebrew.date;
    }
    
    if (this.zmanimData?.hebrew?.day && this.zmanimData?.hebrew?.month && this.zmanimData?.hebrew?.year) {
      const hebrewMonths = [
        'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר',
        'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
      ];
      const day = this.zmanimData.hebrew.day;
      const monthIndex = this.zmanimData.hebrew.month - 1;
      const year = this.zmanimData.hebrew.year;
      const yearStr = year.toString();
      
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
    
    try {
      const dateStr = date.toISOString().slice(0, 10);
      const response = await fetch(`${this.apiBase}/api/zmanim`, {
        method: 'POST',
        headers: { 'accept': 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ latitude: this.latitude, longitude: this.longitude, date: dateStr })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.hebrew?.formatted) {
          return data.hebrew.formatted;
        }
        if (data.hebrew?.day && data.hebrew?.month && data.hebrew?.year) {
          const hebrewMonths = [
            'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר',
            'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
          ];
          const day = data.hebrew.day;
          const monthIndex = data.hebrew.month - 1;
          const year = data.hebrew.year;
          const yearStr = year.toString();
          
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
      }
    } catch (e) {
      console.warn('Failed to fetch Hebrew date', e);
    }
    
    return 'טעינה...';
  }

  getDayOfWeekHebrew(date) {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[date.getDay()];
  }

  getGregorianDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}.${month}.${year}`;
  }

  updateParasha() {
    const parashaElement = document.querySelector('div[data-id="1007:124"] .span0-J6uY4J');
    const orgElement = document.querySelector('div[data-id="1007:124"] .span2-J6uY4J');
    
    if (parashaElement && this.zmanimData?.parasha) {
      parashaElement.textContent = `פרשת ${this.zmanimData.parasha}`;
    }
    
    if (orgElement && this.config?.organization?.name) {
      orgElement.textContent = this.config.organization.name;
    }
  }

  updateOrganization() {
    const orgElement = document.querySelector('div[data-id="1007:124"] .span2-J6uY4J');
    if (orgElement && this.config?.organization?.name) {
      orgElement.textContent = this.config.organization.name;
    } else if (orgElement && this.content?.boardInfo?.base_name) {
      orgElement.textContent = this.content.boardInfo.base_name;
    }
  }

  updateLetter() {
    const titleElements = document.querySelectorAll('p.x-7kVli2[data-id="1016:226"], p.x-uw3PhT[data-id="1016:228"]');
    const contentElements = document.querySelectorAll('p.x-0MVGL4[data-id="1015:220"], p.x-I2QLxE[data-id="1015:223"], p.x-xcJxFm[data-id="1015:224"]');
    const signatureImg = document.querySelector('img.x1-7kVli2[data-id="1016:227"]');
    
    if (this.content?.letter) {
      titleElements.forEach(el => {
        if (this.zmanimData?.parasha) {
          el.textContent = `אגרת רבצ"ר - פרשת ${this.zmanimData.parasha}`;
        }
      });

      let contentParts = [];
      if (Array.isArray(this.content.letter.content)) {
        contentParts = [...this.content.letter.content];
      } else if (typeof this.content.letter.content === 'string') {
        contentParts = this.content.letter.content.split('\n\n');
      }
      
      const lastContentElement = contentElements[contentElements.length - 1];
      const signatureText = 'תא"ל הרב איל קרים הרב הראשי לצה"ל';
      
      if (contentParts.length > 0) {
        const lastPart = contentParts[contentParts.length - 1];
        if (!lastPart.includes('בהוקרה') && !lastPart.includes('תא"ל')) {
          contentParts[contentParts.length - 1] = lastPart + '\nבהוקרה רבה,';
        }
      } else {
        contentParts.push('בהוקרה רבה,');
      }
      
      contentElements.forEach((el, idx) => {
        if (idx < contentParts.length) {
          el.textContent = contentParts[idx];
        }
      });
      
      if (signatureImg) {
        setTimeout(() => {
          let signatureTextEl = signatureImg.nextElementSibling;
          if (!signatureTextEl || !signatureTextEl.classList.contains('signature-text')) {
            signatureTextEl = document.createElement('p');
            signatureTextEl.className = 'signature-text leon-productregular-normal-black-52px';
            signatureTextEl.style.marginTop = '20px';
            signatureTextEl.style.fontFamily = "Polin, 'Polin-A-Regular', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
            signatureImg.parentNode.insertBefore(signatureTextEl, signatureImg.nextSibling);
          }
          
          const currentText = signatureTextEl.textContent || '';
          if (!currentText.includes('תא"ל') && !currentText.includes('הרב הראשי')) {
            signatureTextEl.textContent = 'תא"ל הרב איל קרים הרב הראשי לצה"ל';
          }
        }, 100);
      } else if (lastContentElement) {
        setTimeout(() => {
          const currentText = lastContentElement.textContent || '';
          if (!currentText.includes('תא"ל') && !currentText.includes('הרב הראשי')) {
            lastContentElement.textContent = currentText + (currentText ? '\n' : '') + signatureText;
          }
        }, 100);
      }
    } else {
      const lastElement = contentElements[contentElements.length - 1];
      if (lastElement) {
        const currentText = lastElement.textContent || '';
        const fullSignature = 'בהוקרה רבה, תא"ל הרב איל קרים הרב הראשי לצה"ל';
        if (!currentText.includes('תא"ל') && !currentText.includes('הרב הראשי')) {
          lastElement.textContent = currentText + (currentText ? '\n' : '') + fullSignature;
        }
      }
      
      if (signatureImg) {
        setTimeout(() => {
          let signatureTextEl = signatureImg.nextElementSibling;
          if (!signatureTextEl || !signatureTextEl.classList.contains('signature-text')) {
            signatureTextEl = document.createElement('p');
            signatureTextEl.className = 'signature-text leon-productregular-normal-black-52px';
            signatureTextEl.style.marginTop = '20px';
            signatureTextEl.style.fontFamily = "Polin, 'Polin-A-Regular', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
            signatureImg.parentNode.insertBefore(signatureTextEl, signatureImg.nextSibling);
          }
          
          const currentText = signatureTextEl.textContent || '';
          if (!currentText.includes('תא"ל') && !currentText.includes('הרב הראשי')) {
            signatureTextEl.textContent = 'תא"ל הרב איל קרים הרב הראשי לצה"ל';
          }
        }, 100);
      }
    }
  }

  getZmanimTime(zmanimData, base) {
    if (!zmanimData || !zmanimData.times) return null;
    const times = zmanimData.times;
    const keyMap = {
      'sunrise': ['zricha', 'sunrise'],
      'alot_hashachar': ['alot72', 'alot90', 'alot_hashachar'],
      'talitTefillin': ['talitTefillin'],
      'sunset': ['shkiya', 'sunset'],
      'stars_out': ['tzait', 'stars_out'],
      'chatzot': ['chatzot']
    };
    const possibleKeys = keyMap[base] || [base];
    for (const key of possibleKeys) {
      if (times[key]) return times[key];
    }
    return null;
  }

  toHHMM(value) {
    if (!value) return '--:--';
    if (typeof value === 'string') {
      if (value.includes('T')) {
        const timePart = value.split('T')[1]?.split(/[Z+-]/)[0] || '';
        const [timeStr] = timePart.split('.');
        const [h, m] = (timeStr || '').split(':');
        return `${String(Number(h)||0).padStart(2,'0')}:${String(Number(m)||0).padStart(2,'0')}`;
      }
      if (/^\d{2}:\d{2}$/.test(value)) return value;
    }
    try {
      const d = new Date(value);
      return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    } catch { return '--:--'; }
  }

  updateDailyTimes() {
    if (!this.zmanimData) return;

    try {
      const mappings = [
        { base: 'alot_hashachar', title: 'עלות השחר', timeId: '1007:173' },
        { base: 'sunrise', title: 'זריחה', timeId: '1007:176' },
        { base: 'talitTefillin', title: 'טלית ותפילין', timeId: '1007:182' },
        { base: 'stars_out', title: 'צאת הכוכבים', timeId: '1007:183' },
        { base: 'sunset', title: 'שקיעה', timeId: '1007:184' },
        { base: 'chatzot', title: 'חצות היום', timeId: '1007:185' }
      ];

      mappings.forEach(({ base, timeId }) => {
        const time = this.getZmanimTime(this.zmanimData, base);
        const hhmm = this.toHHMM(time);
        const timeEl = document.querySelector(`div[data-id="${timeId}"]`);
        if (timeEl) {
          timeEl.textContent = hhmm;
        }
      });

      const titleMappings = [
        { title: 'עלות השחר', titleId: '1007:150' },
        { title: 'זריחה', titleId: '1007:158' },
        { title: 'טלית ותפילין', titleId: '1007:166' },
        { title: 'צאת הכוכבים', titleId: '1007:167' },
        { title: 'שקיעה', titleId: '1007:168' },
        { title: 'חצות היום', titleId: '1007:171' }
      ];

      titleMappings.forEach(({ title, titleId }) => {
        const titleEl = document.querySelector(`div[data-id="${titleId}"]`);
        if (titleEl) {
          titleEl.textContent = title;
        }
      });
    } catch (e) {
      console.warn('Failed updating daily times', e);
    }
  }

  updateTheme(theme) {
    if (!theme) return;
    
    this.themeColor = theme.primaryHex || this.themeColor || '#054a36';
    
    let gradientCss = '';
    const colors = Array.isArray(theme?.gradient) ? theme.gradient : Array.isArray(this.content?.background?.colors) ? this.content.background.colors : null;
    if (colors && colors.length >= 2) {
      gradientCss = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
    } else {
      gradientCss = `linear-gradient(135deg, ${this.themeColor} 0%, ${this.themeColor} 100%)`;
    }
    
    document.body.style.backgroundImage = gradientCss;
    document.body.style.backgroundColor = '';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    
    const frame = document.querySelector('.frame-18');
    if (frame) {
      frame.style.backgroundImage = gradientCss;
      frame.style.backgroundColor = '';
    }
    
    const screen = document.querySelector('.screen');
    if (screen) {
      screen.style.backgroundImage = gradientCss;
      screen.style.backgroundColor = '';
    }
    
    const rectangle51 = document.querySelector('.rectangle-51-7kVli2');
    if (rectangle51) {
      rectangle51.style.backgroundImage = gradientCss;
      rectangle51.style.background = gradientCss;
      rectangle51.style.backgroundColor = 'transparent';
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
    const frame = document.querySelector('.frame-18');
    
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
        frame.style.marginLeft = '0';
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
      .frame-18 * { box-sizing: border-box; }
      .frame-18 {
        margin: 0 auto !important;
        margin-left: 0 !important;
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

  setupFonts() {
    const polinFont = "Polin, 'Polin-A-Regular', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    const open24Font = "'Open 24 Display St', 'Open 24 Display St-Regular', monospace";
    
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Polin';
        src: url('/fonts/Polin/Polin-A-Regular.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Open 24 Display St';
        src: url('/fonts/Open 24 Display St.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      .frame-18,
      .frame-18 *,
      body,
      body * {
        font-family: ${polinFont} !important;
      }
      body > div > h1,
      h1.title-7kVli2 {
        font-family: ${open24Font} !important;
      }
      .x5-7kVli2,
      .span2-J6uY4J,
      .x5-7kVli2 *,
      .span2-J6uY4J * {
        font-size: 52px !important;
      }
    `;
    document.head.appendChild(style);
    
    const allElements = document.querySelectorAll('.frame-18 *');
    allElements.forEach(el => {
      el.style.fontFamily = polinFont;
    });
    
    const h1Elements = document.querySelectorAll('body > div > h1, h1.title-7kVli2');
    h1Elements.forEach(el => {
      el.style.fontFamily = open24Font;
    });
    
    const span2Elements = document.querySelectorAll('.span2-J6uY4J, .x5-7kVli2');
    span2Elements.forEach(el => {
      el.style.fontSize = '52px';
      if (el.children) {
        Array.from(el.children).forEach(child => {
          child.style.fontSize = '52px';
        });
      }
    });
  }

  setupPeriodicUpdates() {
    setInterval(async () => {
      await this.loadContent();
      this.updateParasha();
      this.updateOrganization();
      this.updateLetter();
      this.updateDailyTimes();
    }, 60000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new LetterIntegration();
  });
} else {
  new LetterIntegration();
}

