import { lerp, clamp01, rnd, makeCanvasTexture, glowTexture, makeFloorShadow, makeSparkles } from './helpers'

const heartShape = (THREE) => {
    const s = new THREE.Shape()
    s.moveTo(0, -0.5)
    s.bezierCurveTo(-0.15, -0.35, -0.6, -0.1, -0.6, 0.2)
    s.bezierCurveTo(-0.6, 0.5, -0.25, 0.62, 0, 0.35)
    s.bezierCurveTo(0.25, 0.62, 0.6, 0.5, 0.6, 0.2)
    s.bezierCurveTo(0.6, -0.1, 0.15, -0.35, 0, -0.5)
    return s
}

export function buildCake({ THREE, scene, camera, controls }, { name = 'Lida' } = {}) {
    camera.position.set(0, 3.6, 8.4)
    controls.target.set(0, 1.55, 0)
    controls.minDistance = 5
    controls.maxDistance = 13
    controls.update()

    // ----- lights -----
    scene.add(new THREE.HemisphereLight(0xfff4f8, 0xf1bfd0, 1.4))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(4, 7, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xffb3cc, 1.3)
    rim.position.set(-5, 4, -4)
    scene.add(rim)
    const candleLight = new THREE.PointLight(0xffb45a, 4, 6, 2)
    candleLight.position.set(0, 3.1, 0)
    scene.add(candleLight)

    const cake = new THREE.Group()
    scene.add(cake)
    cake.add(makeFloorShadow(THREE, 6.6, 0.3))

    const frostMat = new THREE.MeshStandardMaterial({ color: '#fffafc', roughness: 0.45 })
    const pearlMat = new THREE.MeshPhysicalMaterial({ color: '#fff7fb', roughness: 0.25, clearcoat: 1 })

    // ----- plate -----
    const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.5, 0.12, 64),
        new THREE.MeshPhysicalMaterial({ color: '#ffffff', emissive: '#fff0f5', emissiveIntensity: 0.25, roughness: 0.25, clearcoat: 0.6 })
    )
    plate.position.y = 0.06
    cake.add(plate)
    const plateRim = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.05, 10, 64), new THREE.MeshStandardMaterial({ color: '#ffc2d3', roughness: 0.4 }))
    plateRim.rotation.x = Math.PI / 2
    plateRim.position.y = 0.12
    cake.add(plateRim)

    // ----- band texture for the bottom tier (uniform pixel size, so text is not stretched) -----
    const bandCircumference = Math.PI * 2 * 1.7
    const bandHeight = 0.78
    const W = 4096
    const H = Math.round((W * bandHeight) / bandCircumference)
    const drawBand = (ctx, w, h) => {
        ctx.fillStyle = '#ffb0c7'
        ctx.fillRect(0, 0, w, h)
        // scalloped lace on top and bottom
        ctx.fillStyle = '#fff6f9'
        for (let x = 0; x < w; x += 44) {
            ctx.beginPath(); ctx.arc(x + 22, 0, 24, 0, Math.PI); ctx.fill()
            ctx.beginPath(); ctx.arc(x + 22, h, 24, Math.PI, Math.PI * 2); ctx.fill()
        }
        // little hearts around the band
        ctx.fillStyle = '#ffffff'
        ctx.font = `${Math.round(h * 0.28)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        for (let x = 150; x < w; x += 330) {
            if (Math.abs(x - w / 2) < 760) continue
            ctx.globalAlpha = 0.85
            ctx.fillText('♥', x, h * 0.64)
        }
        ctx.globalAlpha = 1
        // the message (centre of the canvas = front of the cake)
        ctx.fillStyle = '#c2255c'
        ctx.font = `700 ${Math.round(h * 0.4)}px "Dancing Script", "Segoe Script", cursive`
        ctx.fillText(`Happy Birthday ${name} ♥`, w / 2, h * 0.66)
    }
    const band = makeCanvasTexture(THREE, W, H, drawBand)
    // redraw once the web font is ready so the lettering looks right
    document.fonts?.load?.('700 60px "Dancing Script"').then(() => {
        drawBand(band.ctx, W, H)
        band.tex.needsUpdate = true
    }).catch(() => {})

    // ----- tiers -----
    const tiers = [
        { r: 1.7, h: 0.78, y: 0.12, color: '#ffb0c7', map: band.tex, rot: Math.PI },
        { r: 1.2, h: 0.66, y: 0.9, color: '#ffd0dd' },
        { r: 0.8, h: 0.56, y: 1.56, color: '#ffe6ee' },
    ]
    const dripGeoCache = {}
    tiers.forEach((tr, ti) => {
        const bodyMat = new THREE.MeshStandardMaterial({ color: tr.map ? '#ffffff' : tr.color, map: tr.map || null, roughness: 0.6 })
        const body = new THREE.Mesh(new THREE.CylinderGeometry(tr.r, tr.r, tr.h, 72), bodyMat)
        body.position.y = tr.y + tr.h / 2
        if (tr.rot) body.rotation.y = tr.rot
        cake.add(body)

        const top = tr.y + tr.h
        // frosting top + rim
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(tr.r + 0.01, tr.r + 0.01, 0.06, 72), frostMat)
        cap.position.y = top + 0.01
        cake.add(cap)
        const rim = new THREE.Mesh(new THREE.TorusGeometry(tr.r, 0.075, 12, 72), frostMat)
        rim.rotation.x = Math.PI / 2
        rim.position.y = top + 0.03
        cake.add(rim)

        // drips down the side
        const nDrips = Math.round((Math.PI * 2 * tr.r) / 0.36)
        for (let i = 0; i < nDrips; i++) {
            const a = (i / nDrips) * Math.PI * 2 + rnd(ti * 40 + i) * 0.1
            const len = 0.1 + rnd(ti * 90 + i + 3) * 0.14
            const key = len.toFixed(2)
            dripGeoCache[key] = dripGeoCache[key] || new THREE.CapsuleGeometry(0.07, len, 4, 10)
            const drip = new THREE.Mesh(dripGeoCache[key], frostMat)
            drip.position.set(Math.sin(a) * (tr.r + 0.01), top - len / 2 - 0.03, Math.cos(a) * (tr.r + 0.01))
            cake.add(drip)
        }

        // pearls around the bottom of each tier
        const nPearls = Math.round((Math.PI * 2 * tr.r) / 0.2)
        const pearls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 12, 10), pearlMat, nPearls)
        const m = new THREE.Matrix4()
        for (let i = 0; i < nPearls; i++) {
            const a = (i / nPearls) * Math.PI * 2
            m.setPosition(Math.sin(a) * (tr.r + 0.03), tr.y + 0.07, Math.cos(a) * (tr.r + 0.03))
            pearls.setMatrixAt(i, m)
        }
        cake.add(pearls)
    })

    // ----- sprinkles on the ledges (instanced = cheap) -----
    const sprinkleColors = ['#ff6f9c', '#ffd23f', '#7fd8ff', '#b79cff', '#7be0a8', '#ffffff']
    const addSprinkles = (rMin, rMax, y, count, seed) => {
        const mesh = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.018, 0.075, 3, 6), new THREE.MeshStandardMaterial({ roughness: 0.4 }), count)
        const m = new THREE.Matrix4()
        const q = new THREE.Quaternion()
        const e = new THREE.Euler()
        const col = new THREE.Color()
        for (let i = 0; i < count; i++) {
            const a = rnd(seed + i) * Math.PI * 2
            const r = lerp(rMin, rMax, Math.sqrt(rnd(seed + i + 500)))
            e.set(Math.PI / 2, 0, rnd(seed + i + 900) * Math.PI)
            q.setFromEuler(e)
            m.compose(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r), q, new THREE.Vector3(1, 1, 1))
            mesh.setMatrixAt(i, m)
            mesh.setColorAt(i, col.set(sprinkleColors[Math.floor(rnd(seed + i + 200) * sprinkleColors.length)]))
        }
        cake.add(mesh)
    }
    addSprinkles(1.3, 1.62, 0.93, 60, 1)
    addSprinkles(0.88, 1.12, 1.59, 36, 777)

    // ----- strawberries ring on the top tier -----
    const topY = 1.56 + 0.56 + 0.06
    const berryMat = new THREE.MeshStandardMaterial({ color: '#ff2f55', roughness: 0.35 })
    const leafMat = new THREE.MeshStandardMaterial({ color: '#3fae65', roughness: 0.6 })
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        const x = Math.sin(a) * 0.62
        const z = Math.cos(a) * 0.62
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), berryMat)
        berry.scale.set(1, 1.18, 1)
        berry.position.set(x, topY + 0.1, z)
        cake.add(berry)
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.07, 6), leafMat)
        leaf.position.set(x, topY + 0.26, z)
        cake.add(leaf)
        const dollop = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), frostMat)
        const b = a + Math.PI / 8
        dollop.position.set(Math.sin(b) * 0.62, topY + 0.05, Math.cos(b) * 0.62)
        cake.add(dollop)
    }

    // ----- heart on the front of the middle tier -----
    const heart = new THREE.Mesh(
        new THREE.ExtrudeGeometry(heartShape(THREE), { depth: 0.1, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3, curveSegments: 18 }),
        new THREE.MeshPhysicalMaterial({ color: '#ff4f7a', roughness: 0.3, clearcoat: 0.8 })
    )
    heart.scale.setScalar(0.42)
    heart.position.set(0, 1.22, 1.2 + 0.02)
    cake.add(heart)

    // ----- candles + flames -----
    const stripe = makeCanvasTexture(THREE, 64, 64, (ctx, w, h) => {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = '#ff8fb1'
        for (let i = -h; i < w + h; i += 22) {
            ctx.beginPath(); ctx.moveTo(i, h); ctx.lineTo(i + 11, h); ctx.lineTo(i + 11 + h, 0); ctx.lineTo(i + h, 0); ctx.fill()
        }
    }).tex
    stripe.wrapS = stripe.wrapT = THREE.RepeatWrapping
    stripe.repeat.set(1, 3)
    const candleMat = new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.5 })
    const wickMat = new THREE.MeshStandardMaterial({ color: '#4a3a3a' })
    const flameTex = makeCanvasTexture(THREE, 64, 128, (ctx, w, h) => {
        ctx.translate(w / 2, h * 0.62)
        ctx.scale(1, 1.9)
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.45)
        g.addColorStop(0, 'rgba(255,255,235,1)')
        g.addColorStop(0.3, 'rgba(255,225,120,0.95)')
        g.addColorStop(0.7, 'rgba(255,140,40,0.55)')
        g.addColorStop(1, 'rgba(255,100,20,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2); ctx.fill()
    }).tex
    const glow = glowTexture(THREE, 'rgba(255,200,110,1)', 'rgba(255,170,60,0)')

    const candles = []
    const CANDLE_COUNT = 7
    for (let i = 0; i < CANDLE_COUNT; i++) {
        const a = (i / CANDLE_COUNT) * Math.PI * 2
        const x = Math.sin(a) * 0.37
        const z = Math.cos(a) * 0.37
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.56, 14), candleMat)
        c.position.set(x, topY + 0.28, z)
        cake.add(c)
        const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), wickMat)
        wick.position.set(x, topY + 0.59, z)
        cake.add(wick)

        const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false }))
        flame.position.set(x, topY + 0.8, z)
        flame.scale.set(0.2, 0.4, 1)
        cake.add(flame)
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, opacity: 0.28, depthWrite: false }))
        halo.position.copy(flame.position)
        halo.scale.set(0.55, 0.55, 1)
        cake.add(halo)
        candles.push({ flame, halo, x, z, seed: i * 1.7 })
    }

    // ----- ambient sparkles -----
    const sparkles = makeSparkles(THREE, { count: 60, radius: 3.4, height: 5, color: '#ff9ec0', size: 0.12 })
    scene.add(sparkles.points)

    // ----- blow out / relight / burst -----
    let blown = false
    let blowAt = 0
    let clock = 0
    const smokeTex = glowTexture(THREE, 'rgba(235,225,230,1)', 'rgba(235,225,230,0)')
    let smoke = []
    let burst = null

    const clearEffects = () => {
        smoke.forEach((s) => { cake.remove(s.sprite); s.sprite.material.dispose() })
        smoke = []
        if (burst) { scene.remove(burst.points); burst.points.geometry.dispose(); burst.points.material.dispose(); burst = null }
    }

    const blowOut = () => {
        if (blown) return
        blown = true
        blowAt = clock
        candles.forEach((c, i) => {
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false }))
            sprite.position.copy(c.flame.position)
            sprite.scale.setScalar(0.12)
            cake.add(sprite)
            smoke.push({ sprite, start: blowAt + i * 0.07 + 0.1, x: c.x, z: c.z, y: c.flame.position.y })
        })
        // sparkle burst
        const n = 90
        const geo = new THREE.BufferGeometry()
        const pos = new Float32Array(n * 3)
        const vel = []
        for (let i = 0; i < n; i++) {
            pos.set([0, topY + 0.8, 0], i * 3)
            const a = rnd(i + 1) * Math.PI * 2
            const up = 1.2 + rnd(i + 70) * 2.4
            const sp = 0.6 + rnd(i + 30) * 1.8
            vel.push([Math.cos(a) * sp, up, Math.sin(a) * sp])
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        const mat = new THREE.PointsMaterial({ size: 0.16, map: glowTexture(THREE), color: '#ffb52e', transparent: true, depthWrite: false })
        const points = new THREE.Points(geo, mat)
        points.frustumCulled = false
        scene.add(points)
        burst = { points, vel, start: clock }
    }

    const relight = () => {
        blown = false
        clearEffects()
    }

    const update = (dt, t) => {
        clock = t

        candles.forEach((c, i) => {
            let s = 1
            if (blown) s = clamp01(1 - (t - blowAt - i * 0.07) / 0.35)
            const flick = 1 + Math.sin(t * 14 + c.seed) * 0.06 + Math.sin(t * 23 + c.seed * 2) * 0.04
            c.flame.visible = s > 0.01
            c.halo.visible = s > 0.01
            c.flame.scale.set(0.2 * s * (2 - flick), 0.4 * s * flick, 1)
            c.halo.scale.setScalar(0.55 * s * flick)
            c.flame.material.rotation = Math.sin(t * 6 + c.seed) * 0.05
        })
        candleLight.intensity = blown ? Math.max(0, candleLight.intensity - dt * 14) : 4 + Math.sin(t * 13) * 0.4 + Math.sin(t * 27) * 0.25

        smoke.forEach((s) => {
            const p = clamp01((t - s.start) / 1.7)
            if (p <= 0) return
            s.sprite.position.set(s.x + Math.sin(t * 2 + s.x * 9) * 0.05 * p, s.y + p * 0.9, s.z)
            s.sprite.scale.setScalar(0.12 + p * 0.55)
            s.sprite.material.opacity = (1 - p) * 0.55 * Math.min(1, p * 8)
        })

        if (burst) {
            const age = t - burst.start
            const pos = burst.points.geometry.attributes.position
            for (let i = 0; i < burst.vel.length; i++) {
                const v = burst.vel[i]
                pos.setXYZ(i, v[0] * age, topY + 0.8 + v[1] * age - 2.6 * age * age, v[2] * age)
            }
            pos.needsUpdate = true
            burst.points.material.opacity = clamp01(1 - age / 2.2)
        }

        sparkles.update(dt, t)
    }

    return {
        update,
        blowOut,
        relight,
        dispose: () => clearEffects(),
    }
}
