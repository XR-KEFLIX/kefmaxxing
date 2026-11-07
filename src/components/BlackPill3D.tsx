import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Interactive real-time 3D blackpill rendered with Three.js.
 * Drag it to rotate with inertia, slow turntable when idle,
 * double-click to reset the view. Transparent canvas, no card.
 */
export function BlackPill3D({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let renderer: THREE.WebGLRenderer | null = null
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      container.style.display = 'none'
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0, 1.05, 7.4)
    camera.lookAt(0, 0.05, 0)

    // Environment reflections without an external HDR: procedural room.
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
    keyLight.position.set(3.2, 5.2, 3.6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.near = 1
    keyLight.shadow.camera.far = 16
    keyLight.shadow.camera.left = -5
    keyLight.shadow.camera.right = 5
    keyLight.shadow.camera.top = 5
    keyLight.shadow.camera.bottom = -5
    keyLight.shadow.bias = -0.0004
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xc9ffe2, 1.35)
    rimLight.position.set(-4.2, 2.6, -3.4)
    scene.add(rimLight)

    const hemisphere = new THREE.HemisphereLight(0x9aa6b8, 0x05070a, 0.6)
    scene.add(hemisphere)

    // --- Procedural capsule -------------------------------------------
    const root = new THREE.Group()
    scene.add(root)

    const body = new THREE.Group()
    root.add(body)

    const radius = 0.8
    const cylinderLength = 1.95

    const capsuleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0b0b10,
      metalness: 0.28,
      roughness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.35,
      specularIntensity: 1.15,
    })

    const capsule = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, cylinderLength, 28, 56),
      capsuleMaterial,
    )
    capsule.castShadow = true
    body.add(capsule)

    const seamRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius + 0.001, 0.016, 16, 72),
      new THREE.MeshStandardMaterial({
        color: 0x34343f,
        metalness: 0.92,
        roughness: 0.32,
        envMapIntensity: 1.1,
      }),
    )
    seamRing.rotation.x = Math.PI / 2
    body.add(seamRing)

    body.rotation.z = Math.PI / 2.35
    root.position.y = 0.25

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.42, color: 0x000000 }),
    )
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = -1.75
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)
    // ------------------------------------------------------------------

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const home = { yaw: 0, pitch: 0.12, offsetX: 0, offsetY: 0 }
    const view = { yaw: home.yaw, pitch: home.pitch, offsetX: 0, offsetY: 0 }
    const motion = { yawVelocity: 0 }
    let dragging = false
    let dragMode: 'rotate' | 'pan' = 'rotate'
    let lastX = 0
    let lastY = 0
    // -------------------------------------------------------------------

    const setGrabCursor = (grab: boolean) => {
      container.style.cursor = grab ? 'grabbing' : 'grab'
    }
    setGrabCursor(false)

    const onPointerDown = (event: PointerEvent) => {
      dragging = true
      dragMode = event.shiftKey || event.button === 2 ? 'pan' : 'rotate'
      lastX = event.clientX
      lastY = event.clientY
      motion.yawVelocity = 0
      container.setPointerCapture(event.pointerId)
      setGrabCursor(true)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      if (dragMode === 'pan') {
        view.offsetX = Math.max(-1.6, Math.min(1.6, view.offsetX + dx * 0.009))
        view.offsetY = Math.max(-1.1, Math.min(1.1, view.offsetY - dy * 0.009))
        return
      }
      view.yaw += dx * 0.011
      view.pitch = Math.max(-0.65, Math.min(0.85, view.pitch + dy * 0.008))
      motion.yawVelocity = dx * 0.011
    }

    const endDrag = (event?: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (event) {
        try {
          container.releasePointerCapture(event.pointerId)
        } catch {
          /* already released */
        }
      }
      setGrabCursor(false)
    }

    const onDoubleClick = () => {
      view.yaw = home.yaw
      view.pitch = home.pitch
      view.offsetX = home.offsetX
      view.offsetY = home.offsetY
      motion.yawVelocity = 0
    }

    const onContextMenu = (event: Event) => {
      event.preventDefault()
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', endDrag)
    container.addEventListener('pointercancel', endDrag)
    container.addEventListener('dblclick', onDoubleClick)
    container.addEventListener('contextmenu', onContextMenu)

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()

    const clock = new THREE.Clock()
    let frame = 0

    const render = () => {
      const t = clock.getElapsedTime()

      if (!dragging) {
        // Throw inertia, then settle into a slow idle turntable.
        view.yaw += motion.yawVelocity
        motion.yawVelocity *= 0.94
        if (Math.abs(motion.yawVelocity) < 0.0015) {
          motion.yawVelocity = 0
          view.yaw += reducedMotion ? 0 : 0.0042
        }
      }

      root.rotation.y = view.yaw
      body.rotation.x = view.pitch + (reducedMotion ? 0 : Math.sin(t * 0.6) * 0.05)
      capsule.rotation.y = reducedMotion ? 0 : t * 0.55
      root.position.x = view.offsetX

      if (!reducedMotion) {
        root.position.y = 0.25 + view.offsetY + Math.sin(t * 1.1) * 0.13
        shadowPlane.scale.setScalar(1 - Math.sin(t * 1.1) * 0.06)
      } else {
        root.position.y = 0.25 + view.offsetY
      }

      renderer.render(scene, camera)
    }

    const animate = () => {
      frame = window.requestAnimationFrame(animate)
      render()
    }

    animate()

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', endDrag)
      container.removeEventListener('pointercancel', endDrag)
      container.removeEventListener('dblclick', onDoubleClick)
      container.removeEventListener('contextmenu', onContextMenu)
      capsule.geometry.dispose()
      capsuleMaterial.dispose()
      seamRing.geometry.dispose()
      ;(seamRing.material as THREE.Material).dispose()
      shadowPlane.geometry.dispose()
      ;(shadowPlane.material as THREE.Material).dispose()
      scene.environment?.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="Interactive 3D blackpill. Drag it to rotate, Shift-drag to move it, double-click to reset."
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
