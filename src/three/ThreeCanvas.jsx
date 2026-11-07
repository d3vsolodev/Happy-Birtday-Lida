import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { disposeScene } from './helpers'

const hasWebGL = () => {
    try {
        const c = document.createElement('canvas')
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
    } catch {
        return false
    }
}

/**
 * Generic 3D stage: renderer + camera + 360° orbit controls (drag to rotate,
 * pinch / scroll to zoom). `build(ctx)` creates the scene and returns
 * { update(dt, t), ...methods }. Falls back to `fallback` if WebGL is missing.
 */
const ThreeCanvas = ({ build, onReady, fallback, className, label }) => {
    const hostRef = useRef(null)
    const buildRef = useRef(build)
    const readyRef = useRef(onReady)
    const [supported] = useState(hasWebGL)

    useEffect(() => {
        buildRef.current = build
        readyRef.current = onReady
    })

    useEffect(() => {
        if (!supported) return undefined
        const host = hostRef.current
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.05
        renderer.domElement.style.display = 'block'
        renderer.domElement.style.width = '100%'
        renderer.domElement.style.height = '100%'
        host.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
        camera.position.set(0, 3, 8)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.08
        controls.enablePan = false
        controls.minDistance = 4
        controls.maxDistance = 14
        controls.minPolarAngle = 0.25
        controls.maxPolarAngle = Math.PI * 0.52
        controls.autoRotate = !reduceMotion
        controls.autoRotateSpeed = 1.6

        // pause the spin while she is touching the model, resume a moment later
        let resumeTimer
        const onStart = () => { controls.autoRotate = false; clearTimeout(resumeTimer) }
        const onEnd = () => { resumeTimer = setTimeout(() => { controls.autoRotate = !reduceMotion }, 2500) }
        controls.addEventListener('start', onStart)
        controls.addEventListener('end', onEnd)

        const api = buildRef.current({ THREE, scene, camera, renderer, controls }) || {}
        readyRef.current?.({ ...api, controls })

        const resize = () => {
            const w = host.clientWidth || 1
            const h = host.clientHeight || 1
            renderer.setSize(w, h, false)
            camera.aspect = w / h
            // narrow portrait screens: pull back a little so nothing is cropped
            camera.zoom = camera.aspect < 1.1 ? Math.max(0.62, camera.aspect * 0.95 + 0.05) : 1
            camera.updateProjectionMatrix()
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(host)

        const clock = new THREE.Clock()
        renderer.setAnimationLoop(() => {
            const dt = Math.min(clock.getDelta(), 0.05)
            const t = clock.elapsedTime
            api.update?.(dt, t)
            controls.update()
            renderer.render(scene, camera)
        })

        return () => {
            clearTimeout(resumeTimer)
            renderer.setAnimationLoop(null)
            ro.disconnect()
            controls.removeEventListener('start', onStart)
            controls.removeEventListener('end', onEnd)
            controls.dispose()
            api.dispose?.()
            disposeScene(scene)
            renderer.dispose()
            renderer.domElement.remove()
        }
    }, [supported])

    return (
        <div ref={hostRef} className={className} role="img" aria-label={label}>
            {!supported && fallback}
        </div>
    )
}

export default ThreeCanvas
