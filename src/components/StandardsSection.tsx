const TIERS: Array<{ psl: string; tier: string; levels: string; read: string }> = [
  { psl: '1.0–1.9', tier: 'sub-3', levels: '1.0–1.3 / 1.4–1.6 / 1.7–1.9', read: 'very ugly. bottom of the scale.' },
  { psl: '2.0–2.9', tier: 'sub-5', levels: '2.0–2.3 / 2.4–2.6 / 2.7–2.9', read: 'ugly. below average.' },
  { psl: '3.0–3.9', tier: 'LTN / LTB', levels: '3.0–3.3 / 3.4–3.6 / 3.7–3.9', read: 'average. loads of room for improvement' },
  { psl: '4.0–4.9', tier: 'MTN / MTB', levels: '4.0–4.3 / 4.4–4.6 / 4.7–4.9', read: 'handsome / pretty. clearly above average.' },
  { psl: '5.0–5.9', tier: 'HTN / HTB', levels: '5.0–5.3 / 5.4–5.6 / 5.7–5.9', read: "very handsome/very pretty. significantly better looking than your average person and it's noticeable" },
  { psl: '6.0–6.9', tier: 'Chadlite / Stacylite', levels: '6.0–6.3 / 6.4–6.6 / 6.7–6.9', read: 'model tier. top few percent of faces. genuinely rare.' },
  { psl: '7.0–8.0', tier: 'Chad / Stacy', levels: '7.0–7.3 / 7.4–7.6 / 7.7–8.0', read: 'elite. top 1%. you have seen maybe two in real life.' },
]

const RATIOS: Array<{ metric: string; male: string; female: string; why: string }> = [
  {
    metric: 'Canthal tilt',
    male: '+3° to +7°',
    female: '+4° to +8°',
    why: 'Upward eye tilt reads alert and youthful; a negative tilt reads tired.',
  },
  {
    metric: 'Gonial angle',
    male: '115–122°',
    female: '120–128°',
    why: 'The jaw corner. Sharper reads defined; 130°+ reads soft.',
  },
  {
    metric: 'Jaw ÷ cheekbones',
    male: '0.85–0.92',
    female: '0.78–0.86',
    why: 'Masculine width vs feminine taper. The big dimorphism dial.',
  },
  {
    metric: 'Facial thirds',
    male: '≈33/33/33 (35–38% lower OK)',
    female: '≈33/33/33',
    why: 'Vertical balance between hairline, brows, nose base and chin.',
  },
  {
    metric: 'Midface ratio',
    male: '0.97–1.02',
    female: '1.0–1.10',
    why: 'A compact midface reads youthful and alert; long reads aged.',
  },
  {
    metric: 'FWHR (width ÷ height)',
    male: '1.9–2.05',
    female: '1.75–1.9',
    why: 'Wider-and-shorter faces read dominant and masculine.',
  },
  {
    metric: 'Eye spacing',
    male: '≈1.0',
    female: '≈1.0',
    why: 'Interocular distance should match eye width. Off-spacing reads odd.',
  },
  {
    metric: 'Symmetry',
    male: '90%+',
    female: '90%+',
    why: 'Hardwired preference everywhere, but nobody is 100%, and you still win with it.',
  },
]

const LEVERS: Array<{ n: number; lever: string; tag: string; body: string; tone: string }> = [
  {
    n: 1,
    lever: 'Skin clarity & even tone',
    tag: 'strong evidence',
    tone: 'text-good',
    body: 'Use sunscreen every morning, apply a retinoid at night, and keep your hands off your face. It\'s plain, cheap, and faster-acting than any other tip on this list. It\'s genuinely one of the most underrated and overlooked things in looksmaxxing, and it\'s insanely effective.',
  },
  {
    n: 2,
    lever: 'Body-fat level',
    tag: 'strong evidence',
    tone: 'text-good',
    body: 'It determines just how much of your jaw and cheekbones is actually visible. Men should sit between 10–15% body fat, women between 18–21%. Above that your jaw sinks under fat, below it you look gaunt, so stay in the range. This one matters more than almost anything else on the list.',
  },
  {
    n: 3,
    lever: 'Hair: cut, length, hairline',
    tag: 'strong evidence',
    tone: 'text-good',
    body: 'This is the one you have full control over. The right cut will make you look good and frame your face, while the wrong one will flatten your head and make you look worse than you actually are. You can change it in a day, and reverse it in a couple of weeks. I honestly recommend experimenting with this to find something good for you, or researching your hair type and face type to see which haircut fits you.',
  },
  {
    n: 4,
    lever: 'Brows & facial hair',
    tag: 'moderate evidence',
    tone: 'text-warn',
    body: 'Groom the brows, trim the beard, and you will reshape the eyes and lower face without ever touching either one. Underrated but moderately effective.',
  },
  {
    n: 5,
    lever: 'Sleep & under-eyes',
    tag: 'moderate evidence',
    tone: 'text-warn',
    body: 'The under-eye bags are made of fluid, not bone. Just sleep for seven hours and decrease your intake of salt and alcohol to get rid of them.',
  },
]

