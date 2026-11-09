// Draws one roasted coffee bean to an offscreen canvas. `back` is the smooth
// domed side; the front has the crease. Three roast tones.
const TONES = [
  ['#a8744a', '#6b4326', '#3a2111', '#170c05'],
  ['#8e5f39', '#54321b', '#2c180b', '#100803'],
  ['#b98552', '#7b5130', '#49301a', '#1e1108'],
]
const cache = new Map()

export function beanSprite(size, blur, back, dpr, tone = 0) {
  const key = [size, blur, back, dpr, tone].join('|')
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  const pad = 4 + blur * 3
  c.width = c.height = Math.ceil((size * 2 + pad * 2) * dpr)
  const g = c.getContext('2d')
  g.scale(dpr, dpr)
  g.translate(size + pad, size + pad)
  const rx = size, ry = size * .66, T = TONES[tone % TONES.length]
  const soft = (px) => { g.filter = blur + px > 0 ? `blur(${blur + px}px)` : 'none' }
  // Slightly egg-shaped outline: fuller at one end, like a real bean.
  const body = () => {
    g.beginPath()
    g.moveTo(-rx, 0)
    g.bezierCurveTo(-rx, -ry * 1.16, -rx * .15, -ry * 1.1, rx * .4, -ry * .9)
    g.bezierCurveTo(rx * .86, -ry * .74, rx * 1.02, -ry * .3, rx, 0)
    g.bezierCurveTo(rx * 1.02, ry * .3, rx * .86, ry * .74, rx * .4, ry * .9)
    g.bezierCurveTo(-rx * .15, ry * 1.1, -rx, ry * 1.16, -rx, 0)
    g.closePath()
  }
  const blob = (x, y, w, h, rot, color) => {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, h / w)
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, w)
    gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(255, 220, 170, 0)')
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, w, 0, Math.PI * 2); g.fill(); g.restore()
  }

  // Body, lit from the top left.
  soft(0)
  const fill = g.createRadialGradient(-rx * .38, -ry * .55, ry * .05, -rx * .1, -ry * .1, rx * 1.35)
  fill.addColorStop(0, T[0]); fill.addColorStop(.32, T[1]); fill.addColorStop(.7, T[2]); fill.addColorStop(1, T[3])
  body(); g.fillStyle = fill; g.fill()
  g.save(); body(); g.clip()

  // Darker towards the rim so it reads as round.
  soft(size * .09)
  body(); g.strokeStyle = 'rgba(8, 4, 1, .6)'; g.lineWidth = size * .3; g.stroke()

  if (back) {
    // Smooth dome: one broad sheen along its length.
    blob(-rx * .12, -ry * .2, rx * .8, ry * .42, -.12, 'rgba(255, 222, 176, .3)')
  } else {
    // The two halves bulge either side of the crease.
    blob(-rx * .22, -ry * .5, rx * .62, ry * .3, -.2, 'rgba(255, 224, 180, .3)')
    blob(rx * .22, ry * .52, rx * .55, ry * .24, -.2, 'rgba(255, 212, 164, .13)')
    // The crease: a dark lens that widens in the middle, with a soft shadow above and a lit lip below.
    const top = () => g.bezierCurveTo(-rx * .3, -ry * .66, rx * .3, ry * .46, rx * .88, -ry * .06)
    const bottom = () => g.bezierCurveTo(rx * .32, ry * .74, -rx * .32, -ry * .4, -rx * .88, ry * .06)
    soft(size * .07)
    g.beginPath(); g.moveTo(-rx * .88, ry * .0); top()
    g.strokeStyle = 'rgba(0, 0, 0, .5)'; g.lineWidth = size * .2; g.lineCap = 'round'; g.stroke()
    soft(size * .015)
    g.beginPath(); g.moveTo(-rx * .88, ry * .06); top(); bottom(); g.closePath()
    g.fillStyle = 'rgba(10, 5, 2, .97)'; g.fill()
    g.beginPath(); g.moveTo(rx * .86, ry * .02); g.bezierCurveTo(rx * .32, ry * .84, -rx * .32, -ry * .3, -rx * .86, ry * .14)
    g.strokeStyle = 'rgba(255, 214, 160, .26)'; g.lineWidth = Math.max(.5, size * .045); g.stroke()
  }

  // Warm rim light from below right (the screen's glow), then an oily specular streak.
  soft(size * .05)
  g.beginPath(); g.ellipse(0, 0, rx * .94, ry * .92, 0, .15, 1.35)
  g.strokeStyle = 'rgba(232, 196, 136, .32)'; g.lineWidth = size * .09; g.lineCap = 'round'; g.stroke()
  soft(size * .04)
  g.save(); g.translate(-rx * .36, -ry * .62); g.rotate(-.32)
  g.beginPath(); g.ellipse(0, 0, rx * .27, ry * .07, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(255, 246, 228, .62)'; g.fill(); g.restore()

  // A few roast speckles.
  soft(0)
  let seed = size * 7 + tone * 13 + (back ? 5 : 0)
  const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  g.fillStyle = 'rgba(18, 9, 3, .15)'
  for (let i = 0; i < 7; i++) { g.beginPath(); g.arc((rand() * 2 - 1) * rx * .8, (rand() * 2 - 1) * ry * .7, size * (.015 + rand() * .03), 0, 6.3); g.fill() }
  g.restore()
  cache.set(key, c)
  return c
}
