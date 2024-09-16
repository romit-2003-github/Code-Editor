import './App.css';
import {Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <>
      <div>
        <Toaster position='top-center'/>
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:roomId" element={<EditorPage />} />
      </Routes>
    </>
  );
}

export default App;