const FAQ = [
  {
    q: 'Is the rating objective?',
    a: 'Yes. It is mathematically objective and true. The model is trained on millions of data points and has internet access.',
  },
  {
    q: 'Is my photo stored?',
    a: 'No. It gets processed and analysed one time and discarded. Nothing is stored.',
  },
  {
    q: 'Why is my score different on a different photo?',
    a: 'Lighting, angle, lens distance, expression and filters each move the reading, and together they can shift it by up to a full point. If you want to track progress, shoot the same setup every time: same room, same light, same distance, straight face.',
  },
  {
    q: 'How do I improve the score?',
    a: 'The list above this on the page, top to bottom. Skin, leanness, hair, eyebrows, sleep, etc.',
  },
  {
    q: 'Does bone smashing work?',
    a: 'Absolutely not. Don\'t even try it, it\'s genuinely not worth it.',
  },
  {
    q: 'Does mewing change your face?',
    a: 'Mostly no. Tongue posture might help some people breathe through their nose or relax their jaw, but there\'s no good evidence it reshapes adult bone or creates a sharper jawline once growth is finished. If you are still growing, though, this is excellent and should be practiced, and it will actually help you.',
  },
  {
    q: 'Does chewing mastic gum or doing jaw exercises build a better jawline?',
    a: 'Yes, absolutely. Just don\'t overdo it.',
  },
]

export function StandardsSection() {
  return (
    <section id="standards" className="mt-28 scroll-mt-20">
      <div className="mb-10">
        <h2 className="max-w-2xl text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[40px]">
          What it measures
        </h2>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-6 py-5">
          <h3 className="text-[14.5px] font-semibold">The tiers</h3>
          <p className="text-[12px] text-faint">PSL 1–8. Female side uses LTB / MTB / HTB</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="label px-6 py-3 font-medium">psl</th>
                <th className="label px-6 py-3 font-medium">tier</th>
                <th className="label px-6 py-3 font-medium">low / mid / high</th>
                <th className="label px-6 py-3 font-medium">what it means</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((row) => (
                <tr key={row.tier} className="border-b border-border transition-colors last:border-0 hover:bg-hover/40">
                  <td className="px-6 py-3.5 font-mono text-[12.5px] text-gold">{row.psl}</td>
                  <td className="px-6 py-3.5 text-[13px] font-medium">{row.tier}</td>
                  <td className="px-6 py-3.5 font-mono text-[11.5px] text-faint">{row.levels}</td>
                  <td className="px-6 py-3.5 text-[12.5px] text-secondary">{row.read}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-6 py-4 text-[12.5px] leading-relaxed text-secondary">
          Each tier splits three ways: low, mid and high. A low MTN and a high MTN are not the same face, so the score
          keeps one decimal.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Harmony', body: 'Your proportions: thirds, fifths, midface, spacing, etc.' },
          {
            name: 'Dimorphism',
            body: 'How masculine or feminine you appear according to your reference gender. Males get wider jaws and brow ridges, while females get more pronounced lips and bigger eyes.',
          },
          {
            name: 'Angularity',
            body: 'How sharp the bone looks through the fat tissue.',
          },
          {
            name: 'Misc',
            body: 'Maintenance stuff: skin care, hair, eyebrows, under-eye area. Lowest-priced items on the board.',
          },
        ].map((pillar) => (
          <div key={pillar.name} className="card p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-gold">{pillar.name}</p>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-secondary">{pillar.body}</p>
          </div>
        ))}
      </div>

      <div className="card mt-10 overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-6 py-5">
          <h3 className="text-[14.5px] font-semibold">how the scores are measured</h3>
          <p className="text-[12px] text-faint">reference ranges</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="label px-6 py-3 font-medium">metric</th>
                <th className="label px-6 py-3 font-medium">male reference</th>
                <th className="label px-6 py-3 font-medium">female reference</th>
                <th className="label px-6 py-3 font-medium">why it reads</th>
              </tr>
            </thead>
            <tbody>
              {RATIOS.map((row) => (
                <tr key={row.metric} className="border-b border-border transition-colors last:border-0 hover:bg-hover/40">
                  <td className="px-6 py-3.5 text-[13px] font-medium">{row.metric}</td>
                  <td className="px-6 py-3.5 font-mono text-[12.5px] text-gold">{row.male}</td>
                  <td className="px-6 py-3.5 font-mono text-[12.5px] text-secondary">{row.female}</td>
                  <td className="px-6 py-3.5 text-[12.5px] leading-relaxed text-secondary">{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <div className="card p-6 sm:p-7">
          <h3 className="text-[14.5px] font-semibold">How to ascend</h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-secondary">
            Ordered by how much each one matters. The top of the list has real studies behind it; the bottom is
            opinion. Work from the top down.
          </p>
          <ol className="mt-6 space-y-4">
            {LEVERS.map((lever) => (
              <li key={lever.n} className="flex gap-4">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border-strong bg-bg font-mono text-[10px] text-secondary">
                  {lever.n}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium">{lever.lever}</p>
                    <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${lever.tone}`}>{lever.tag}</span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-secondary">{lever.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-[10px] border border-border bg-bg/60 px-4 py-3.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">anecdotal only</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-secondary">
              Mewing, gua sha, tongue posture: no controlled evidence they change bone in adults. Massage de-puffs you
              for a day. Anything in this bucket gets tagged anecdotal, because that's what it is.
            </p>
          </div>
        </div>
      </div>

      <div id="faq" className="mt-14 scroll-mt-20">
        <h3 className="mb-5 text-[18px] font-semibold tracking-[-0.02em]">FAQ</h3>
        <div className="card divide-y divide-border overflow-hidden">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-6 transition-colors hover:bg-hover/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[13.5px] font-medium marker:hidden">
                {item.q}
                <span className="font-mono text-faint transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-2xl pb-5 text-[12.5px] leading-relaxed text-secondary">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
