import React, { Suspense, lazy, useEffect, useState } from 'react'
import './App.css'
import './LoveLetter.css'
import './BookCanvas.css'
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router'
import Layout from './layout/Layout'
import Home from './pages/Home'
import LoveLetter from './pages/LoveLetter'
import './Extras.css'
import OpeningAnimation from './components/OpeningAnimation'

// the two 3D pages load on demand (three.js is big), so the home page stays fast
const FlowerPage = lazy(() => import('./pages/FlowerPage'))
const WishPage = lazy(() => import('./pages/WishPage'))
const PageLoading = () => <div className="page-loading">🌸</div>

const MyRoute = createBrowserRouter(createRoutesFromElements(
    <Route>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />}></Route>
        <Route path='love-letter' element={<LoveLetter />}></Route>
        <Route path='flower' element={<Suspense fallback={<PageLoading />}><FlowerPage /></Suspense>}></Route>
        <Route path='wish' element={<Suspense fallback={<PageLoading />}><WishPage /></Suspense>}></Route>
        <Route path='*' element={<Navigate to='/' replace />}></Route>
      </Route>
    </Route>
  ))



const App = () => {

  // ------------------Cake loader 
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [animateOut, setAnimateOut] = useState(false); // New state for animation

  useEffect(() => {
    const timers = [];
    let started = false;
    const handlePageLoad = () => {
      if (started) return;
      started = true;
      timers.push(setTimeout(() => setShowContent(true), 7600)); // mount page BEFORE the slide starts
      timers.push(setTimeout(() => setAnimateOut(true), 8400));
      timers.push(setTimeout(() => setLoading(false), 9600));
    };

    if (document.readyState === "complete") {
      handlePageLoad();
    } else {
      window.addEventListener("load", handlePageLoad);
      // safety net: slow fonts / CDN must never freeze the intro
      timers.push(setTimeout(handlePageLoad, 2500));
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