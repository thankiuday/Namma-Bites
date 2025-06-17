import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Home from './Pages/Home';
import AboutUs from './Pages/AboutUs';
import ContactUs from './Pages/ContactUs';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import UserProfile from './Pages/UserProfile';
import ChangePassword from './Pages/ChangePassword';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/user" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/change-password" 
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                } 
              />
              {/* Add new routes as needed */}
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
