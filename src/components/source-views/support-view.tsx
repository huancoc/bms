import { Briefcase, Code2, Mail, Network, Phone, Presentation, UserRound } from 'lucide-react'
import { Panel, Pill } from '../ui'
import { TABS } from '../tabs'

const GUIDE: Record<string, { pitch: string; steps: string[] }> = {
  overview: {
    pitch: 'Open with the 4 value pillars and the live energy-saved metric.',
    steps: ['Click each scenario to show building-wide reaction', 'Point to the baseline vs. optimized power trend'],
  },
  chiller: {
    pitch: 'Show animated CHW/CW loops and VFD-driven pumps & tower fans.',
    steps: ['Switch to Peak Heatwave → CH-02 stages ON', 'Press “Simulate CHWP-01 Trip” → standby starts in 3 s', 'Raise the CHWS setpoint → kW/TR improves'],
  },
  air: {
    pitch: 'Walk through the AHU from outdoor air to supply fan.',
    steps: ['Watch FA damper modulate with CO₂', 'Simulate dirty filter → 250 Pa maintenance alarm', 'Adjust FCU setpoints & fan speed'],
  },
  power: {
    pitch: 'Demonstrate continuity of supply and automatic transfer.',
    steps: ['Simulate Grid Power Loss → countdown, crank, ATS transfer', 'Note chiller load shedding on generator', 'Restore Grid → re-transfer and cool-down'],
  },
  lighting: {
    pitch: 'Explain schedules, lux sensing and emergency circuits.',
    steps: ['Toggle individual lines & master switches', 'Enable Night Mode → corridors dim to lobby + night lights'],
  },
  fire: {
    pitch: 'Stress read-only integration — the BMS never resets the FACP.',
    steps: ['Trigger the Floor 2 West Wing test alarm', 'Show AHU/PAU stop, dampers close, emergency lights ON'],
  },
  water: {
    pitch: 'Show automatic level control and fire tank monitoring.',
    steps: ['Drain Roof Tank Fast → pump auto-starts at 30%', 'Toggle fire tank low-level alarm test'],
  },
}

const PROTOCOLS = [
  { name: 'BACnet/IP', desc: 'Chillers, AHU/PAU DDC controllers, FACP gateway (read-only objects).' },
  { name: 'Modbus TCP', desc: 'Power meters, generator controller, ATS status & VFDs.' },
  { name: 'Modbus RTU (RS-485)', desc: 'Field VFDs, water level transmitters & lighting relays.' },
]

export function SupportView() {
  return (
    <div className="flex flex-col gap-4">
      <Panel title="Interactive Demo Guide" icon={<Presentation className="size-5" aria-hidden />}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TABS.filter((t) => GUIDE[t.id]).map((t, i) => (
            <article key={t.id} className="flex flex-col gap-2 rounded-xl border border-slate-300 bg-slate-100/70 p-4">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-slate-800 text-base font-bold text-slate-50">{i + 1}</span>
                <t.icon className="size-5 text-sky-700" aria-hidden />
                <h3 className="text-lg font-bold text-slate-900">{t.label}</h3>
              </div>
              <p className="text-base font-semibold text-slate-700">{GUIDE[t.id].pitch}</p>
              <ul className="list-disc space-y-1 pl-5 text-base text-slate-600">
                {GUIDE[t.id].steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_480px]">
        <Panel title="Simulated BMS Protocols" icon={<Network className="size-5" aria-hidden />}>
          <div className="grid gap-3 md:grid-cols-3">
            {PROTOCOLS.map((p) => (
              <div key={p.name} className="rounded-lg border border-slate-300 bg-slate-100/70 p-4">
                <div className="text-lg font-bold text-slate-900">{p.name}</div>
                <p className="mt-1 text-base text-slate-600">{p.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-base text-slate-600">
            All values are simulated in the browser for demonstration — no live field devices are connected.
          </p>
        </Panel>

        <Panel title="Author" icon={<UserRound className="size-5" aria-hidden />}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#1E293B] text-2xl font-bold text-slate-50" aria-hidden>
                HC
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">huan-coc</div>
                <div className="text-base font-semibold text-slate-600">Automation Engineer (Kỹ sư Tự động hóa)</div>
                <div className="mt-1">
                  <Pill tone="info">BMS • SCADA • PLC</Pill>
                </div>
              </div>
            </div>
            <dl className="divide-y divide-slate-300 rounded-lg border border-slate-300 bg-slate-100/70">
              {[
                { icon: Mail, label: 'Email' },
                { icon: Phone, label: 'Phone' },
                { icon: Code2, label: 'GitHub' },
                { icon: Briefcase, label: 'LinkedIn' },
              ].map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <dt className="flex items-center gap-2 text-base font-semibold text-slate-700">
                    <c.icon className="size-4" aria-hidden />
                    {c.label}
                  </dt>
                  <dd className="text-base text-slate-500">[Placeholder - To be updated]</dd>
                </div>
              ))}
            </dl>
          </div>
        </Panel>
      </div>
    </div>
  )
}
