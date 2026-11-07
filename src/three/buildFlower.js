import { lerp, clamp01, easeOutCubic, easeOutBack, rnd, makeFloorShadow, makeSparkles } from './helpers'

// A curved, cupped petal (flat plane bent into shape, with a base->tip colour gradient)
const petalGeometry = (THREE, { width, height, cup, curl, base, tip, ruffle = 0.02 }) => {
    const g = new THREE.PlaneGeometry(1, 1, 16, 22)
    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const cb = new THREE.Color(base)
    const ct = new THREE.Color(tip)
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i) // -0.5 .. 0.5
        const v = pos.getY(i) + 0.5 // 0 .. 1
        const nx = u * 2 // -1 .. 1
        // narrow base, widest at ~60%, rounded tip
        const prof = v < 0.6
            ? 0.32 + 0.68 * Math.sin((Math.PI / 2) * (v / 0.6))
            : Math.max(0.04, Math.sqrt(Math.max(0, 1 - Math.pow((v - 0.6) / 0.4, 2))))
        const x = u * width * prof
        const y = v * height
        const z = -cup * width * nx * nx * (0.3 + 0.7 * v) + curl * height * Math.pow(v, 3) + ruffle * Math.sin(nx * 6 + v * 5)
        pos.setXYZ(i, x, y, z)
        const t = clamp01(Math.pow(v, 1.1) + 0.15 * Math.abs(nx) * v)
        c.lerpColors(cb, ct, t)
        colors.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
}

const leafGeometry = (THREE) => {
    const g = new THREE.PlaneGeometry(1, 1, 6, 12)
    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const cb = new THREE.Color('#2f8f4e')
    const ct = new THREE.Color('#86dc9f')
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i)
        const v = pos.getY(i) + 0.5
        const prof = Math.pow(Math.sin(Math.PI * Math.pow(v, 0.8)), 0.8)
        pos.setXYZ(i, u * prof * 0.62, v * 1.05, Math.abs(u * 2) * 0.12 * prof - v * v * 0.28)
        c.lerpColors(cb, ct, clamp01(v + Math.abs(u) * 0.4))
        colors.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
}

