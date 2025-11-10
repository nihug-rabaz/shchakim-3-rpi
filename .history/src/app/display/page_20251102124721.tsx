export default function DisplayPage() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <iframe
        src="/html.html"
        style={{
          width: '200%',
          height: '200%',
          border: 'none',
          display: 'block',
          overflow: 'hidden',
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        title="Shchakim Display"
        scrolling="no"
      />
    </div>
  );
}