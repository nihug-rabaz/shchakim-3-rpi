export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Shchakim Display</h1>
      <p>Navigate to /pair or /display.</p>
      {/* SW Registrar injection for client pages */}
      {/* This file is a server component; SW will register on client navigations */}
    </main>
  );
}