export function buildFlower({ THREE, scene, camera, renderer, controls }) {
    renderer.toneMapping = THREE.NoToneMapping // keeps the pinks vivid
    camera.position.set(0, 3.0, 8.4)
    controls.target.set(0, 1.65, 0)
    controls.minDistance = 4.5
    controls.maxDistance = 12
    controls.update()

    // ----- lights -----
    scene.add(new THREE.HemisphereLight(0xfff4f8, 0xe8a9c0, 1.0))
    const key = new THREE.DirectionalLight(0xffffff, 2.6)
    key.position.set(3, 6, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xff9cc0, 1.4)
    rim.position.set(-5, 3, -4)
    scene.add(rim)
    const fill = new THREE.PointLight(0xffd0e0, 12, 9, 2)
    fill.position.set(0, 3.2, 2.4)
    scene.add(fill)

    const plant = new THREE.Group()
    scene.add(plant)
    plant.add(makeFloorShadow(THREE, 3.2, 0.3))

    // ----- stem (grows up) -----
    const stemGroup = new THREE.Group()
    plant.add(stemGroup)
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.07, 0.8, 0.03),
        new THREE.Vector3(-0.06, 1.6, -0.04),
        new THREE.Vector3(0, 2.42, 0),
    ])
    const stem = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 48, 0.055, 10, false),
        new THREE.MeshStandardMaterial({ color: '#3f9d5d', roughness: 0.55 })
    )
    stemGroup.add(stem)

    // ----- leaves -----
    const leafGeo = leafGeometry(THREE)
    const leafMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.5 })
    const leaves = [
        { y: 0.65, rot: 0.3, size: 1.0 },
        { y: 1.15, rot: 2.5, size: 0.9 },
        { y: 1.65, rot: 4.5, size: 0.72 },
    ].map((l, i) => {
        const holder = new THREE.Group()
        holder.position.set(0.03, l.y, 0)
        holder.rotation.y = l.rot
        const mesh = new THREE.Mesh(leafGeo, leafMat)
        mesh.rotation.x = 0.95
        mesh.scale.setScalar(l.size)
        holder.add(mesh)
        plant.add(holder)
        holder.scale.setScalar(0.001)
        return { holder, delay: 0.9 + i * 0.25 }
    })

    // ----- flower head (rose) -----
    const head = new THREE.Group()
    plant.add(head)

    const petalMat = new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        roughness: 0.45,
        sheen: 0.6,
        sheenRoughness: 0.4,
        sheenColor: new THREE.Color('#ff9ec2'),
        emissive: new THREE.Color('#ff2f6d'),
        emissiveIntensity: 0.07,
    })
    const N = 36
    const baseIn = new THREE.Color('#ff2e78')
    const baseOut = new THREE.Color('#ff5f98')
    const tipIn = new THREE.Color('#ff7fab')
    const tipOut = new THREE.Color('#ffb8d0')
    const petals = []
    for (let k = 0; k < N; k++) {
        const t = k / (N - 1)
        const size = lerp(0.62, 1.18, Math.pow(t, 0.8)) * (0.94 + rnd(k) * 0.12)
        const geo = petalGeometry(THREE, {
            width: size * 0.98,
            height: size * 1.12,
            cup: lerp(0.7, 0.4, t),
            curl: lerp(0.0, 0.2, Math.pow(t, 1.4)),
            base: baseIn.clone().lerp(baseOut, t),
            tip: tipIn.clone().lerp(tipOut, t),
        })
        const holder = new THREE.Group()
        holder.rotation.y = k * 2.399963 + rnd(k + 9) * 0.2
        holder.position.y = lerp(0.3, 0, Math.pow(t, 0.7))
        const mesh = new THREE.Mesh(geo, petalMat)
        mesh.position.z = lerp(0.02, 0.2, t)
        holder.add(mesh)
        head.add(holder)
        petals.push({
            mesh,
            open: lerp(0.08, 1.02, Math.pow(t, 0.9)),
            delay: (1 - t) * 0.9, // outer petals open first
        })
    }

    // green sepals + receptacle under the bloom
    const sepalMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.6 })
    for (let i = 0; i < 5; i++) {
        const g = petalGeometry(THREE, { width: 0.32, height: 0.78, cup: 0.2, curl: 0.1, base: '#2f8f4e', tip: '#79cf93' })
        const holder = new THREE.Group()
        holder.rotation.y = (i / 5) * Math.PI * 2
        holder.position.y = -0.04
        const mesh = new THREE.Mesh(g, sepalMat)
        mesh.position.z = 0.05
        mesh.rotation.x = 1.95
        holder.add(mesh)
        head.add(holder)
    }
    const receptacle = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshStandardMaterial({ color: '#3f9d5d', roughness: 0.6 }))
    receptacle.position.y = -0.02
    head.add(receptacle)

    // ----- sparkles floating around -----
    const sparkles = makeSparkles(THREE, { count: 70, radius: 2.8, height: 5.2, color: '#ff8fb8', size: 0.12 })
    scene.add(sparkles.points)

    // ----- animation state -----
    let growClock = 0
    let petalClock = -0.7 // short pause before the bloom starts

    const update = (dt, t) => {
        growClock += dt
        petalClock += dt

        const g = easeOutCubic(clamp01(growClock / 1.3))
        stemGroup.scale.y = Math.max(g, 0.001)
        head.position.y = 2.42 * g

        leaves.forEach((l) => {
            const p = easeOutBack(clamp01((growClock - l.delay) / 0.8))
            l.holder.scale.setScalar(Math.max(p, 0.001))
        })

        petals.forEach((p) => {
            const e = easeOutCubic(clamp01((petalClock - p.delay) / 1.7))
            p.mesh.rotation.x = lerp(p.open * 0.1, p.open, e)
            p.mesh.scale.setScalar(lerp(0.35, 1, e))
        })

        // gentle breeze
        plant.rotation.z = Math.sin(t * 0.8) * 0.018
        head.rotation.z = Math.sin(t * 1.1 + 1) * 0.025
        sparkles.update(dt, t)
    }

    return {
        update,
        // play the bloom again
        replay: () => { petalClock = -0.2 },
    }
}
