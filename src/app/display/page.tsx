"use client";
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BoardManager from '@/utils/BoardManager';
import { QRCodeSVG } from 'qrcode.react';

type BoardInfo = {
  linked: boolean;
  user_id?: number;
  name?: string;
  logical_board_id?: number;
};

export default function DisplayPage() {
  const router = useRouter();
  const [boardId, setBoardId] = useState<string>('');
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'slider' | 'letter'>('slider');
  const [framesLoaded, setFramesLoaded] = useState({ slider: false, letter: false });
  const [scale, setScale] = useState(0.55);
  const [maxWidth, setMaxWidth] = useState('min(60vw, 500px)');
  const [screenInfo, setScreenInfo] = useState({ width: 0, height: 0 });
  const [showLoadVideo, setShowLoadVideo] = useState(false);
  const [hasShownInitialVideo, setHasShownInitialVideo] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const [durations, setDurations] = useState({ letter: 90, halacha: 30 });
  const [iframeReloadKey, setIframeReloadKey] = useState(0);
  const lastFabCommandRef = useRef<string | null>(null);
  const sliderFrameRef = useRef<HTMLIFrameElement>(null);
  const letterFrameRef = useRef<HTMLIFrameElement>(null);

  const forceReloadDisplayContent = useCallback(() => {
    console.log('[DISPLAY] Forcing iframe reload to sync remote theme/colors');
    setFramesLoaded({ slider: false, letter: false });
    setShowLoadVideo(true);
    setIframeReloadKey((prev) => prev + 1);
  }, []);

  const consumeEmergencyReloadFlag = useCallback(() => {
    if (typeof window === 'undefined') return;
    const flag = sessionStorage.getItem('shchakim_force_reload');
    if (flag) {
      // Don't remove flag yet - keep it until iframe sends reload message
      forceReloadDisplayContent();
    }
  }, [forceReloadDisplayContent]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCommand = localStorage.getItem('shchakim_last_fab_command');
      if (savedCommand) {
        lastFabCommandRef.current = savedCommand;
        console.log('[DISPLAY] Loaded last FAB command from storage:', savedCommand);
      }
      consumeEmergencyReloadFlag();
      const onVisibilityChange = () => {
        if (!document.hidden) {
          consumeEmergencyReloadFlag();
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    }
  }, [consumeEmergencyReloadFlag]);

  const claimUrl = useMemo(() => {
    if (typeof window === 'undefined' || !boardId) return '';
    return `https://shchakim.rabaz.co.il/claim?id=${boardId}`;
  }, [boardId]);

  useEffect(() => {
    const id = BoardManager.getBoardId();
    setBoardId(id);
    
    const checkBoardStatus = async () => {
      if (!id) return;

      try {
        console.log(`[DISPLAY] Checking board status for ${id}`);
        const response = await fetch(`/api/board-info?id=${id}`);
        if (!response.ok) throw new Error('Failed to fetch board info');
        
        const info: BoardInfo = await response.json();
        console.log(`[DISPLAY] Board status response:`, JSON.stringify(info));
        
        const wasNotLinked = !boardInfo?.linked;
        const nowLinked = info.linked;
        
        setBoardInfo(info);
        BoardManager.setBoardInfo(info);
        setIsLoading(false);
        
        if (wasNotLinked && nowLinked && !hasShownInitialVideo) {
          console.log('[DISPLAY] Board just linked for first time, showing load video');
          setHasShownInitialVideo(true);
          setTimeout(() => {
            setShowLoadVideo(true);
          }, 100);
        }
      } catch (error) {
        console.error('[DISPLAY] Error checking board status:', error);
        setIsLoading(false);
      }
    };

    const stored = BoardManager.getBoardInfo();
    if (stored?.linked) {
      setBoardInfo(stored);
      setIsLoading(false);
      setHasShownInitialVideo(true);
      checkBoardStatus();
      const interval = setInterval(checkBoardStatus, 60000);
      return () => clearInterval(interval);
    }

    checkBoardStatus();
    const interval = setInterval(checkBoardStatus, 5000);
    return () => clearInterval(interval);
  }, [boardInfo?.linked, boardId]);

  useEffect(() => {
    const loadDurations = async () => {
      if (!boardId || !boardInfo?.linked) return;
      
      try {
        const response = await fetch(`/api/display/content?boardId=${boardId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.durations) {
            setDurations({
              letter: data.durations.letter || 90,
              halacha: data.durations.halacha || 30
            });
          }
        }
      } catch (error) {
        console.error('[DISPLAY] Error loading durations:', error);
      }
    };

    if (boardInfo?.linked) {
      loadDurations();
    }
  }, [boardId, boardInfo?.linked]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('[DISPLAY] Received message:', event.data);
      if (event.data?.type === 'slider-cycle-complete') {
        if (sliderFrameRef.current?.contentWindow) {
          sliderFrameRef.current.contentWindow.postMessage({ type: 'stop-slider' }, '*');
        }
        setCurrentView('letter');
        const letterDuration = durations.letter * 1000;
        setTimeout(() => {
          setCurrentView('slider');
          if (sliderFrameRef.current?.contentWindow) {
            sliderFrameRef.current.contentWindow.postMessage({ type: 'start-from-halacha' }, '*');
          }
        }, letterDuration);
      }
      if (event.data?.type === 'emergency-video') {
        console.log('[DISPLAY] Emergency video requested, navigating to:', event.data?.command || '/apk');
        const emergencyCommand = event.data?.command || '/apk';
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('shchakim_force_reload', '1');
        }
        router.push(emergencyCommand);
        return;
      }
      if (event.data?.command === '/fab-on' || event.data?.command === '/fab-off') {
        const command = event.data.command;
        const lastExecutedCommand = lastFabCommandRef.current;
        
        if (lastExecutedCommand !== command) {
          console.log('[DISPLAY] FAB command changed:', lastExecutedCommand, '->', command);
          lastFabCommandRef.current = command;
          if (typeof window !== 'undefined') {
            localStorage.setItem('shchakim_last_fab_command', command);
          }
          console.log('[DISPLAY] Navigating to:', command);
          router.push(command);
        } else {
          console.log('[DISPLAY] FAB command unchanged, staying on display. Last executed:', lastExecutedCommand, 'Current:', command);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [boardId, router, durations]);

  useEffect(() => {
    const loadFabState = async () => {
      if (!boardId || !boardInfo?.linked) return;
      
      try {
        const response = await fetch(`/api/display/fab?boardId=${boardId}`);
        if (!response.ok) return;
        
        const fabData = await response.json();
        console.log('[DISPLAY] Loaded FAB state from API:', fabData.fab);
        if (fabData.fab) {
          const newFabState = fabData.fab.enabled;
          console.log('[DISPLAY] Setting FAB state from API:', newFabState);
          setShowFab(newFabState);
        }
      } catch (error) {
        console.error('[DISPLAY] Error loading FAB state:', error);
      }
    };

    if (boardInfo?.linked) {
      loadFabState();
      const interval = setInterval(loadFabState, 60000);
      return () => clearInterval(interval);
    }
  }, [boardId, boardInfo?.linked]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      let newScale = 0.4;
      let newMaxWidth = 'min(50vw, 350px)';
      
      setScreenInfo({ width, height });
      
      if (width <= 480) {
        newScale = 0.9;
        newMaxWidth = 'min(95vw, 500px)';
      } else if (width <= 768) {
        newScale = 0.75;
        newMaxWidth = 'min(90vw, 600px)';
      } else if (width <= 1024) {
        newScale = 0.65;
        newMaxWidth = 'min(70vw, 550px)';
      } else if (width <= 1440) {
        newScale = 0.55;
        newMaxWidth = 'min(60vw, 500px)';
      } else {
        newScale = 0.5;
        newMaxWidth = 'min(55vw, 480px)';
      }
      
      setScale(newScale);
      setMaxWidth(newMaxWidth);
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
    };
  }, []);


  useEffect(() => {
    if (!boardInfo?.linked) {
      setFramesLoaded({ slider: false, letter: false });
      return;
    }

    const handleSliderLoad = () => {
      setFramesLoaded(prev => ({ ...prev, slider: true }));
    };

    const handleLetterLoad = () => {
      setFramesLoaded(prev => ({ ...prev, letter: true }));
    };

    const sliderFrame = sliderFrameRef.current;
    const letterFrame = letterFrameRef.current;

    if (sliderFrame) {
      sliderFrame.addEventListener('load', handleSliderLoad);
      if ((sliderFrame as any).complete) {
        setTimeout(handleSliderLoad, 100);
      }
    }
    if (letterFrame) {
      letterFrame.addEventListener('load', handleLetterLoad);
      if ((letterFrame as any).complete) {
        setTimeout(handleLetterLoad, 100);
      }
    }

    return () => {
      if (sliderFrame) {
        sliderFrame.removeEventListener('load', handleSliderLoad);
      }
      if (letterFrame) {
        letterFrame.removeEventListener('load', handleLetterLoad);
      }
    };
  }, [boardInfo?.linked]);

  // Send reload-content message to iframes when they load after emergency return
  useEffect(() => {
    if (!boardInfo?.linked || !framesLoaded.slider) return;
    
    const shouldReload = typeof window !== 'undefined' && 
      sessionStorage.getItem('shchakim_force_reload');
    
    if (shouldReload) {
      console.log('[DISPLAY] Sending reload-content message to iframes');
      const sliderFrame = sliderFrameRef.current;
      const letterFrame = letterFrameRef.current;
      
      // Wait a bit for iframe to be fully ready
      const timeoutId = setTimeout(() => {
        if (sliderFrame?.contentWindow) {
          sliderFrame.contentWindow.postMessage({ type: 'reload-content' }, '*');
        }
        if (letterFrame?.contentWindow) {
          letterFrame.contentWindow.postMessage({ type: 'reload-content' }, '*');
        }
        // Remove flag after sending message
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('shchakim_force_reload');
        }
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [framesLoaded.slider, framesLoaded.letter, boardInfo?.linked]);

  // Also check flag periodically in case iframe was already loaded
  useEffect(() => {
    if (!boardInfo?.linked) return;
    
    const checkAndReload = () => {
      const shouldReload = typeof window !== 'undefined' && 
        sessionStorage.getItem('shchakim_force_reload');
      
      if (shouldReload && framesLoaded.slider) {
        console.log('[DISPLAY] Sending reload-content message to iframes (periodic check)');
        const sliderFrame = sliderFrameRef.current;
        const letterFrame = letterFrameRef.current;
        
        if (sliderFrame?.contentWindow) {
          sliderFrame.contentWindow.postMessage({ type: 'reload-content' }, '*');
        }
        if (letterFrame?.contentWindow) {
          letterFrame.contentWindow.postMessage({ type: 'reload-content' }, '*');
        }
        // Remove flag after sending message
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('shchakim_force_reload');
        }
      }
    };
    
    // Check immediately
    checkAndReload();
    
    // Check every 500ms for a short period
    const intervalId = setInterval(checkAndReload, 500);
    const timeoutId = setTimeout(() => clearInterval(intervalId), 5000);
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [boardInfo?.linked, framesLoaded.slider]);

  useEffect(() => {
    if (showLoadVideo) {
      console.log('[DISPLAY] Showing load GIF');
      const timer = setTimeout(() => {
        console.log('[DISPLAY] Hiding load GIF after 5 seconds');
        setShowLoadVideo(false);
      }, 5000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [showLoadVideo]);


  const allFramesLoaded = framesLoaded.slider && framesLoaded.letter;
  const showLoading = isLoading || (boardInfo?.linked && !allFramesLoaded);

  if (isLoading && !boardInfo?.linked) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        color: '#fff',
        fontSize: '24px',
        direction: 'rtl'
      }}>
        טוען...
      </div>
    );
  }


  if (!boardInfo?.linked) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        color: '#fff',
        padding: 'clamp(10px, 2vw, 20px)',
        direction: 'rtl',
        overflow: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'clamp(10px, 1.5vw, 16px)',
          padding: 'clamp(12px, 2.5vw, 24px)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          margin: '0 auto',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(18px, 3.5vw, 24px)', 
            marginBottom: 'clamp(12px, 2.5vw, 18px)', 
            fontWeight: '700',
            lineHeight: '1.2',
            wordWrap: 'break-word'
          }}>
            סרוק להתחברות
          </h1>
          
          {claimUrl && (
            <div style={{ 
              marginBottom: 'clamp(12px, 2.5vw, 18px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}>
              <div style={{
                width: 'min(80vw, 70vh, 500px)',
                height: 'min(80vw, 70vh, 500px)',
                maxWidth: '100%',
                aspectRatio: '1',
                background: '#fff',
                borderRadius: 'clamp(8px, 1.2vw, 12px)',
                padding: 'clamp(5px, 1vw, 12px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QRCodeSVG
                  value={claimUrl}
                  size={500}
                  level="M"
                  includeMargin={false}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    maxWidth: '100%', 
                    maxHeight: '100%',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{
            fontSize: 'clamp(11px, 2.2vw, 14px)',
            marginBottom: 'clamp(8px, 1.5vw, 12px)',
            opacity: 0.9,
            wordBreak: 'break-all',
            padding: '0 clamp(4px, 1.2vw, 10px)',
            lineHeight: '1.4',
            overflowWrap: 'break-word',
            hyphens: 'auto',
            width: '100%',
            maxWidth: '100%',
            overflow: 'visible',
            whiteSpace: 'normal'
          }}>
            {claimUrl}
          </div>

          <div style={{
            fontSize: 'clamp(11px, 2.2vw, 14px)',
            marginTop: 'clamp(10px, 2vw, 16px)',
            padding: 'clamp(8px, 1.5vw, 12px)',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 'clamp(6px, 1vw, 8px)',
            fontFamily: 'monospace',
            lineHeight: '1.4',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            width: '100%',
            maxWidth: '100%',
            overflow: 'visible',
            whiteSpace: 'normal'
          }}>
            מזהה לוח: <strong>{boardId}</strong>
          </div>

          <div style={{
            fontSize: 'clamp(9px, 1.8vw, 11px)',
            marginTop: 'clamp(10px, 2vw, 16px)',
            opacity: 0.8,
            lineHeight: '1.3',
            wordWrap: 'break-word',
            width: '100%',
            maxWidth: '100%',
            overflow: 'visible',
            whiteSpace: 'normal'
          }}>
            הלוח בודק שיוך כל 5 שניות...
          </div>
        </div>
      </div>
    );
  }

  const iframeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: 'opacity 0.5s ease-in-out',
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      isolation: 'isolate'
    }}>
      {showLoadVideo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          zIndex: 9999,
          opacity: 1,
          pointerEvents: 'auto'
        }}>
          <img
            src="/load.gif"
            alt="Loading"
            onError={(e) => {
              console.error('[DISPLAY] GIF error:', e);
            }}
            onLoad={() => {
              console.log('[DISPLAY] GIF loaded successfully');
            }}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              height: '55vh',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>
      )}

      {showLoading && !showLoadVideo && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #054a36 0%, #0b3d2e 100%)',
          zIndex: 1000,
          transition: 'opacity 0.5s ease-in-out',
          opacity: showLoading ? 1 : 0,
          pointerEvents: showLoading ? 'auto' : 'none'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#fff'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 24px',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{
              fontSize: '24px',
              fontWeight: '500'
            }}>
              טוען...
            </div>
          </div>
        </div>
      )}

      <iframe
        key={`slider-${iframeReloadKey}`}
        ref={sliderFrameRef}
        src={`/html.html?reload=${iframeReloadKey}`}
        style={{
          ...iframeStyle,
          opacity: currentView === 'slider' && allFramesLoaded && !showLoadVideo ? 1 : 0,
          pointerEvents: currentView === 'slider' && allFramesLoaded && !showLoadVideo ? 'auto' : 'none',
          zIndex: currentView === 'slider' ? 1 : 0
        }}
        title="Shchakim Slider"
        scrolling="no"
        allow="fullscreen"
      />

      <iframe
        key={`letter-${iframeReloadKey}`}
        ref={letterFrameRef}
        src={`/html2.html?reload=${iframeReloadKey}`}
        style={{
          ...iframeStyle,
          opacity: currentView === 'letter' && allFramesLoaded && !showLoadVideo ? 1 : 0,
          pointerEvents: currentView === 'letter' && allFramesLoaded && !showLoadVideo ? 'auto' : 'none',
          zIndex: currentView === 'letter' ? 1 : 0
        }}
        title="Shchakim Letter"
        scrolling="no"
        allow="fullscreen"
      />


      {showFab && (
        <button
          aria-label="help"
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            right: 'max(16px, env(safe-area-inset-right, 0px))',
            bottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
            width: 56,
            height: 56,
            minWidth: 56,
            minHeight: 56,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 32px)',
            borderRadius: 28,
            border: 'none',
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            fontSize: 28,
            lineHeight: '56px',
            textAlign: 'center',
            cursor: 'pointer',
            zIndex: 2147483647,
            boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >?
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2147483647
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 420,
              maxWidth: '90vw',
              background: '#0b3d2e',
              color: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 16 }}>מידע לוח</div>
            {boardInfo.name && (
              <div style={{ fontSize: 18, marginBottom: 12 }}>שויך ל: {boardInfo.name}</div>
            )}
            <div style={{ fontSize: 14, marginBottom: 12 }}>מזהה לוח: {boardId}</div>
            {boardInfo.logical_board_id && (
              <div style={{ fontSize: 14, marginBottom: 12 }}>לוח לוגי: {boardInfo.logical_board_id}</div>
            )}
            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 20,
                width: '100%',
                height: 44,
                borderRadius: 8,
                border: 'none',
                background: '#145a43',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer'
              }}
            >סגור</button>
          </div>
        </div>
      )}
    </div>
  );
}