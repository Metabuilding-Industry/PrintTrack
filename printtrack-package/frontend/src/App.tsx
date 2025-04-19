import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import BonsFabrication from './pages/BonsFabrication/BonsFabrication';
import BonDetail from './pages/BonsFabrication/BonDetail';
import NouveauBon from './pages/BonsFabrication/NouveauBon';
import Clients from './pages/Clients/Clients';
import Machines from './pages/Machines/Machines';
import ParametresTechniques from './pages/ParametresTechniques/ParametresTechniques';
import ControleQualite from './pages/ControleQualite/ControleQualite';
import Incidents from './pages/Incidents/Incidents';
import Rapports from './pages/Rapports/Rapports';
import Statistiques from './pages/Statistiques/Statistiques';
import Parametres from './pages/Parametres/Parametres';
import Login from './pages/Auth/Login';
import NotFound from './pages/NotFound/NotFound';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bons" element={<BonsFabrication />} />
          <Route path="/bons/nouveau" element={<NouveauBon />} />
          <Route path="/bons/:id" element={<BonDetail />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/parametres-techniques" element={<ParametresTechniques />} />
          <Route path="/controle-qualite" element={<ControleQualite />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/rapports" element={<Rapports />} />
          <Route path="/statistiques" element={<Statistiques />} />
          <Route path="/parametres" element={<Parametres />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
};

export default App;
