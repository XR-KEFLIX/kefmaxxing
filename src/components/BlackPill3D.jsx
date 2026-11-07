import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function BlackPill3D({ className }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let renderer = null
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      container.style.display = 'none'
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0, 1.05, 7.4)
    camera.lookAt(0, 0.05, 0)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(3.2, 5.2, 3.6)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xffe2ca, 0.55)
    rimLight.position.set(-4.2, 2.6, -3.4)
    scene.add(rimLight)

    const hemisphere = new THREE.HemisphereLight(0x9aa6b8, 0x05070a, 0.6)
    scene.add(hemisphere)

    const root = new THREE.Group()
    scene.add(root)

    const body = new THREE.Group()
    root.add(body)

    const radius = 0.8
    const cylinderLength = 1.95

    const capsuleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111117, metalness: 0.03, roughness: 0.38, clearcoat: 0.45, clearcoatRoughness: 0.3, specularIntensity: 0.6, specularColor: 0xdddddd,
    })

    const capsule = new THREE.Mesh(new THREE.CapsuleGeometry(radius, cylinderLength, 28, 56), capsuleMaterial)
    capsule.castShadow = true
    body.add(capsule)

    const seamRing = new THREE.Mesh(new THREE.TorusGeometry(radius - 0.004, 0.009, 16, 72), new THREE.MeshStandardMaterial({ color: 0x15151b, metalness: 0.6, roughness: 0.5 }))
    seamRing.rotation.x = Math.PI / 2
    body.add(seamRing)

    body.rotation.z = Math.PI / 2.35
    root.position.y = 0.25

    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 256
    shadowCanvas.height = 256
    const shadowContext = shadowCanvas.getContext('2d')
    if (shadowContext) {
      const gradient = shadowContext.createRadialGradient(128, 128, 6, 128, 128, 124)
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)')
      gradient.addColorStop(0.42, 'rgba(0, 0, 0, 0.38)')
      gradient.addColorStop(0.75, 'rgba(0, 0, 0, 0.1)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      shadowContext.fillStyle = gradient
      shadowContext.fillRect(0, 0, 256, 256)
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
    shadowTexture.colorSpace = THREE.SRGBColorSpace
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.55 })
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(5.1, 3.4), shadowMaterial)
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = -1.72
    scene.add(shadowPlane)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const home = { yaw: 0, pitch: 0.12, offsetX: 0, offsetY: 0 }
    const view = { yaw: home.yaw, pitch: home.pitch, offsetX: 0, offsetY: 0 }
    const motion = { yawVelocity: 0 }
    let dragging = false
    let dragMode = 'rotate'
    let lastX = 0
    let lastY = 0

    const setGrabCursor = (grab) => { container.style.cursor = grab ? 'grabbing' : 'grab' }
    setGrabCursor(false)

    const onPointerDown = (event) => {
      dragging = true
      dragMode = event.shiftKey || event.button === 2 ? 'pan' : 'rotate'
      lastX = event.clientX
      lastY = event.clientY
      motion.yawVelocity = 0
      container.setPointerCapture(event.pointerId)
      setGrabCursor(true)
    }

    const onPointerMove = (event) => {
      if (!dragging) return
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      if (dragMode === 'pan') {
        view.offsetX = Math.max(-3.6, Math.min(3.6, view.offsetX + dx * 0.011))
        view.offsetY = Math.max(-2.3, Math.min(2.3, view.offsetY - dy * 0.011))
        return
      }
      view.yaw += dx * 0.011
      view.pitch = Math.max(-0.65, Math.min(0.85, view.pitch + dy * 0.008))
      motion.yawVelocity = dx * 0.011
    }

    const endDrag = (event) => {
      if (!dragging) return
      dragging = false
      if (event) {
        try { container.releasePointerCapture(event.pointerId) } catch { /* already released */ }
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

    const onContextMenu = (event) => { event.preventDefault() }

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
        view.yaw += motion.yawVelocity
        motion.yawVelocity *= 0.94
        if (Math.abs(motion.yawVelocity) < 0.0015) {
          motion.yawVelocity = 0
          view.yaw += reducedMotion ? 0 : 0.0032
        }
      }

      root.rotation.y = view.yaw
      body.rotation.x = view.pitch + (reducedMotion ? 0 : Math.sin(t * 0.6) * 0.05)
      capsule.rotation.y = reducedMotion ? 0 : t * 0.55
      root.position.x = view.offsetX

      if (!reducedMotion) {
        const lift = Math.sin(t * 1.1)
        root.position.y = 0.25 + view.offsetY + lift * 0.1
        shadowPlane.scale.set(1 - lift * 0.09, 1 - lift * 0.09, 1)
        shadowMaterial.opacity = 0.55 - lift * 0.18
      } else {
        root.position.y = 0.25 + view.offsetY
      }

      renderer.render(scene, camera)
    }

    const animate = () => { frame = window.requestAnimationFrame(animate); render() }
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
      seamRing.material.dispose()
      shadowPlane.geometry.dispose()
      shadowMaterial.dispose()
      shadowTexture.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className={className} role="img" aria-label="Interactive 3D blackpill. Drag it to rotate, Shift-drag to move it, double-click to reset." style={{ touchAction: 'none', userSelect: 'none' }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
