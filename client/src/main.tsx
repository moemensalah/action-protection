console.log('main.tsx is executing');

const rootElement = document.getElementById("root");
console.log('Root element found:', rootElement);

if (rootElement) {
  // Direct DOM manipulation to bypass React entirely
  rootElement.innerHTML = `
    <div style="min-height: 100vh; padding: 20px; background: white; font-family: Arial;">
      <h1 style="color: green; font-size: 32px; margin: 0 0 20px 0;">
        Action Protection - Direct DOM
      </h1>
      <p style="color: blue; font-size: 18px; background: #e3f2fd; padding: 10px; border-radius: 5px;">
        This is working without React!
      </p>
      <p style="color: gray; font-size: 14px;">
        Server connection: OK | Time: ${new Date().toLocaleTimeString()}
      </p>
      <button onclick="window.location.reload()" style="padding: 10px; background: orange; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
  console.log('Direct DOM content inserted');
} else {
  console.error('Root element not found!');
}
