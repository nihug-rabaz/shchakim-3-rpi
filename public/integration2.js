class LetterIntegration {
  constructor() {
    this.apiBase = window.location.origin;
    this.externalApiBase = 'https://shchakim.rabaz.co.il';
    this.themeColor = '#054a36';
    this.latitude = 31.7683;
    this.longitude = -35.2137;
    this.config = null;
    this.content = null;
    this.zmanimData = null;
    this.clockInterval = null;
    this.isOnline = navigator.onLine;
    this.init();
    this.setupOnlineListeners();
  }

  async init() {
    try {
      this.disableScrolling();
      this.setupLayout();
      await this.loadLocationConfig();
      await this.loadContent();
      
      if (this.content?.theme || this.content?.background) {
        const themePrimary = this.content?.theme?.primaryHex || this.content?.boardInfo?.theme?.primaryHex || this.themeColor;
        this.updateTheme({ 
          primaryHex: themePrimary,
          gradient: this.content?.background?.colors || this.content?.theme?.gradient 
        });
      }
      
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
      await this.updateQRCodes();
      this.updateDailyTimes();
      this.setupFonts();
      this.setupPeriodicUpdates();
      // Update credit position after layout is set up
      setTimeout(() => {
        this.updateCredit();
      }, 500);
    } catch (error) {
      console.error('Failed to initialize Letter integration:', error);
    }
  }

  setupOnlineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.loadContent();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async checkOnline() {
    if (!navigator.onLine) {
      this.isOnline = false;
      return false;
    }
    try {
      const boardId = this.getBoardId();
      if (!boardId) {
        this.isOnline = false;
        return false;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const response = await fetch(`${this.apiBase}/api/display/content?boardId=${encodeURIComponent(boardId)}&t=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        this.isOnline = response.ok;
        return this.isOnline;
      } catch (e) {
        clearTimeout(timeoutId);
        this.isOnline = false;
        return false;
      }
    } catch {
      this.isOnline = false;
      return false;
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
    const configKey = 'shchakim_config';
    const configTimestampKey = 'shchakim_config_timestamp';
    
    try {
      const cachedConfig = localStorage.getItem(configKey);
      const cachedTimestamp = localStorage.getItem(configTimestampKey);
      
      if (cachedConfig && cachedTimestamp) {
        try {
          this.config = JSON.parse(cachedConfig);
          if (this.config.location) {
            this.latitude = Number(this.config.location.latitude) || 31.7683;
            let lng = Number(this.config.location.longitude) || -35.2137;
            this.longitude = -Math.abs(isNaN(lng) ? Number(this.config.location.longitude) : lng);
          }
        } catch (e) {
          console.warn('Failed to parse cached config', e);
        }
      }
      
      const isOnline = await this.checkOnline();
      if (isOnline) {
        try {
          const response = await fetch('/config.json', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store' }
          });
          if (response.ok) {
            this.config = await response.json();
            localStorage.setItem(configKey, JSON.stringify(this.config));
            localStorage.setItem(configTimestampKey, Date.now().toString());
            
            if (this.config.location) {
              this.latitude = Number(this.config.location.latitude) || 31.7683;
              let lng = Number(this.config.location.longitude) || -35.2137;
              this.longitude = -Math.abs(isNaN(lng) ? Number(this.config.location.longitude) : lng);
            }
          }
        } catch (e) {
          console.warn('Failed to load config.json from server', e);
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

      const contentKey = `shchakim_content_${boardId}`;
      const contentTimestampKey = `shchakim_content_timestamp_${boardId}`;
      
      const cachedContent = localStorage.getItem(contentKey);
      const cachedTimestamp = localStorage.getItem(contentTimestampKey);
      
      if (cachedContent) {
        try {
          const data = JSON.parse(cachedContent);
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
          this.updateParasha();
          this.updateOrganization();
          // Update credit position after content loads
          setTimeout(() => {
            this.updateCredit();
          }, 100);
          this.updateLetter();
          await this.updateQRCodes();
        } catch (e) {
          console.warn('Failed to parse cached content', e);
        }
      }
      
      const isOnline = await this.checkOnline();
      if (isOnline) {
        try {
          const ts = Date.now();
          const response = await fetch(`${this.apiBase}/api/display/content?boardId=${encodeURIComponent(boardId)}&t=${ts}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store' },
            signal: AbortSignal.timeout(10000)
          });
          if (response.ok) {
            const data = await response.json();
            this.content = data;
            localStorage.setItem(contentKey, JSON.stringify(data));
            localStorage.setItem(contentTimestampKey, Date.now().toString());
            
            const locObj = data?.boardInfo?.location;
            if (locObj?.latitude && locObj?.longitude) {
              this.latitude = Number(locObj.latitude);
              const lng = Number(locObj.longitude);
              this.longitude = -Math.abs(isNaN(lng) ? Number(locObj.longitude) : lng);
            }
            const themePrimary = data?.theme?.primaryHex || data?.boardInfo?.theme?.primaryHex || '#054a36';
            this.themeColor = themePrimary;
            this.updateTheme({ primaryHex: themePrimary, gradient: (data?.background?.colors || data?.theme?.gradient) });
            this.updateParasha();
            this.updateOrganization();
            this.updateLetter();
            await this.updateQRCodes();
          }
        } catch (error) {
          console.warn('Error loading content from server:', error);
        }
      }
      
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
          this.updateDailyTimes();
          this.updateParasha();
          return;
        } catch (e) {
          console.warn('Failed to parse cached zmanim', e);
        }
      }

      const isOnline = await this.checkOnline();
      if (isOnline) {
        try {
          const response = await fetch(`${this.apiBase}/api/zmanim`, {
            method: 'POST',
            headers: { 'accept': 'application/json', 'content-type': 'application/json' },
            body: JSON.stringify({ latitude: this.latitude, longitude: this.longitude, date: dateStr }),
            signal: AbortSignal.timeout(10000)
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
            
            this.updateDailyTimes();
            this.updateParasha();
          }
        } catch (error) {
          console.warn('Error fetching zmanim from server:', error);
        }
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
    
    const isOnline = await this.checkOnline();
    if (isOnline) {
      try {
        const dateStr = date.toISOString().slice(0, 10);
        const response = await fetch(`${this.apiBase}/api/zmanim`, {
          method: 'POST',
          headers: { 'accept': 'application/json', 'content-type': 'application/json' },
          body: JSON.stringify({ latitude: this.latitude, longitude: this.longitude, date: dateStr }),
          signal: AbortSignal.timeout(10000)
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
    if (parashaElement) {
      parashaElement.textContent = '';
    }
  }

  updateOrganization() {
    const orgElement = document.querySelector('div[data-id="1007:124"] .span2-J6uY4J');
    if (orgElement) {
      orgElement.textContent = '';
    }
  }

  updateCredit() {
    // Find rectangle-23-7kVli2 (Shchakim logo) to get its position (for letter page)
    const referenceElement = document.querySelector('body > div.frame-18.screen > div.rectangle-23-7kVli2') || 
                             document.querySelector('.rectangle-23-7kVli2') ||
                             document.querySelector('[data-id*="rectangle-23"]');

    let creditElement = document.getElementById('shchakim-credit');
    
    if (!creditElement) {
      creditElement = document.createElement('div');
      creditElement.id = 'shchakim-credit';
      creditElement.setAttribute('dir', 'rtl');
      creditElement.style.display = 'flex';
      creditElement.style.flexDirection = 'row';
      creditElement.style.alignItems = 'center';
      creditElement.style.justifyContent = 'center';
      creditElement.style.gap = '8px';
      const logo = document.createElement('img');
      logo.src = 'https://adran-haleh.rabaz.co.il/logo-nihug.webp';
      logo.alt = 'לוגו ניהו״ג';
      logo.style.width = '30px';
      logo.style.height = '30px';
      logo.style.objectFit = 'contain';
      const text = document.createElement('span');
      text.textContent = 'פותח ע"י תחום ניהו"ג מטה הרבנות הצבאית';
      creditElement.appendChild(logo);
      creditElement.appendChild(text);
      document.body.appendChild(creditElement);
      
      if (!this._creditResizeListener) {
        this._creditResizeListener = () => {
          this.updateCredit();
        };
        window.addEventListener('resize', this._creditResizeListener);
      }
    }

    // Position the credit element
    if (referenceElement) {
      const rect = referenceElement.getBoundingClientRect();
      creditElement.style.position = 'fixed';
      creditElement.style.left = '50%';
      creditElement.style.transform = 'translateX(-50%)';
      const creditRect = creditElement.getBoundingClientRect();
      const creditHeight = creditRect.height || 0;
      const targetTop = rect.top + (rect.height - creditHeight) / 2;
      creditElement.style.top = `${targetTop}px`;
      creditElement.style.zIndex = '2147483646';
      creditElement.style.color = '#ffffff';
      creditElement.style.fontSize = '14px';
      creditElement.style.fontFamily = "'Polin', Arial, 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', sans-serif";
      creditElement.style.textAlign = 'center';
      creditElement.style.pointerEvents = 'none';
      creditElement.style.opacity = '0.9';
      creditElement.style.whiteSpace = 'nowrap';
      console.log('[CREDIT] Positioned credit at top:', rect.top, 'px');
    } else {
      creditElement.style.position = 'fixed';
      creditElement.style.left = '50%';
      creditElement.style.transform = 'translateX(-50%)';
      creditElement.style.top = '50%';
      creditElement.style.zIndex = '2147483646';
      creditElement.style.color = '#ffffff';
      creditElement.style.fontSize = '14px';
      creditElement.style.fontFamily = "'Polin', Arial, 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', sans-serif";
      creditElement.style.textAlign = 'center';
      creditElement.style.pointerEvents = 'none';
      creditElement.style.opacity = '0.8';
      creditElement.style.whiteSpace = 'nowrap';
      console.warn('[CREDIT] Reference element not found, using fallback positioning');
    }
  }

  normalizeLetterData() {
    const rawLetter = this.content?.letter;
    if (!rawLetter) return null;

    let rawContent = null;
    let parasha = null;
    let signature = null;

    if (typeof rawLetter === 'string') {
      rawContent = rawLetter;
    } else if (typeof rawLetter === 'object') {
      if (Array.isArray(rawLetter.content)) {
        rawContent = [...rawLetter.content];
      } else if (typeof rawLetter.content === 'string') {
        rawContent = rawLetter.content;
      } else if (typeof rawLetter.html === 'string') {
        rawContent = rawLetter.html;
      }
      if (typeof rawLetter.parasha === 'string') parasha = rawLetter.parasha;
      if (typeof rawLetter.signature === 'string') signature = rawLetter.signature;
    }

    const extractedText = this.extractLetterPlainText(rawContent);
    if (!extractedText) return null;

    const detectedParasha = this.extractParashaFromLetterText(extractedText);
    const cleanedText = this.removeLetterHeaderLine(extractedText);
    const columns = this.splitTextToThreeColumns(cleanedText);
    const normalizedParasha = detectedParasha || parasha || this.zmanimData?.parasha || null;
    return { columns, parasha: normalizedParasha, signature: signature || null };
  }

  extractLetterPlainText(rawContent) {
    if (!rawContent) return '';
    if (Array.isArray(rawContent)) {
      return rawContent.map(part => String(part || '').trim()).filter(Boolean).join(' ');
    }
    const text = String(rawContent).trim();
    if (!text) return '';
    if (text.includes('<')) {
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = text;
      const extracted = tempContainer.textContent || tempContainer.innerText || '';
      return extracted.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return text.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  extractParashaFromLetterText(text) {
    if (!text) return null;
    const match = text.match(/פרשת\s+([א-ת"׳״׳\-–\s]{2,40})/u);
    if (!match || !match[1]) return null;
    return match[1].replace(/[.,:;|]/g, '').replace(/\s+/g, ' ').trim();
  }

  removeLetterHeaderLine(text) {
    if (!text) return '';
    return text
      .replace(/איגרת\s+רבצ"ר\s*-\s*פרשת\s+[א-ת"׳״׳\-–\s]{2,40}/u, '')
      .replace(/אגרת\s+רבצ"ר\s*-\s*פרשת\s+[א-ת"׳״׳\-–\s]{2,40}/u, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  splitTextToThreeColumns(text) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const col1 = words.slice(0, 135).join(' ');
    const col2 = words.slice(135, 273).join(' ');
    const col3 = words.slice(273, 389).join(' ');
    return [col1, col2, col3];
  }

  getLetterContentColumns() {
    const byId = [
      document.querySelector('p[data-id="1015:220"]'),
      document.querySelector('p[data-id="1015:223"]'),
      document.querySelector('p[data-id="1015:224"]')
    ].filter(Boolean);

    if (byId.length === 3) {
      return byId;
    }

    return Array.from(document.querySelectorAll('p[data-id^="1015:"]')).slice(0, 3);
  }

  updateSignature(signatureImg, signatureText, fallbackElement) {
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
          signatureTextEl.textContent = signatureText;
        }
      }, 100);
      return;
    }

    if (fallbackElement) {
      setTimeout(() => {
        const currentText = fallbackElement.textContent || '';
        if (!currentText.includes('תא"ל') && !currentText.includes('הרב הראשי')) {
          fallbackElement.textContent = currentText + (currentText ? '\n' : '') + signatureText;
        }
      }, 100);
    }
  }

  updateLetter() {
    const titleElements = Array.from(document.querySelectorAll('p.x-7kVli2[data-id="1016:226"], p.x-uw3PhT[data-id="1016:228"]'));
    const contentElements = this.getLetterContentColumns();
    const signatureImg = document.querySelector('img.x1-7kVli2[data-id="1016:227"]');
    const normalizedLetter = this.normalizeLetterData();
    if (!normalizedLetter) return;

    if (normalizedLetter.parasha) {
      const normalizedTitle = `אגרת רבצ"ר - פרשת ${normalizedLetter.parasha}`;
      if (titleElements[0]) {
        titleElements[0].textContent = normalizedTitle;
      }
      titleElements.slice(1).forEach(el => {
        el.textContent = '';
      });
    }

    const columns = [...normalizedLetter.columns];
    const closingText = 'בהוקרה רבה תא"ל הרב איל קרים הרב הראשי לצה"ל';
    const hasClosing = columns.some(col => col && col.includes('בהוקרה'));
    if (!hasClosing) {
      if (columns[2]) {
        columns[2] = `${columns[2]} ${closingText}`.trim();
      } else if (columns[1]) {
        columns[1] = `${columns[1]} ${closingText}`.trim();
      } else if (columns[0]) {
        columns[0] = `${columns[0]} ${closingText}`.trim();
      }
    }

    contentElements.forEach((el, idx) => {
      if (el) {
        el.textContent = columns[idx] || '';
      }
    });

    const lastContentElement = contentElements[contentElements.length - 1];
    const signatureText = normalizedLetter.signature || 'תא"ל הרב איל קרים הרב הראשי לצה"ל';
    this.updateSignature(signatureImg, signatureText, lastContentElement);
  }

  async updateQRCodes() {
    // עדכון ברקודים לפי data-id
    // link04-1 (1093:184) -> בית הכנסת שלי - QR עם קישור https://shchakim.connect.app/join?code=XXX
    // link04-2 (1093:186) -> עדכוני הלכה וכשרות - rabaz.co.il
    // link04-3 (1093:185) -> הלכה יומית - https://2halachot.rabaz.co.il/
    
    // בית הכנסת שלי - QR עם קישור מלא
    let synagogueId = this.content?.boardInfo?.synagogueId || this.content?.boardInfo?.synagogue_id;
    
    console.log('[QR] Initial synagogueId from content:', synagogueId, 'Type:', typeof synagogueId);
    
    // אם לא נמצא ב-content, נטען מ-board-info ישירות
    if ((synagogueId === null || synagogueId === undefined || synagogueId === false || synagogueId === '') && this.getBoardId()) {
      try {
        const boardId = this.getBoardId();
        console.log('[QR] Fetching synagogueId from board-info for boardId:', boardId);
        const boardInfoResponse = await fetch(`${this.apiBase}/api/board-info?id=${encodeURIComponent(boardId)}`);
        if (boardInfoResponse.ok) {
          const boardInfo = await boardInfoResponse.json();
          synagogueId = boardInfo.synagogue_id || boardInfo.synagogueId;
          console.log('[QR] Fetched synagogueId from board-info:', synagogueId, 'Type:', typeof synagogueId);
        }
      } catch (error) {
        console.warn('[QR] Failed to fetch synagogue_id from board-info:', error);
      }
    }
    
    // בדיקה מחמירה יותר - רק אם יש ערך תקף (לא null, undefined, false, '', או המחרוזת 'false')
    const isValidId = synagogueId !== null && 
                      synagogueId !== undefined && 
                      synagogueId !== false && 
                      synagogueId !== '' && 
                      String(synagogueId).toLowerCase() !== 'false' &&
                      !isNaN(Number(synagogueId));
    
    console.log('[QR] Final synagogueId validation:', {
      synagogueId,
      type: typeof synagogueId,
      isValidId,
      stringValue: String(synagogueId)
    });
    
    if (isValidId) {
      const formattedId = String(synagogueId).padStart(3, '0');
      const joinUrl = `https://shchakim-connect.rabaz.co.il/home?code=${formattedId}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`;
      console.log('[QR] Generating QR code for:', joinUrl);
      const img1 = document.querySelector('img[data-id="1093:184"]');
      if (img1) {
        img1.src = qrUrl;
        img1.setAttribute('src', qrUrl);
        console.log('[QR] QR code image updated successfully');
      } else {
        console.warn('[QR] Image element with data-id="1093:184" not found');
      }
    } else {
      console.warn('[QR] Invalid synagogueId, skipping QR code generation:', synagogueId);
    }
    
    // עדכוני הלכה וכשרות - rabaz.co.il
    const qrUrl2 = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://rabaz.co.il')}`;
    const img2 = document.querySelector('img[data-id="1093:186"]');
    if (img2) {
      img2.src = qrUrl2;
      img2.setAttribute('src', qrUrl2);
    }
    
    // הלכה יומית - https://2halachot.rabaz.co.il/
    const qrUrl3 = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://2halachot.rabaz.co.il/')}`;
    const img3 = document.querySelector('img[data-id="1093:185"]');
    if (img3) {
      img3.src = qrUrl3;
      img3.setAttribute('src', qrUrl3);
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
      frame.style.backgroundSize = 'cover';
      frame.style.backgroundPosition = 'center';
      frame.style.backgroundRepeat = 'no-repeat';
    }
    
    const screen = document.querySelector('.screen');
    if (screen) {
      screen.style.backgroundImage = gradientCss;
      screen.style.backgroundColor = '';
      screen.style.backgroundSize = 'cover';
      screen.style.backgroundPosition = 'center';
      screen.style.backgroundRepeat = 'no-repeat';
    }
    
    const rectangle51 = document.querySelector('.rectangle-51-7kVli2');
    if (rectangle51) {
      rectangle51.style.backgroundImage = gradientCss;
      rectangle51.style.background = gradientCss;
      rectangle51.style.backgroundColor = 'transparent';
      rectangle51.style.backgroundSize = 'cover';
      rectangle51.style.backgroundPosition = 'center';
      rectangle51.style.backgroundRepeat = 'no-repeat';
    }
    
    const allRectangles = document.querySelectorAll('.rectangle-51-7kVli2, .frame-18, .screen');
    allRectangles.forEach(el => {
      if (el) {
        el.style.backgroundImage = gradientCss;
        el.style.backgroundColor = '';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
      }
    });
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
      const isOnline = await this.checkOnline();
      if (isOnline) {
        await this.loadContent();
        this.updateParasha();
        this.updateOrganization();
        this.updateLetter();
        await this.updateQRCodes();
        this.updateDailyTimes();
      }
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

