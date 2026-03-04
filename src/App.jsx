import { useState, useRef, useEffect } from 'react'
import {
  DEMO_SPEC, MOCK_ANALYSIS, MOCK_TEST_CASES, MOCK_BUG, COVERAGE_DATA
} from './data/mockData'

// ─── CLAUDE API (optional live mode) ─────────────────────────────────────────
async function callClaude(apiKey, system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 8000,
      system, messages: [{ role: 'user', content: user }]
    })
  })
  const d = await res.json()
  if (d.error) throw new Error(d.error.message)
  return d.content?.map(i => i.text || '').join('') || ''
}

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json\n?|```\n?/g, '').trim()) }
  catch { const m = raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/); if (m) return JSON.parse(m[1]); throw new Error('Parse failed') }
}

// ─── PROMPTS ──────────────────────────────────────────────────────────────────
const ANALYSIS_SYS = `You are the world's best QA lead for slot games. Analyse this spec and return JSON only:
{"featureSummary":"...","detectedFeatures":[],"detectedAssets":[],"hasAnimations":true,"hasSoundDesign":false,"hasNetworkDependency":true,"hasEOSConfig":true,"platforms":[],"suggestedTestTypes":[{"type":"...","reason":"...","estimatedCases":0}],"clarifyingQuestions":[],"riskAreas":[]}`

const GENERATE_SYS = `You are the world's best QA engineer for slot games. THE PIZZA RULE: never just check 'was it delivered' — right pizza? right slices? box opens? sauce? not spilled? edible? Apply this to every test. Return ONLY a JSON array of test cases:
[{"folder":"...","id":"TC_001","priority":"P1","type":"Functional","testingMode":"Manual","name":"...","description":"...","precondition":"...","steps":["1. Launch the game on the test device","2. Dismiss any MOTD/pop-ups","3. Wait for full load..."],"expectedResult":"...","negativeScenario":"...","linkedBugRisk":"..."}]`

const BUG_SYS = `You are a senior QA engineer for slot games. Generate a formal bug report AND check for test gaps. Return ONLY JSON:
{"bugReport":{"bugId":"BUG_001","title":"...","severity":"High","priority":"P2","component":"...","environment":"...","summary":"...","stepsToReproduce":[],"actualResult":"...","expectedResult":"...","frequency":"...","workaround":null,"rootCauseSuspicion":"...","attachmentsNeeded":"..."},"testCaseGap":{"detected":true,"gapExplanation":"...","suggestedTC":{"folder":"...","id":"TC_GAP_001","name":"...","priority":"P1","type":"...","description":"...","steps":[],"expectedResult":"...","negativeScenario":"..."}}}`

// ─── STYLES ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#08090e', panel: '#0d0f18', border: '#1a1d2e', text: '#d4d8e2',
  muted: '#5a6070', accent: '#e8b44e', accentDim: '#2a2010',
  green: '#4ade80', greenDim: '#052e16', red: '#f87171', redDim: '#1c0606',
  blue: '#60a5fa', blueDim: '#0c1830', purple: '#c084fc', purpleDim: '#1a0a2e',
  teal: '#2dd4bf', tealDim: '#042320'
}

const F = "'DM Mono', 'Courier New', monospace"
const TITLE = "'Syne', sans-serif"

const btn = (bg, c = '#fff') => ({
  background: bg, color: c, border: 'none', borderRadius: 6,
  padding: '9px 18px', cursor: 'pointer', fontFamily: F,
  fontSize: 12, fontWeight: 500, transition: 'opacity .15s',
  letterSpacing: '.5px'
})

const ghost = {
  background: 'transparent', color: C.muted, border: `1px solid ${C.border}`,
  borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontFamily: F, fontSize: 12
}

const inp = {
  width: '100%', background: '#0a0c14', border: `1px solid ${C.border}`,
  borderRadius: 6, color: C.text, padding: '9px 12px', fontFamily: F,
  fontSize: 12, boxSizing: 'border-box', outline: 'none'
}

const ta = (h) => ({
  ...inp, height: h || 160, resize: 'vertical'
})

const card = (accent) => ({
  background: C.panel, border: `1px solid ${accent || C.border}`,
  borderRadius: 10, padding: 20, marginBottom: 14
})

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

function Tag({ text, color = C.accent }) {
  return (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}44`,
      borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700,
      letterSpacing: '.5px', display: 'inline-block'
    }}>{text}</span>
  )
}

