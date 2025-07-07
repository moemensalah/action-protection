function App() {
  console.log('App component is rendering');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        color: 'green', 
        fontSize: '32px',
        margin: '0 0 20px 0'
      }}>
        Action Protection Working
      </h1>
      <p style={{ 
        color: 'blue', 
        fontSize: '18px',
        backgroundColor: '#e3f2fd',
        padding: '10px',
        borderRadius: '5px'
      }}>
        React app is successfully loading!
      </p>
      <p style={{ color: 'gray', fontSize: '14px' }}>
        Server connection: OK
      </p>
    </div>
  );
}

export default App;