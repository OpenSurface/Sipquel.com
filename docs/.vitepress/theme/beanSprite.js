// Roasted coffee beans for the canvas field.
//
// A bean is drawn in two passes so it looks lit, not printed:
//   albedo(size, tone, phase)  the bean's own colour and crease, for one of
//                              PHASES steps of rolling about its long axis
//   light(size)                highlight, shade and sheen in SCREEN space
// The field rotates the albedo, then lays the light over it unrotated, so the
// highlight stays top-left however the bean turns.
export const PHASES = 20
const TONES = [
  ['#5f3d23', '#452a17', '#231208'],
  ['#4f311b', '#381f11', '#1a0d05'],
  ['#6d472a', '#503220', '#2a170b'],
]
const cache = new Map()
const memo = (key, make) => { let v = cache.get(key); if (!v) cache.set(key, (v = make())); return v }
const PAD = 5

function canvas(size, dpr, extra = 0) {
  const c = document.createElement('canvas')
  c.width = c.height = Math.ceil((size * 2 + (PAD + extra) * 2) * dpr)
  const g = c.getContext('2d')
  g.scale(dpr, dpr)
  g.translate(size + PAD + extra, size + PAD + extra)
  return [c, g]
}

// The outline: an oval, a little fuller at one end. `h` is its half-height.
function outline(g, rx, h) {
  g.beginPath()
  g.moveTo(-rx, 0)
  g.bezierCurveTo(-rx, -h * 1.14, -rx * .12, -h * 1.1, rx * .42, -h * .9)
  g.bezierCurveTo(rx * .87, -h * .73, rx * 1.02, -h * .3, rx, 0)
  g.bezierCurveTo(rx * 1.02, h * .3, rx * .87, h * .73, rx * .42, h * .9)
  g.bezierCurveTo(-rx * .12, h * 1.1, -rx, h * 1.14, -rx, 0)
  g.closePath()
}
// Half-height of the silhouette at a roll angle: face-on is widest, edge-on keeps most of its thickness.
export const heightAt = (size, theta) => size * .68 * (.78 + .22 * Math.abs(Math.cos(theta)))

export function albedo(size, tone, phase, dpr) {
  return memo(`a|${size}|${tone}|${phase}|${dpr}`, () => {
    const [c, g] = canvas(size, dpr)
    const theta = (phase / PHASES) * Math.PI * 2, k = Math.cos(theta)
    const rx = size, h = heightAt(size, theta), T = TONES[tone % TONES.length]
    const soft = (px) => { g.filter = px > .2 ? `blur(${px}px)` : 'none' }
    const body = g.createRadialGradient(0, 0, h * .2, 0, 0, rx * 1.05)
    body.addColorStop(0, T[0]); body.addColorStop(.55, T[1]); body.addColorStop(1, T[2])
    outline(g, rx, h); g.fillStyle = body; g.fill()
    g.save(); outline(g, rx, h); g.clip()
    // Darker into the rim, so the form reads as round before any light is added.
    soft(size * .1); outline(g, rx, h); g.strokeStyle = 'rgba(10, 5, 2, .55)'; g.lineWidth = size * .26; g.stroke()
    if (k > .06) {
      // The crease rides round the face as the bean rolls, narrowing as it nears the edge.
      const y0 = h * .96 * Math.sin(theta), w = k
      const top = () => g.bezierCurveTo(-rx * .3, y0 - h * .62 * w, rx * .3, y0 + h * .44 * w, rx * .88, y0 - h * .07 * w)
      const bottom = () => g.bezierCurveTo(rx * .32, y0 + h * .7 * w, -rx * .32, y0 - h * .38 * w, -rx * .88, y0 + h * .07 * w)
      g.lineCap = 'round'
      soft(size * .08)
      g.beginPath(); g.moveTo(-rx * .88, y0 + h * .02 * w); top()
      g.strokeStyle = `rgba(0, 0, 0, ${.5 * w})`; g.lineWidth = size * .22 * w; g.stroke()
      soft(size * .02)
      g.beginPath(); g.moveTo(-rx * .88, y0 + h * .07 * w); top(); bottom(); g.closePath()
      g.fillStyle = 'rgba(9, 4, 2, .97)'; g.fill()
      // The lit lip on the far side of the crease.
      g.beginPath(); g.moveTo(rx * .86, y0 + h * .02 * w)
      g.bezierCurveTo(rx * .32, y0 + h * .82 * w, -rx * .32, y0 - h * .28 * w, -rx * .86, y0 + h * .15 * w)
      g.strokeStyle = `rgba(214, 170, 122, ${.3 * w})`; g.lineWidth = Math.max(.5, size * .05); g.stroke()
    }
    // Faint roast mottling.
    soft(size * .03)
    let seed = size * 7 + tone * 13 + phase * 3
    const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
    for (let i = 0; i < 6; i++) {
      g.fillStyle = `rgba(${rand() < .5 ? '16, 8, 3' : '150, 104, 66'}, .12)`
      g.beginPath(); g.arc((rand() * 2 - 1) * rx * .75, (rand() * 2 - 1) * h * .7, size * (.04 + rand() * .07), 0, 6.3); g.fill()
    }
    g.restore()
    return c
  })
}

