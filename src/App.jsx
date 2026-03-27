import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Fees from './pages/Fees';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/teachers" replace />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="students" element={<Students />} />
          <Route path="fees" element={<Fees />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
