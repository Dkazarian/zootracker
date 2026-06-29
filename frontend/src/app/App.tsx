import { Route, Routes } from 'react-router-dom';
import AuthenticatedLayout from '../features/auth/AuthenticatedLayout';
import AdminRoute from '../features/auth/AdminRoute';
import LoginPage from '../features/auth/LoginPage';
import HomePage from '../features/home/HomePage';
import PersonnelPage from '../features/personnel/PersonnelPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthenticatedLayout />}>
        <Route index element={<HomePage />} />
        <Route element={<AdminRoute />}>
          <Route path="personnel" element={<PersonnelPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
