import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from "axios";
import {BrowserRouter, Routes, Route} from 'react-router-dom'

import About from './pages/About';
import AdminPage from './pages/AdminPage';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Login from './login';
import SignUp from './pages/SignUp';


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/about' element={<About/>}/>
      <Route path='/contact' element={<Contact/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<SignUp/>}/>
      <Route path='/adminpage' element={<AdminPage/>}/>
    </Routes>
    </BrowserRouter>

  )
}

export default App
