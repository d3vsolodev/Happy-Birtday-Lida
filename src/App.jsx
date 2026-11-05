import React, { useEffect, useState } from 'react'
import './App.css'
import './LoveLetter.css'
import './BookCanvas.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'
import Layout from './layout/Layout'
import Home from './pages/Home'
import LoveLetter from './pages/LoveLetter'
import Test from './pages/Test'
import FlowerPage from './pages/FlowerPage'
import WishPage from './pages/WishPage'
import './Extras.css'
import OpeningAnimation from './components/OpeningAnimation'

const MyRoute = createBrowserRouter(createRoutesFromElements(
    <Route>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />}></Route>
        <Route path='love-Letter' element={<LoveLetter />}></Route>
        <Route path='test' element={<Test />}></Route>
        <Route path='flower' element={<FlowerPage />}></Route>
        <Route path='wish' element={<WishPage />}></Route>
      </Route>
    </Route>
  ), {
    basename: import.meta.env.BASE_URL,
  })



const App = () => {

  // ------------------Cake loader 
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [animateOut, setAnimateOut] = useState(false); // New state for animation

  useEffect(() => {
    const timers = [];
    const handlePageLoad = () => {
      timers.push(setTimeout(() => setAnimateOut(true), 8400));
      timers.push(setTimeout(() => {
        setShowContent(true);
        setLoading(false);
      }, 9600));
    };

    if (document.readyState === "complete") {
      handlePageLoad();
    } else {
      window.addEventListener("load", handlePageLoad);
    }

    return () => {
      window.removeEventListener("load", handlePageLoad);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      {
        loading && <OpeningAnimation animateOut={animateOut}/>
      }
      {
        showContent && <RouterProvider router={MyRoute} />
      }
    </>
  )
}

export default App