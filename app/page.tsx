export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Anime-Kun AI Orchestrator</h1>
      <p>AI-powered admin assistant running on port 3001</p>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>API Endpoint</h2>
        <p><strong>POST</strong> <code>/api/chat</code></p>
        <p>This service is designed to be called from the Nuxt.js admin frontend.</p>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3>Status</h3>
        <p>✅ Server is running</p>
        <p>🤖 Gemini 2.5 Flash ready</p>
        <p>🔧 14 AI tools available</p>
      </div>
    </main>
  )
}
