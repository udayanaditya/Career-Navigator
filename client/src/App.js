import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CareerExplore from './pages/CareerExplore';
import CareerDetail from './pages/CareerDetail';
import QuizList from './pages/QuizList';
import QuizTake from './pages/QuizTake';
import QuizResults from './pages/QuizResults';
import NotFound from './pages/NotFound';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/careers" element={<CareerExplore />} />
              <Route path="/careers/:id" element={<CareerDetail />} />
              <Route path="/quiz" element={<QuizList />} />
              <Route path="/quiz/:id" element={<QuizTake />} />
              <Route path="/quiz/:id/results" element={<QuizResults />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;