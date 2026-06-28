import './App.css';
import Header from './common/header';
import Footer from './common/footer';
import Homepage from './homepage';

function App() {
  return (
    <div className="app-shell">
      <Header />
      <Homepage />
      <Footer />
    </div>
  );
}

export default App;
