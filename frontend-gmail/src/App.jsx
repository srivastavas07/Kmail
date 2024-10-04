import { Toaster } from 'react-hot-toast';
import './App.css';
import Body from "./components/Body"
import { ThemeProvider } from './Context /ThemeContext';
function App() {
  return (
    <ThemeProvider>
      <div className='h-screen w-screen'>
        <Body />
        <Toaster
        position='top-center'
          toastOptions={{
            className: 'hello',
            style: {
              borderRadius: '1px',
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
