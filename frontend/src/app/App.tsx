import HomePage from '../features/home/HomePage';
import Footer from '../shared/components/layout/Footer';
import Header from '../shared/components/layout/Header';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <Header />
      <HomePage />
      <Footer />
    </div>
  );
}

export default App;
