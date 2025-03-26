import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import RestaurantProfile from './pages/RestaurantProfile';
import Restaurants from './pages/Restaurants';
import AddUser from './pages/AddUser';
import EditUser from './pages/EditUser';
import AddRestaurant from './pages/AddRestaurant';
import EditRestaurant from './pages/EditRestaurant';
import AboutUs from './pages/AboutUs';
import './styles/Layout.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4a90e2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <div className="app">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/users/add" element={<AddUser />} />
                <Route path="/admin/users/edit/:id" element={<EditUser />} />
                <Route path="/admin/restaurants/add" element={<AddRestaurant />} />
                <Route path="/admin/restaurants/edit/:id" element={<EditRestaurant />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/restaurant/:id" element={<RestaurantProfile />} />
                <Route path="/restaurants" element={<Restaurants />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
