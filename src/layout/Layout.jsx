import React from 'react'
import { Outlet } from 'react-router'
import HeartTransition from '../components/HeartTransition'
import SparkleTrail from '../components/SparkleTrail'

const Layout = () => {
  return (
    <>
        <HeartTransition />
        <SparkleTrail />
        <Outlet />
    </>
  )
}

export default Layout