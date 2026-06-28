import { Route, Routes } from 'react-router-dom';
import AuthenticatedLayout from '../features/auth/AuthenticatedLayout';
import LoginPage from '../features/auth/LoginPage';
import HomePage from '../features/home/HomePage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthenticatedLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
