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
      this.ensurePolinFontAsync();
      this.setupLiveClock();
      this.setupLiveDate();
      this.setupParasha();
      this.updateOrganization();
      this.setupSlider();
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
    style.textContent = `
@font-face { font-family: 'Polin'; src: url('${regular}') format('${toFmt(regular)}'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Polin'; src: url('${bold}') format('${toFmt(bold)}'); font-weight: 700; font-style: normal; font-display: swap; }
@font-face { font-family: 'Open 24 Display St'; src: url('${open24}') format('${toFmt(open24)}'); font-weight: 400; font-style: normal; font-display: swap; }
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
      // Ensure CSS rule for slide rounding
      if (!document.getElementById('shchakim-slider-style')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'shchakim-slider-style';
        styleEl.textContent = `#shchakim-slider > div { border-radius: 80px; overflow: hidden; }`;
        document.head.appendChild(styleEl);
      }

      const target = this.getFirstElement([
        '.rectangle-27-TP2yIe[data-id="1:38"]',
        '.rectangle-27-TP2yIe',
        '[data-id="1:38"]'
      ]);
      if (!target) return;

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
      slider.style.background = this.themeColor;
      // Match rounded sides: if square, make it a circle; otherwise keep soft corners
      const radiusPx = (width && height && Math.abs(width - height) < 2)
        ? Math.floor(Math.min(width, height) / 2) + 'px'
        : '30px';
      slider.style.borderRadius = radiusPx;
      slider.style.top = top + 'px';
      slider.style.left = left + 'px';
      slider.style.zIndex = '1000';
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
        // background under the image uses theme color (or provided)
        if (typeof bg === 'string') {
          slide.style.background = bg;
        } else {
          slide.style.background = this.themeColor;
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
        makeSlide({ bg: this.themeColor, imageUrl: imgSrc });
      } else {
        makeSlide({ bg: this.themeColor });
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
        makeSlide({ bg: this.themeColor, imageUrl: url, caption: text });
      });

      // If we still have less than 4 slides, add text-only green screens "מסך 2/3/4"
      const labels = ['מסך 2', 'מסך 3', 'מסך 4'];
      while (slides.length < 4 && labels.length) {
        const label = labels.shift();
        makeSlide({ bg: this.themeColor, caption: label, centerCaption: true });
      }

      // If content API includes images, replace backgrounds
      // (no-op now; handled above with explicit img elements)

      // Fetch daily halacha and populate slide 2 and 3
      const injectHalacha = async () => {
        try {
          const resp = await fetch(`${this.apiBase}/api/halacha/daily`);
          if (!resp.ok) return;
          const data = await resp.json();
          const items = Array.isArray(data?.items) ? data.items : [];
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
            card.style.background = this.hexToRgba(this.themeColor || '#003c1e', 0.9);
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
            let cred = credit || 'קיצור תורת המחנה של הרבנות הצבאית';
            // Avoid double "מתוך"
            if (!/^\s*מתוך/.test(cred)) {
              cred = `מתוך ${cred}`;
            }
            return `${chap}${chap && cred ? ' – ' : ''}${cred}`.trim();
          };

          if (items[0] && slides[1]) {
            slides[1].innerHTML = '';
            const el = mkHalachaSlide(items[0].title, items[0].summary);
            const footer = el.querySelector('#halacha-footer');
            if (footer) {
              footer.textContent = buildFooter(items[0].chapter, items[0].credit);
            }
            slides[1].appendChild(el);
            slides[1].style.opacity = '0';
          }
          if (items[1] && slides[2]) {
            slides[2].innerHTML = '';
            const el2 = mkHalachaSlide(items[1].title, items[1].summary);
            const footer2 = el2.querySelector('#halacha-footer');
            if (footer2) {
              footer2.textContent = buildFooter(items[1].chapter, items[1].credit);
            }
            slides[2].appendChild(el2);
            slides[2].style.opacity = '0';
          }
        } catch {}
      };
      injectHalacha();

      // Start rotation with variable durations: first 10s, others 30s
      if (slides.length === 0) return;
      let current = 0;
      slides[current].style.opacity = '1';
      const durations = [10000, 30000, 30000, 30000];
      const advance = () => {
        const prev = current;
        current = (current + 1) % slides.length;
        slides[prev].style.opacity = '0';
        slides[current].style.opacity = '1';
        const d = durations[current] || 30000;
        setTimeout(advance, d);
      };
      setTimeout(advance, durations[current] || 10000);
    } catch (e) {
      console.error('Failed to setup slider', e);
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
