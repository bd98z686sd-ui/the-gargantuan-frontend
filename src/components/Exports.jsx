import { useMemo, useRef, useState } from 'react'

function makeTitle(text) {
  const t = (text || '').trim().replace(/\s+/g,' ')
  if (!t) return 'New Short: Thoughts & Audio'
  const first = t.split(/[.!?\n]/).find(Boolean) || t
  const cap = first.slice(0, 80)
  return cap.charAt(0).toUpperCase() + cap.slice(1)
}
function makeHashtags(text) {
  const words = (text||'').toLowerCase().match(/[a-z0-9]{3,}/g) || []
  const freq = {}
  for (const w of words) freq[w] = (freq[w]||0)+1
  const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([w])=>`#${w}`)
  const base = ['#shorts','#ai','#music','#spokenword'].filter(h=>!top.includes(h))
  return [...top, ...base].slice(0,10).join(' ')
}

export default function Exports(){
  const [input, setInput] = useState('')
  const [bg, setBg] = useState('#052962')
  const [fg, setFg] = useState('#ffffff')
  const [accent, setAccent] = useState('#c70000')
  const [ratio, setRatio] = useState('square') // square|vertical
  const canvasRef = useRef(null)

  const title = useMemo(()=> makeTitle(input), [input])
  const tags = useMemo(()=> makeHashtags(input), [input])

  function draw(){
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = ratio==='square' ? 1080 : 1080
    const H = ratio==='square' ? 1080 : 1920
    canvas.width = W; canvas.height = H

    // background
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H)

    // accent bar
    ctx.fillStyle = accent; ctx.fillRect(0, H-16, W, 16)

    // title
    ctx.fillStyle = fg
    ctx.font = "bold 72px Georgia, 'Times New Roman', serif"
    wrapText(ctx, title, 80, 200, W-160, 86)

    // subtitle/hashtags
    ctx.font = "28px Inter, system-ui, sans-serif"
    wrapText(ctx, tags, 80, H-200, W-160, 36)
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ')
    let line = ''
    for (let n=0; n<words.length; n++){
      const test = line + words[n] + ' '
      const m = ctx.measureText(test).width
      if (m > maxWidth && n>0){
        ctx.fillText(line, x, y)
        line = words[n] + ' '
        y += lineHeight
      } else line = test
    }
    ctx.fillText(line, x, y)
  }

  function download(){
    draw()
    const url = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = ratio==='square' ? 'export-square.png' : 'export-vertical.png'
    a.click()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="font-display text-3xl mb-4">Exports</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block">
            <div className="text-sm font-semibold mb-1">Input text (transcript, idea, or caption)</div>
            <textarea className="w-full border p-3 h-40" value={input} onChange={e=>setInput(e.target.value)} placeholder="Paste transcript or caption..."></textarea>
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block text-sm">BG
              <input type="color" className="block w-full h-10 border" value={bg} onChange={e=>setBg(e.target.value)} />
            </label>
            <label className="block text-sm">FG
              <input type="color" className="block w-full h-10 border" value={fg} onChange={e=>setFg(e.target.value)} />
            </label>
            <label className="block text-sm">Accent
              <input type="color" className="block w-full h-10 border" value={accent} onChange={e=>setAccent(e.target.value)} />
            </label>
          </div>

          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2"><input type="radio" name="ratio" checked={ratio==='square'} onChange={()=>setRatio('square')} /> Square</label>
            <label className="flex items-center gap-2"><input type="radio" name="ratio" checked={ratio==='vertical'} onChange={()=>setRatio('vertical')} /> Vertical</label>
          </div>

          <div className="space-y-2">
            <div><span className="font-semibold">Suggested title:</span> {title}</div>
            <div><span className="font-semibold">Hashtags:</span> {tags}</div>
          </div>

          <button className="px-4 py-2 bg-guardian-blue text-white" onClick={download}>Download render</button>
        </div>

        <div>
          <canvas ref={canvasRef} className="w-full border aspect-square md:aspect-auto" style={{height: ratio==='square' ? '540px':'960px'}}></canvas>
        </div>
      </div>
    </div>
  )
}