function PriBadge({ p }) {
  const c = p === 'P1' ? C.red : p === 'P2' ? C.accent : C.green
  return <Tag text={p} color={c} />
}

function Stat({ label, val, color = C.accent }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${color}33`, borderRadius: 8, padding: '12px 16px', textAlign: 'center', flex: 1, minWidth: 90 }}>
      <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: TITLE }}>{val}</div>
      <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginTop: 2 }}>{label}</div>
    </div>
  )
}

function Loader({ msg }) {
  const [dots, setDots] = useState('')
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 36, marginBottom: 16, animation: 'spin 2s linear infinite', display: 'inline-block' }}>⚙</div>
      <div style={{ fontSize: 13, color: C.accent }}>{msg}{dots}</div>
    </div>
  )
}

function TCCard({ tc }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: C.panel, border: `1px solid ${open ? '#2a2d3e' : C.border}`, borderRadius: 8, marginBottom: 6, overflow: 'hidden', cursor: 'pointer' }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 9, color: C.muted, minWidth: 50, fontFamily: F }}>{tc.id}</span>
        <PriBadge p={tc.priority} />
        <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{tc.name}</span>
        <Tag text={tc.type} color={C.blue} />
        <span style={{ color: C.muted, fontSize: 12, marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '4px 14px 16px', borderTop: `1px solid ${C.border}` }}>
          <DRow label="Description" val={tc.description} />
          <DRow label="Precondition" val={tc.precondition} />
          <DRow label="Steps" val={tc.steps.join('\n')} mono />
          <DRow label="Expected Result" val={tc.expectedResult} highlight />
          {tc.negativeScenario && <DRow label="⚠ What Wrong Looks Like" val={tc.negativeScenario} warn />}
          {tc.linkedBugRisk && <DRow label="🐛 Designed to Catch" val={tc.linkedBugRisk} />}
        </div>
      )}
    </div>
  )
}

function DRow({ label, val, mono, highlight, warn }) {
  if (!val) return null
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: warn ? C.accent : highlight ? C.green : C.muted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 11, color: highlight ? '#7ee787' : warn ? C.accent : C.muted, fontFamily: mono ? F : 'inherit', background: mono ? '#0a0c14' : 'transparent', padding: mono ? '8px 10px' : 0, borderRadius: mono ? 5 : 0, whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>{val}</div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home') // home | demo | live
  const [apiKey, setApiKey] = useState('')
  const [liveMode, setLiveMode] = useState(false)

  // demo state
  const [step, setStep] = useState('input') // input | analysed | configure | generating | suite | bug | coverage
  const [specText, setSpecText] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [selectedTypes, setSelectedTypes] = useState([])
  const [answers, setAnswers] = useState({})
  const [cases, setCases] = useState([])
  const [activeFolder, setActiveFolder] = useState(null)
  const [search, setSearch] = useState('')
  const [bugInput, setBugInput] = useState('')
  const [bugResult, setBugResult] = useState(null)
  const [gap, setGap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const [modInput, setModInput] = useState('')
  const fileRef = useRef()

  // CSV export
  function exportCSV() {
    const h = ['Folder','ID','Name','Mode','Priority','Type','Description','Precondition','Steps','Expected Result','Negative Scenario','Linked Bug Risk']
    const rows = cases.map(tc => [tc.folder,tc.id,tc.name,tc.testingMode||'Manual',tc.priority,tc.type,tc.description,tc.precondition,(tc.steps||[]).join(' | '),tc.expectedResult,tc.negativeScenario||'',tc.linkedBugRisk||''])
    const csv = [h,...rows].map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n')
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv],{type:'text/csv'})), download: 'QAForge_TestSuite.csv' })
    a.click()
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

  async function runAnalysis() {
    setLoading(true); setLoadMsg('Analysing spec document')
    await sleep(liveMode ? 0 : 1800)
    if (liveMode && apiKey) {
      try {
        const raw = await callClaude(apiKey, ANALYSIS_SYS, `SPEC:\n${specText}`)
        setAnalysis(parseJSON(raw))
      } catch (e) { alert('API error: ' + e.message); setLoading(false); return }
    } else {
      setAnalysis(MOCK_ANALYSIS)
    }
    setSelectedTypes((liveMode && apiKey ? analysis : MOCK_ANALYSIS)?.suggestedTestTypes?.map(t => t.type) || MOCK_ANALYSIS.suggestedTestTypes.map(t => t.type))
    setStep('analysed'); setLoading(false)
  }

  // Fix: set selectedTypes from MOCK_ANALYSIS after setting analysis
  useEffect(() => {
    if (analysis) setSelectedTypes(analysis.suggestedTestTypes.map(t => t.type))
  }, [analysis])

  async function generate() {
    setStep('generating'); setLoading(true)
    if (liveMode && apiKey) {
      setLoadMsg('Generating test cases via Claude API')
      try {
        const raw = await callClaude(apiKey, GENERATE_SYS,
      `SPEC:\n${specText}\nTYPES: ${selectedTypes.join(', ')}\nCONTEXT: ${Object.entries(answers).map(([q,a])=>`Q:${q}\nA:${a}`).join('\n')}`)
        const parsed = parseJSON(raw)
        setCases(parsed.map((tc,i) => ({...tc, id:`TC_${String(i+1).padStart(3,'0')}`})))
      } catch (e) { alert('API error: ' + e.message); setStep('analysed'); setLoading(false); return }
    } else {
      setLoadMsg('Generating complete test suite')
      await sleep(2400)
      setCases(MOCK_TEST_CASES)
    }
    setStep('suite'); setLoading(false)
  }

  async function writeBug() {
    if (!bugInput.trim()) return
    setLoading(true); setLoadMsg('Writing bug report + gap check')
    await sleep(liveMode && apiKey ? 0 : 1600)
    if (liveMode && apiKey) {
      try {
        const raw = await callClaude(apiKey, BUG_SYS, `BUG:\n${bugInput}\nSUITE:\n${JSON.stringify(cases.slice(0,20).map(t=>({id:t.id,name:t.name})))}`)
        const r = parseJSON(raw)
        setBugResult(r.bugReport)
        if (r.testCaseGap?.detected) setGap(r.testCaseGap)
      } catch (e) { alert('API error: ' + e.message) }
    } else {
      setBugResult(MOCK_BUG)
      setGap({ detected: true, gapExplanation: MOCK_BUG.gapExplanation, suggestedTC: MOCK_BUG.suggestedTC })
    }
    setLoading(false)
  }

  function acceptGap() {
    if (!gap?.suggestedTC) return
    setCases(p => [...p, { ...gap.suggestedTC, testingMode: 'Manual', id: `TC_${String(p.length + 1).padStart(3,'0')}` }])
    setGap(null)
  }

  const folders = [...new Set(cases.map(tc => tc.folder))]
  const filtered = cases.filter(tc => {
    const inF = !activeFolder || tc.folder === activeFolder
    const inS = !search || tc.name.toLowerCase().includes(search.toLowerCase())
    return inF && inS
  })

  // ─── HOME ──────────────────────────────────────────────────────────────────
  if (page === 'home') return (
    <div style={{ fontFamily: F, background: C.bg, minHeight: '100vh', color: C.text }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .hover-lift:hover { transform: translateY(-2px); opacity: .85; }
        .hover-lift { transition: transform .2s, opacity .15s; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', padding: '18px 40px', borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: TITLE, fontSize: 20, fontWeight: 800, color: C.accent, letterSpacing: 1 }}>QA FORGE</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="https://github.com/YOUR-USERNAME/qa-forge" target="_blank" rel="noreferrer" style={{ color: C.muted, fontSize: 12, textDecoration: 'none' }}>GitHub →</a>
          <button onClick={() => setPage('demo')} className="hover-lift" style={btn(C.accent, C.bg)}>Try Demo</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 40px 60px', animation: 'fadeUp .6s ease' }}>
        <div style={{ fontSize: 11, color: C.accent, letterSpacing: 4, marginBottom: 16, textTransform: 'uppercase' }}>Intelligent QA Workbench · Slot Game Edition</div>
        <h1 style={{ fontFamily: TITLE, fontSize: 56, fontWeight: 800, color: '#f0f4ff', lineHeight: 1.1, marginBottom: 24 }}>
          From spec to complete<br />
          <span style={{ color: C.accent }}>test suite in minutes.</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, maxWidth: 620, marginBottom: 40 }}>
          Upload your feature spec. QA Forge reads it like your best QA engineer — asking the right questions, detecting every risk, and writing test cases that cover what most teams never get around to.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button onClick={() => setPage('demo')} className="hover-lift" style={{ ...btn(C.accent, C.bg), padding: '13px 32px', fontSize: 14, fontWeight: 700 }}>
            ⚡ Try Interactive Demo
          </button>
          <button onClick={() => { setPage('demo'); setLiveMode(true) }} className="hover-lift" style={{ ...ghost, padding: '12px 28px', fontSize: 13 }}>
            Use Your Own API Key →
          </button>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          {[
            { icon: '📋', title: 'Spec Analysis in Seconds', desc: 'Upload PDF, Word, or text. QA Forge reads the spec, detects features, animations, EOS config, and asks the clarifying questions your PM forgot to answer.' },
            { icon: '🧪', title: '13 Test Type Categories', desc: 'Not just functional tests. Negative, spam, queue priority, EOS config, edge case, regression, vertical machine — all generated automatically.' },
            { icon: '⚠️', title: '"What Wrong Looks Like"', desc: 'Every test case includes a Negative Scenario field — telling your QA exactly what a broken implementation looks like, not just what success is.' },
            { icon: '🐛', title: 'Bug Writer + Gap Detection', desc: 'Write a bug in plain language. Get a formal report. Automatically checks if the bug reveals a missing test case and offers to add it to your suite.' },
            { icon: '📊', title: 'Coverage Dashboard', desc: 'Live view of P1/P2/P3 breakdown, coverage percentage, risk hotspots, and estimated QA days. Real answers for release readiness questions.' },
            { icon: '⬇️', title: 'Export Everywhere', desc: 'CSV, JSON, XML, JIRA-ready, TestRail-ready. One click. Your test suite in whatever format your tools need.' },
          ].map((f, i) => (
            <div key={i} className="hover-lift" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 22 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', marginBottom: 8, fontFamily: TITLE }}>{f.title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BEFORE/AFTER */}
      <div style={{ background: C.panel, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '48px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontFamily: TITLE, fontSize: 28, fontWeight: 800, color: '#f0f4ff' }}>The difference it makes</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { label: 'Before QA Forge', color: C.red, items: ['3–5 days writing test cases per feature', 'Only happy path and basic UI tested', 'Spec gaps discovered during testing', 'Bug reports inconsistent and incomplete', 'Coverage is unknown until someone counts', 'QA time spent writing instead of testing'] },
              { label: 'After QA Forge', color: C.green, items: ['Complete test suite ready in under 1 hour', '13 test categories as standard', 'Clarifying questions surface gaps upfront', 'Formal bug report in under 5 minutes', 'Live coverage dashboard at all times', 'QA time spent on testing, judgment, observation'] },
            ].map((col, i) => (
              <div key={i} style={{ background: C.bg, border: `1px solid ${col.color}33`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: col.color, marginBottom: 14 }}>{col.label}</div>
                {col.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <span style={{ color: col.color, minWidth: 14 }}>{i === 0 ? '✗' : '✓'}</span>
                    <span style={{ fontSize: 12, color: C.muted }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ fontFamily: TITLE, fontSize: 24, fontWeight: 800, color: '#f0f4ff', marginBottom: 12 }}>Ready to see it in action?</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Try the interactive demo with a real slot game feature spec — no setup required.</div>
        <button onClick={() => setPage('demo')} className="hover-lift" style={{ ...btn(C.accent, C.bg), padding: '14px 40px', fontSize: 15, fontWeight: 700 }}>Launch Interactive Demo ⚡</button>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, padding: '20px 40px', textAlign: 'center', fontSize: 11, color: C.muted }}>
        QA Forge · Built for slot game QA teams · <a href="https://github.com/YOUR-USERNAME/qa-forge" style={{ color: C.accent, textDecoration: 'none' }}>GitHub</a>
      </div>
    </div>
  )

  // ─── DEMO APP ──────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: F, background: C.bg, minHeight: '100vh', color: C.text }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        details summary::-webkit-details-marker { display:none; }
      `}</style>

      {/* APP HEADER */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', height: 52, gap: 14, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => setPage('home')} style={{ ...ghost, padding: '5px 10px', fontSize: 11 }}>← Home</button>
        <span style={{ fontFamily: TITLE, fontSize: 16, fontWeight: 800, color: C.accent }}>QA FORGE</span>
        <div style={{ fontSize: 10, color: C.muted, background: liveMode ? C.greenDim : C.accentDim, border: `1px solid ${liveMode ? C.green : C.accent}44`, borderRadius: 12, padding: '3px 10px' }}>
          {liveMode && apiKey ? '🟢 Live AI Mode' : '🟡 Demo Mode'}
        </div>

        {/* API key toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {!apiKey ? (
            <>
              <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-... (optional, for live AI)" style={{ ...inp, width: 240, height: 32, fontSize: 11, padding: '6px 10px' }} />
              <button onClick={() => setLiveMode(!!apiKey)} style={{ ...btn('#1a2a1a', C.green), padding: '6px 12px', fontSize: 11, border: `1px solid ${C.green}44` }}>Enable Live</button>
            </>
          ) : (
            <>
              <span style={{ fontSize: 11, color: C.green }}>✓ API key set</span>
              <button onClick={() => { setApiKey(''); setLiveMode(false) }} style={{ ...ghost, padding: '5px 10px', fontSize: 11 }}>Clear</button>
            </>
          )}
        </div>
      </div>

      {/* STEP TABS */}
      <div style={{ display: 'flex', gap: 2, padding: '12px 24px 0', borderBottom: `1px solid ${C.border}` }}>
        {[
          { id: 'input', label: '1 Spec Input', always: true },
          { id: 'analysed', label: '2 Analysis', show: ['analysed','configure','generating','suite','bug','coverage'] },
          { id: 'suite', label: `3 Test Suite${cases.length ? ` (${cases.length})` : ''}`, show: ['suite','bug','coverage'] },
          { id: 'bug', label: '4 Bug Writer', show: ['suite','bug','coverage'] },
          { id: 'coverage', label: '5 Coverage', show: ['suite','bug','coverage'] },
        ].map(t => {
          const visible = t.always || (t.show && t.show.includes(step))
          if (!visible) return null
          const active = step === t.id || (t.id === 'analysed' && step === 'configure')
          return (
            <button key={t.id} onClick={() => visible && setStep(t.id)}
              style={{ padding: '8px 16px', border: 'none', background: active ? '#1a1d2e' : 'transparent', color: active ? C.text : C.muted, cursor: 'pointer', fontFamily: F, fontSize: 11, borderRadius: '6px 6px 0 0', letterSpacing: '.5px', borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent' }}>
              {t.label}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '24px', maxWidth: 1100 }}>

        {/* ── STEP 1: INPUT ── */}
        {(step === 'input') && (
          <div style={{ maxWidth: 800, animation: 'fadeUp .4s ease' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: TITLE, fontSize: 22, fontWeight: 800, color: '#f0f4ff', marginBottom: 4 }}>Upload Your Spec</div>
              <div style={{ fontSize: 12, color: C.muted }}>Paste your own feature spec, or load the generic slot game demo spec below.</div>
            </div>

            {/* Demo banner */}
            <div style={{ background: C.accentDim, border: `1px solid ${C.accent}44`, borderRadius: 8, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 3 }}>🎰 Demo Spec — Player Level Up Flow Redesign</div>
                <div style={{ fontSize: 11, color: C.muted }}>Generic slot game feature spec — notification system redesign, config variables, queue logic, edge cases.</div>
              </div>
              <button onClick={() => setSpecText(DEMO_SPEC)} style={{ ...btn(C.accent, C.bg), whiteSpace: 'nowrap' }}>Load Demo Spec</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>SPEC DOCUMENT</div>
              <textarea value={specText} onChange={e => setSpecText(e.target.value)} style={ta(220)} placeholder="Paste your feature spec here..." />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => fileRef.current.click()} style={ghost}>📄 Upload .txt / .md</button>
                <input ref={fileRef} type="file" accept=".txt,.md" style={{ display: 'none' }} onChange={e => { const r = new FileReader(); r.onload = ev => setSpecText(ev.target.result); r.readAsText(e.target.files[0]) }} />
              </div>
            </div>

            <button onClick={runAnalysis} disabled={loading || !specText.trim()} style={{ ...btn(C.accent, C.bg), width: '100%', padding: 12, fontSize: 14, fontWeight: 700, opacity: !specText.trim() || loading ? .4 : 1 }}>
              {loading ? '⚙ Analysing...' : '⚡ Analyse Spec & Detect All Test Types →'}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && <Loader msg={loadMsg} />}

        {/* ── STEP 2: ANALYSIS ── */}
        {step === 'analysed' && !loading && analysis && (
          <div style={{ maxWidth: 960, animation: 'fadeUp .4s ease' }}>
            <div style={{ fontFamily: TITLE, fontSize: 20, fontWeight: 800, color: '#f0f4ff', marginBottom: 4 }}>Spec Analysis Complete</div>
            <div style={{ fontSize: 12, color: C.green, marginBottom: 20 }}>✓ {analysis.featureSummary}</div>

            {/* Signals */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {[analysis.hasAnimations && ['✨ Animations', C.blue], analysis.hasSoundDesign && ['🔊 Sound', C.purple], analysis.hasNetworkDependency && ['🌐 Network', C.teal], analysis.hasEOSConfig && ['🧪 EOS Config', C.accent], ...(analysis.platforms || []).map(p => [`📱 ${p}`, C.green])].filter(Boolean).map(([l, c], i) => <Tag key={i} text={l} color={c} />)}
            </div>

            {/* Risk areas */}
            <div style={card(C.accent + '44')}>
              <div style={{ fontSize: 10, color: C.accent, letterSpacing: 2, marginBottom: 10 }}>⚠ HIGH RISK AREAS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(analysis.riskAreas || []).map((r, i) => <Tag key={i} text={r} color={C.accent} />)}
              </div>
            </div>

            {/* Test type selection */}
            <div style={card()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2 }}>SELECT TEST TYPES TO GENERATE</div>
                <div style={{ fontSize: 11, color: C.muted }}>{selectedTypes.length} selected · ~{(analysis.suggestedTestTypes || []).filter(t => selectedTypes.includes(t.type)).reduce((s, t) => s + (t.estimatedCases || 0), 0)} cases</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(analysis.suggestedTestTypes || []).map((t, i) => {
                  const sel = selectedTypes.includes(t.type)
                  return (
                    <div key={i} onClick={() => setSelectedTypes(p => sel ? p.filter(x => x !== t.type) : [...p, t.type])}
                      style={{ padding: '10px 12px', border: `1px solid ${sel ? C.accent : C.border}`, background: sel ? C.accentDim : 'transparent', borderRadius: 8, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: sel ? C.accent : C.muted }}>{sel ? '✓ ' : ''}{t.type}</span>
                        <span style={{ fontSize: 10, color: C.muted }}>~{t.estimatedCases}</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.muted }}>{t.reason}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Clarifying Qs */}
            {(analysis.clarifyingQuestions || []).length > 0 && (
              <div style={card()}>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>💡 CLARIFYING QUESTIONS (optional)</div>
                {(analysis.clarifyingQuestions || []).map((q, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: C.text, marginBottom: 5 }}>{i + 1}. {q}</div>
                    <input value={answers[q] || ''} onChange={e => setAnswers(p => ({ ...p, [q]: e.target.value }))} placeholder="Answer (optional)..." style={inp} />
                  </div>
                ))}
              </div>
            )}

            <button onClick={generate} disabled={selectedTypes.length === 0} style={{ ...btn(C.green, C.bg), width: '100%', padding: 13, fontSize: 14, fontWeight: 700, opacity: selectedTypes.length === 0 ? .4 : 1 }}>
              🚀 Generate {selectedTypes.length} Test Type{selectedTypes.length !== 1 ? 's' : ''} →
            </button>
          </div>
        )}

        {/* ── STEP 3: SUITE ── */}
        {step === 'suite' && !loading && cases.length > 0 && (
          <div style={{ animation: 'fadeUp .4s ease' }}>
            {/* Gap notification */}
            {gap && (
              <div style={{ background: C.blueDim, border: `1px solid ${C.blue}44`, borderRadius: 8, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 4 }}>⚠ Test Coverage Gap Detected</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{gap.gapExplanation}</div>
                  <div style={{ fontSize: 11, color: C.text }}>Suggested: <strong>{gap.suggestedTC?.name}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={acceptGap} style={btn(C.green)}>+ Add to Suite</button>
                  <button onClick={() => setGap(null)} style={ghost}>Dismiss</button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <Stat label="Total Cases" val={cases.length} color={C.blue} />
              <Stat label="P1 Critical" val={cases.filter(t => t.priority === 'P1').length} color={C.red} />
              <Stat label="P2 High" val={cases.filter(t => t.priority === 'P2').length} color={C.accent} />
              <Stat label="P3 Normal" val={cases.filter(t => t.priority === 'P3').length} color={C.green} />
              <Stat label="Folders" val={folders.length} color={C.purple} />
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..." style={{ ...inp, width: 180 }} />
              <select value={activeFolder || ''} onChange={e => setActiveFolder(e.target.value || null)} style={{ ...inp, width: 220 }}>
                <option value="">All Folders</option>
                {folders.map(f => <option key={f} value={f}>{f} ({cases.filter(c => c.folder === f).length})</option>)}
              </select>
              <button onClick={exportCSV} style={btn(C.green)}>⬇ Export CSV</button>
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input value={modInput} onChange={e => setModInput(e.target.value)} placeholder='Modify: e.g. "Add more spam tests for RTL dialog"' style={{ ...inp, flex: 1 }} />
                <button onClick={async () => {
                  if (!modInput.trim() || !liveMode || !apiKey) return
                  setLoading(true); setLoadMsg('Modifying suite')
                  try {
                    const raw = await callClaude(apiKey, GENERATE_SYS + '\nModify existing suite per instructions.',
                      `SUITE:\n${JSON.stringify(cases)}\nMOD:\n${modInput}`)
                    const u = parseJSON(raw)
                    setCases(u.map((tc, i) => ({ ...tc, id: `TC_${String(i + 1).padStart(3, '0')}` })))
                    setModInput('')
                  } catch (e) { alert('Modification requires live API mode') }
                  setLoading(false)
                }} style={{ ...btn(C.purple), opacity: !liveMode || !apiKey ? .4 : 1 }}>✏ Modify</button>
              </div>
            </div>

            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>{filtered.length} case{filtered.length !== 1 ? 's' : ''}{activeFolder ? ` in "${activeFolder}"` : ''}</div>
            {filtered.map((tc, i) => <TCCard key={i} tc={tc} />)}
          </div>
        )}

        {/* ── STEP 4: BUG WRITER ── */}
        {step === 'bug' && !loading && (
          <div style={{ maxWidth: 960, animation: 'fadeUp .4s ease' }}>
            <div style={{ fontFamily: TITLE, fontSize: 20, fontWeight: 800, color: '#f0f4ff', marginBottom: 4 }}>Bug Report Writer</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Describe a bug in plain language. QA Forge writes the formal report and checks if it reveals a missing test case.</div>

            {gap && (
              <div style={{ background: '#1a100a', border: `1px solid ${C.accent}55`, borderRadius: 8, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 4 }}>🔍 Test Coverage Gap Found</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{gap.gapExplanation}</div>
                  <div style={{ fontSize: 11, color: C.text }}>Suggested test: <strong>{gap.suggestedTC?.name}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { acceptGap(); setStep('suite') }} style={btn(C.green)}>+ Add to Suite</button>
                  <button onClick={() => setGap(null)} style={ghost}>Dismiss</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>DESCRIBE THE BUG</div>
                <textarea value={bugInput} onChange={e => setBugInput(e.target.value)} style={ta(200)} placeholder="E.g: On iOS build 3.8.0, the max bet toaster appears top of screen instead of near the bet selector. Happens 100% of the time on iPhone 14 Pro." />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={writeBug} disabled={!bugInput.trim() || loading} style={{ ...btn(C.red), flex: 1, padding: 11, opacity: !bugInput.trim() ? .4 : 1 }}>
                    🐛 Generate Bug Report + Gap Check
                  </button>
                  <button onClick={() => setBugInput('On iOS build 3.8.0, the max bet toaster appears at the top of the screen instead of adjacent to the bet selector in the bottom area. Happens 100% of the time when levelling up with a max bet increase on iPhone 14 Pro.')} style={ghost}>Load Demo Bug</button>
                </div>
              </div>

              {bugResult && (
                <div style={{ background: C.panel, border: `1px solid ${C.red}33`, borderRadius: 8, padding: 16, overflowY: 'auto', maxHeight: 440 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: C.red, fontSize: 13 }}>🐛 {bugResult.bugId}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <PriBadge p={bugResult.priority} />
                      <Tag text={bugResult.severity} color={C.red} />
                    </div>
                  </div>
                  {Object.entries(bugResult).filter(([k]) => !['bugId','priority','severity','testCaseGap','gapExplanation','suggestedTC'].includes(k)).map(([k, v]) => (
                    <div key={k} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>{k.replace(/([A-Z])/g, ' $1')}</div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{Array.isArray(v) ? v.join('\n') : String(v || '')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 5: COVERAGE ── */}
        {step === 'coverage' && !loading && (
          <div style={{ maxWidth: 900, animation: 'fadeUp .4s ease' }}>
            <div style={{ fontFamily: TITLE, fontSize: 20, fontWeight: 800, color: '#f0f4ff', marginBottom: 4 }}>Coverage Dashboard</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>Release readiness at a glance.</div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
              <Stat label="Total Cases" val={COVERAGE_DATA.totalCases} color={C.blue} />
              <Stat label="P1 Critical" val={COVERAGE_DATA.p1} color={C.red} />
              <Stat label="Coverage %" val={`${COVERAGE_DATA.coveragePct}%`} color={C.green} />
              <Stat label="QA Days Est." val={COVERAGE_DATA.estimatedDays} color={C.accent} />
              <Stat label="Gap Alerts" val={COVERAGE_DATA.gapAlerts} color={C.accent} />
            </div>

            {/* Release readiness */}
            <div style={{ background: COVERAGE_DATA.coveragePct >= 85 ? C.greenDim : C.accentDim, border: `1px solid ${COVERAGE_DATA.coveragePct >= 85 ? C.green : C.accent}44`, borderRadius: 8, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 36, fontFamily: TITLE, fontWeight: 800, color: COVERAGE_DATA.coveragePct >= 85 ? C.green : C.accent }}>{COVERAGE_DATA.coveragePct}%</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COVERAGE_DATA.coveragePct >= 85 ? C.green : C.accent, marginBottom: 4 }}>
                  {COVERAGE_DATA.coveragePct >= 85 ? '✓ Release Ready' : '⚠ Coverage Below Target'}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  {COVERAGE_DATA.gapAlerts} gap alert{COVERAGE_DATA.gapAlerts !== 1 ? 's' : ''} · {COVERAGE_DATA.p1} P1 cases · ~{COVERAGE_DATA.estimatedDays} QA days to execute
                </div>
              </div>
            </div>

            {/* Folder coverage bars */}
            <div style={card()}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 14 }}>COVERAGE BY FOLDER</div>
              {COVERAGE_DATA.folders.map((f, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: C.text }}>{f.name}</span>
                    <span style={{ fontSize: 11, color: f.coverage >= 90 ? C.green : f.coverage >= 75 ? C.accent : C.red }}>{f.coverage}%</span>
                  </div>
                  <div style={{ height: 5, background: '#1a1d2e', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${f.coverage}%`, background: f.coverage >= 90 ? C.green : f.coverage >= 75 ? C.accent : C.red, borderRadius: 3, transition: 'width .6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