// Screen-space lighting, laid over the rotated albedo with 'source-atop'.
export function light(size, dpr) {
  return memo(`l|${size}|${dpr}`, () => {
    const [c, g] = canvas(size, dpr)
    const r = size, full = r + PAD
    // Shade falling away to the lower right.
    const shade = g.createLinearGradient(-r * .7, -r * .7, r * .75, r * .75)
    shade.addColorStop(0, 'rgba(0, 0, 0, 0)'); shade.addColorStop(.5, 'rgba(0, 0, 0, .06)'); shade.addColorStop(1, 'rgba(0, 0, 0, .7)')
    g.fillStyle = shade; g.fillRect(-full, -full, full * 2, full * 2)
    // Broad warm light from the upper left, then a small soft sheen.
    const key = g.createRadialGradient(-r * .36, -r * .4, 0, -r * .36, -r * .4, r * 1.05)
    key.addColorStop(0, 'rgba(255, 208, 158, .32)'); key.addColorStop(.45, 'rgba(255, 200, 146, .09)'); key.addColorStop(1, 'rgba(255, 206, 150, 0)')
    g.fillStyle = key; g.fillRect(-full, -full, full * 2, full * 2)
    const sheen = g.createRadialGradient(-r * .34, -r * .36, 0, -r * .34, -r * .36, r * .24)
    sheen.addColorStop(0, 'rgba(255, 240, 220, .42)'); sheen.addColorStop(1, 'rgba(255, 242, 222, 0)')
    g.fillStyle = sheen; g.fillRect(-full, -full, full * 2, full * 2)
    // A little bounce light from the screen below.
    const bounce = g.createRadialGradient(r * .5, r * .6, 0, r * .5, r * .6, r * .6)
    bounce.addColorStop(0, 'rgba(224, 186, 128, .16)'); bounce.addColorStop(1, 'rgba(224, 186, 128, 0)')
    g.fillStyle = bounce; g.fillRect(-full, -full, full * 2, full * 2)
    return c
  })
}

// Draw one lit bean, rotated by `a`, centred in a scratch context of side S (device px).
export function compose(sg, S, dpr, a, alb, lig) {
  const half = alb.width / dpr / 2
  sg.globalCompositeOperation = 'source-over'
  sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, S, S)
  sg.setTransform(dpr, 0, 0, dpr, S / 2, S / 2); sg.rotate(a)
  sg.drawImage(alb, -half, -half, half * 2, half * 2)
  sg.globalCompositeOperation = 'source-atop'
  sg.setTransform(dpr, 0, 0, dpr, S / 2, S / 2)
  sg.drawImage(lig, -half, -half, half * 2, half * 2)
}

// A pre-lit, out-of-focus bean for the far and near layers.
export function blurred(size, blur, tone, phase, dpr) {
  return memo(`b|${size}|${blur}|${tone}|${phase}|${dpr}`, () => {
    const alb = albedo(size, tone, phase, dpr), S = alb.width
    const s = document.createElement('canvas'); s.width = s.height = S
    compose(s.getContext('2d'), S, dpr, 0, alb, light(size, dpr))
    const [c, g] = canvas(size, dpr, blur * 3)
    g.filter = `blur(${blur}px)`
    const half = S / dpr / 2
    g.drawImage(s, -half, -half, half * 2, half * 2)
    return c
  })
}

// Soft contact shadow for a bean lying on a surface.
export function shadow(size, dpr) {
  return memo(`s|${size}|${dpr}`, () => {
    const [c, g] = canvas(size, dpr)
    g.scale(1, .34)
    const gr = g.createRadialGradient(0, 0, size * .2, 0, 0, size * 1.15)
    gr.addColorStop(0, 'rgba(0, 0, 0, .6)'); gr.addColorStop(1, 'rgba(0, 0, 0, 0)')
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, size * 1.15, 0, 6.3); g.fill()
    return c
  })
}
