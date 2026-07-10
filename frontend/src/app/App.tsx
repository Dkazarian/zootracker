import { Route, Routes } from 'react-router-dom';
import AuthenticatedLayout from '../features/auth/AuthenticatedLayout';
import AdminRoute from '../features/auth/AdminRoute';
import LoginPage from '../features/auth/LoginPage';
import AnimalDetailPage from '../features/animals/AnimalDetailPage';
import AnimalDirectoryPage from '../features/animals/AnimalDirectoryPage';
import AnimalEditorPage from '../features/animals/AnimalEditorPage';
import AdminDashboardPage from '../features/dashboard/admin/AdminDashboardPage';
import KeeperDashboardPage from '../features/dashboard/keeper/KeeperDashboardPage';
import HomePage from '../features/home/HomePage';
import PersonnelPage from '../features/personnel/PersonnelPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthenticatedLayout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<KeeperDashboardPage />} />
        <Route path="animals" element={<AnimalDirectoryPage />} />
        <Route path="animals/:animalId" element={<AnimalDetailPage />} />
        <Route element={<AdminRoute />}>
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="personnel" element={<PersonnelPage />} />
          <Route path="animals/new" element={<AnimalEditorPage />} />
          <Route path="animals/:animalId/edit" element={<AnimalEditorPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
