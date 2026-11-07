import {
  DIMENSIONS,
  EVIDENCE_LEVERS,
  FAQ_ITEMS,
  FRAMEWORK_GROUPS,
  REFERENCES,
  SCORE_BANDS,
} from '../lib/content'
import { formatWeight } from '../lib/utils'
import { SectionHeading, Tag } from './ui'

const OBSERVABLE = [
  {
    title: 'More directly observable',
    items: [
      'Visible skin texture, clarity and tone evenness',
      'Hair density, hairline and styling',
      'Brow and facial-hair grooming',
      'Approximate facial proportions and symmetry',
      'Jaw and cheekbone definition as seen in 2D',
    ],
  },
  {
    title: 'Partly observable',
    items: [
      'Bone structure underneath soft tissue',
      'Body composition and facial adiposity',
      'Eye-area detail in poor lighting',
      'Hairline under different angles or styling',
    ],
  },
  {
    title: 'Subjective or contextual',
    items: [
      'Overall appeal and first impression',
      'Dimorphism preferences',
      'Archetype and style read',
      'Cultural and individual variation',
    ],
  },
  {
    title: 'Not assessed',
    items: [
      'Health or medical status',
      'Personality or intelligence',
      'Worth or character',
      'Anything not visible in the photo',
    ],
  },
]

export function MethodSection() {
  return (
    <section id="method" className="container-page scroll-mt-20 py-16 sm:py-20">
      <SectionHeading
        eyebrow="Method"
        title="How the analysis works"
        description="Fixed weights across 10 scores, and a clear line between what the photo shows and what it assumes."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-5 sm:p-7">
          <p className="eyebrow">The scoring model</p>
          <ol className="mt-4 space-y-5">
            {[
              {
                title: 'One photo, one estimate',
                body: 'The model reads what is visible. It cannot measure bone with calipers, and it has no clue about your health history.',
              },
              {
                title: 'Ten dimensions',
                body: 'Six scores for structure, three for presentation and one for overall appeal. Each comes with a note on what drove it.',
              },
              {
                title: 'Weighted composite',
                body: 'Structure carries 59%, presentation 23%, appeal 18%. Fixed weights, so one feature cannot hijack the headline.',
              },
              {
                title: 'What the scale means',
                body: '5 is the midpoint most faces land on. 6 is clearly above average. 7 is attractive. 8 and above is rare. Descriptive bands, not clinical categories.',
              },
              {
                title: 'A secondary structural index',
                body: 'The PSL-style index reads only the six structure dimensions. It is internet looksmaxxing culture translated into numbers, not a medical tool and not the overall score.',
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border border-lineStrong bg-paper font-mono text-[10px] text-ink2">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{step.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink2">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="card p-5 sm:p-7">
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow">Weights</p>
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink3">fixed, not model-chosen</span>
          </div>
          <div className="mt-4 space-y-5">
            {FRAMEWORK_GROUPS.map((group) => (
              <div key={group.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-medium text-ink">{group.label}</p>
                  <span className="font-mono text-[12px] text-ink3">{formatWeight(group.weight)}</span>
                </div>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink2">{group.description}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken">
                  <div
                    className={
                      group.key === 'structure'
                        ? 'h-full bg-accent'
                        : group.key === 'presentation'
                          ? 'h-full bg-clay'
                          : 'h-full bg-ink3'
                    }
                    style={{ width: `${group.weight * 100}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.06em] text-ink3">
                  {group.keys
                    .map((key) => DIMENSIONS.find((dimension) => dimension.key === key)?.name)
                    .filter(Boolean)
                    .join(' - ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-[15px] font-medium text-ink">The 10-point scale</h3>
            <p className="mt-0.5 text-[12px] text-ink2">Descriptive bands, not clinical categories.</p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink3">5.0 = population average</span>
        </div>
        <div className="divide-y divide-line">
          {SCORE_BANDS.map((band, index) => {
            const max = index === 0 ? 10 : SCORE_BANDS[index - 1].min - 0.1
            return (
              <div
                key={band.label}
                className="grid gap-1 px-5 py-3 sm:grid-cols-[104px_150px_1fr] sm:items-baseline sm:gap-4 sm:px-6"
              >
                <span className="font-mono text-[12px] text-accent">
                  {band.min.toFixed(1)}-{max.toFixed(1)}
                </span>
                <span className="text-[13px] font-medium text-ink">{band.label}</span>
                <span className="text-[12.5px] leading-relaxed text-ink2">{band.note}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4">
          <p className="eyebrow">What it sees vs what it assumes</p>
          <h3 className="mt-1 text-[22px] leading-tight tracking-[-0.02em] text-ink">Observed vs inferred</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OBSERVABLE.map((column) => (
            <div key={column.title} className="card p-5">
              <p className="text-[12px] font-medium text-ink">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.items.map((item) => (
                  <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-ink2">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lineStrong" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div id="evidence" className="mt-16 scroll-mt-20">
        <SectionHeading
          eyebrow="Evidence"
          title="What the evidence supports"
          description="Strong evidence is not a promise, and limited evidence is not useless. It reflects the strength of the claim."
        />

        <div className="card mt-8 divide-y divide-line">
          {EVIDENCE_LEVERS.map((lever) => (
            <div key={lever.title} className="px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13.5px] font-medium text-ink">{lever.title}</p>
                <Tag tone={lever.tone}>{lever.label}</Tag>
              </div>
              <p className="mt-1.5 max-w-4xl text-[12.5px] leading-relaxed text-ink2">{lever.body}</p>
            </div>
          ))}
        </div>

        <div className="card mt-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[15px] font-medium text-ink">Selected reading</h3>
            <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink3">context, not proof</p>
          </div>
          <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-ink2">
            Good entry points into attractiveness research. Nothing here shows that one ratio decides attractiveness, and none of it is a diagnosis.
          </p>
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {REFERENCES.map((reference) => (
              <li key={`${reference.authors}-${reference.year}-${reference.title}`} className="py-3">
                <p className="text-[12.5px] leading-relaxed text-ink2">
                  <span className="text-ink">{reference.authors}</span> ({reference.year}).{' '}
                  <span className="italic">{reference.title}</span>. {reference.source}.
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="faq" className="mt-16 scroll-mt-20">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Straight answers about the score, your photo, the method and what it cannot tell you."
        />

        <div className="card mt-8 divide-y divide-line overflow-hidden">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group px-5 transition-colors hover:bg-paper sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[13.5px] font-medium text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="font-mono text-ink3 transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-3xl pb-5 text-[12.5px] leading-relaxed text-ink2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
