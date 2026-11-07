// Small helpers shared by the 3D scenes (flower + cake)

export const lerp = (a, b, t) => a + (b - a) * t
export const clamp01 = (t) => Math.min(1, Math.max(0, t))
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
export const easeOutBack = (t) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
// deterministic pseudo random (keeps scenes identical on every load)
export const rnd = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
    return x - Math.floor(x)
}

export const makeCanvasTexture = (THREE, w, h, draw) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    draw(ctx, w, h)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return { tex, canvas, ctx }
}

export const glowTexture = (THREE, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') =>
    makeCanvasTexture(THREE, 128, 128, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
        g.addColorStop(0, inner)
        g.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.55)'))
        g.addColorStop(1, outer)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
    }).tex

// soft blob on the floor instead of a heavy real-time shadow
export const makeFloorShadow = (THREE, size = 4, opacity = 0.35) => {
    const tex = glowTexture(THREE, 'rgba(150,40,80,1)', 'rgba(150,40,80,0)')
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false })
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.position.y = 0.005
    return mesh
}

// floating sparkles that drift upwards
export const makeSparkles = (THREE, { count = 70, radius = 2.8, height = 5, color = '#ff9ec0', size = 0.12 } = {}) => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seeds = []
    for (let i = 0; i < count; i++) {
        const a = rnd(i + 1) * Math.PI * 2
        const r = Math.sqrt(rnd(i + 50)) * radius
        pos[i * 3] = Math.cos(a) * r
        pos[i * 3 + 1] = rnd(i + 99) * height
        pos[i * 3 + 2] = Math.sin(a) * r
        seeds.push({ speed: 0.15 + rnd(i + 7) * 0.35, sway: rnd(i + 3) * 6, base: [pos[i * 3], pos[i * 3 + 2]] })
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
        size,
        map: glowTexture(THREE),
        color,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        sizeAttenuation: true,
    })
    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false
    const update = (dt, t) => {
        const p = geo.attributes.position
        for (let i = 0; i < count; i++) {
            let y = p.getY(i) + seeds[i].speed * dt
            if (y > height) y = 0
            p.setY(i, y)
            p.setX(i, seeds[i].base[0] + Math.sin(t * 0.6 + seeds[i].sway) * 0.15)
            p.setZ(i, seeds[i].base[1] + Math.cos(t * 0.5 + seeds[i].sway) * 0.15)
        }
        p.needsUpdate = true
    }
    return { points, update }
}

// frees GPU memory for everything inside a scene
export const disposeScene = (scene) => {
    scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
        mats.forEach((m) => {
            Object.values(m).forEach((v) => v && v.isTexture && v.dispose())
            m.dispose()
        })
    })
}
