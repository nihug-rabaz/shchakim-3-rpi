export default function DisplayPage() {
  return (
    <div style={{ 
      width: '50vw', 
      height: '50vh', 
      margin: 'auto',
      padding: 0,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
      <iframe
        src="/html.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          overflow: 'hidden'
        }}
        title="Shchakim Display"
        scrolling="no"
      />
    </div>
  );
}