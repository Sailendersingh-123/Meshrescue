
import { useState } from 'react';
import IncidentMap from './IncidentMap';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Flame,
  HeartPulse,
  MapPin,
  Radio,
  ShieldAlert,
  Siren,
  Wifi,
  Plus,
  X,
} from 'lucide-react';

const initialIncidents = [
  {
    id: 'SOS-1001',
    title: 'Flooding near Silk Board',
    category: 'Flood',
    priority: 'Critical',
    status: 'Active',
    location: 'Silk Board Junction, Bengaluru',
    lat: 12.9172,
    lng: 77.6228,
    description: 'Waterlogging reported near the junction. Assistance may be needed.',
    time: '5 min ago',
    relayed: true,
  },
  {
    id: 'SOS-1002',
    title: 'Fire report in Indiranagar',
    category: 'Fire',
    priority: 'High',
    status: 'Reviewed',
    location: 'Indiranagar, Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    description: 'A fire incident has been reported. Verify details with local responders.',
    time: '20 min ago',
    relayed: true,
  },
  {
    id: 'SOS-1003',
    title: 'Medical assistance requested',
    category: 'Medical',
    priority: 'Medium',
    status: 'Active',
    location: 'BTM Layout, Bengaluru',
    lat: 12.9166,
    lng: 77.6101,
    description: 'A request for medical assistance has been submitted.',
    time: '32 min ago',
    relayed: false,
  },
];

const priorityStyles = {
  Critical: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  High: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  Medium: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
};

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, caption, tone }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{caption}</p>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <Icon size={21} className={tone} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('Overview');
  const [networkNodes, setNetworkNodes] = useState([
  { id: 1, name: 'Survivor handset', status: 'Ready' },
  { id: 2, name: 'Relay node A', status: 'Ready' },
  { id: 3, name: 'Relay node B', status: 'Ready' },
  { id: 4, name: 'Relay node C', status: 'Ready' },
  { id: 5, name: 'Command center', status: 'Ready' },
]);

  const [relayMessages, setRelayMessages] = useState([]);
  const [tinyfishQuery, setTinyfishQuery] = useState('Bengaluru emergency updates');
  const [tinyfishResults, setTinyfishResults] = useState([]);
  const [tinyfishLoading, setTinyfishLoading] = useState(false);
  const [tinyfishError, setTinyfishError] = useState('');
  const [incidents, setIncidents] = useState(initialIncidents);
  const [selectedId, setSelectedId] = useState(initialIncidents[0].id);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: 'Bengaluru, Karnataka',
    lat: '12.9352',
    lng: '77.6245',
    category: 'Medical',
    priority: 'High',
  });

  const selected = incidents.find((item) => item.id === selectedId) || incidents[0];
  const activeCount = incidents.filter((item) => item.status === 'Active').length;
  const criticalCount = incidents.filter(
    (item) => item.priority === 'Critical' && item.status !== 'Resolved',
  ).length;
  const relayedCount = incidents.filter((item) => item.relayed).length;

  const visibleIncidents = incidents.filter((item) =>
    `${item.id} ${item.title} ${item.category} ${item.location}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function addIncident(event) {
    event.preventDefault();

    const item = {
      id: `SOS-${Date.now().toString().slice(-5)}`,
      title: form.title,
      description: form.description,
      location: form.location,
      lat: Number(form.lat),
      lng: Number(form.lng),
      category: form.category,
      priority: form.priority,
      status: 'Active',
      time: 'Just now',
      relayed: false,
    };

    setIncidents((old) => [item, ...old]);
    setSelectedId(item.id);
    setPage('Incidents');
    setShowForm(false);
    setForm({
      title: '',
      description: '',
      location: 'Bengaluru, Karnataka',
      lat: '12.9352',
      lng: '77.6245',
      category: 'Medical',
      priority: 'High',
    });
    setNotice('Demo SOS created. No real emergency alert was sent.');
  }
 function simulateRelay() {
  const pendingIncident = incidents.find(
    (item) => !item.relayed && item.status !== 'Resolved'
  );

  if (!pendingIncident) {
    setNotice('No pending SOS messages to relay.');
    return;
  }

  setIncidents((old) =>
    old.map((item) =>
      item.id === pendingIncident.id
        ? { ...item, relayed: true }
        : item
    )
  );

  setRelayMessages((old) => [
    {
      id: Date.now(),
      incidentId: pendingIncident.id,
      title: pendingIncident.title,
      path: 'Survivor → Relay A → Relay B → Command Center',
      time: 'Just now',
    },
    ...old,
  ]);

  setNotice(
    `${pendingIncident.id} successfully relayed in demo simulation.`
  );
}
async function searchTinyFish() {
  setTinyfishLoading(true);
  setTinyfishError('');

  try {
    const response = await fetch(
      `http://localhost:5000/api/tinyfish-search?q=${encodeURIComponent(tinyfishQuery)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'TinyFish search failed');
    }

    setTinyfishResults(data.results || []);
  } catch (error) {
    setTinyfishError(error.message);
  } finally {
    setTinyfishLoading(false);
  }
}

  const navigation = [
    { name: 'Overview', icon: Activity },
    { name: 'Incidents', icon: ShieldAlert },
    { name: 'Mesh Network', icon: Radio },
  ];

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-[#0b1120] p-5 md:flex">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300 text-slate-950">
              <Siren size={25} />
            </div>
            <div>
              <p className="text-lg font-bold">
                Mesh<span className="text-cyan-300">Rescue</span>
              </p>
              <p className="text-xs text-slate-500">Emergency coordination</p>
            </div>
          </div>

          <p className="mt-10 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>
          <nav className="mt-3 space-y-1">
            {navigation.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => setPage(name)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${
                  page === name
                    ? 'bg-cyan-300/10 font-semibold text-cyan-200'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {name}
                {name === 'Incidents' && (
                  <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-xs">
                    {incidents.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-cyan-900 bg-cyan-950/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
              <Wifi size={16} /> Demo network
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Offline relay concept shown for prototype demonstration.
            </p>
            <p className="mt-3 text-xs text-emerald-300">● Prototype online</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-[#0b1120] px-5 py-4 md:px-8">
            <div>
              <p className="text-xs text-slate-500">MeshRescue / {page}</p>
              <h1 className="mt-1 text-xl font-semibold">
                {page === 'Overview' ? 'Command center' : page}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-200">
                DEMO DATA
              </Badge>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
              >
                <Plus size={17} /> Create SOS
              </button>
            </div>
          </header>

          <div className="space-y-6 p-5 md:p-8">
            {notice && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-800 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-100">
                {notice}
                <button onClick={() => setNotice('')} aria-label="Dismiss">
                  <X size={16} />
                </button>
              </div>
            )}

            <div>
              <p className="text-sm text-slate-400">Bengaluru, Karnataka · Prototype workspace</p>
              <h2 className="mt-1 text-3xl font-bold">Emergency overview</h2>
              <p className="mt-2 text-sm text-slate-400">
                Review reports and demonstrate offline-first coordination.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={ShieldAlert} label="Total incidents" value={incidents.length} caption="Sample reports" tone="text-cyan-300" />
              <StatCard icon={AlertTriangle} label="Critical priority" value={criticalCount} caption="Needs review" tone="text-rose-300" />
              <StatCard icon={Activity} label="Active incidents" value={activeCount} caption="Marked active" tone="text-amber-300" />
              <StatCard icon={Radio} label="Mesh-relayed" value={`${relayedCount}/${incidents.length}`} caption="Simulated delivery" tone="text-emerald-300" />
            </div>

            {page === 'Overview' && (
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
                  <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <div>
                      <h3 className="font-semibold">Recent incidents</h3>
                      <p className="mt-1 text-xs text-slate-500">Select a report to view details</p>
                    </div>
                    <button onClick={() => setPage('Incidents')} className="text-sm text-cyan-300">
                      View all
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {incidents.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedId(item.id);
                          setPage('Incidents');
                        }}
                        className="flex w-full gap-3 p-4 text-left hover:bg-slate-800/50"
                      >
                        <div className="mt-1 rounded-lg bg-slate-800 p-2 text-cyan-200">
                          {item.category === 'Fire' ? (
                            <Flame size={18} />
                          ) : item.category === 'Medical' ? (
                            <HeartPulse size={18} />
                          ) : (
                            <AlertTriangle size={18} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{item.title}</span>
                            <Badge className={priorityStyles[item.priority]}>{item.priority}</Badge>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-400">{item.location}</p>
                          <p className="mt-2 text-xs text-slate-500">{item.id} · {item.time}</p>
                        </div>
                        <span className="text-slate-600">›</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Mesh relay overview</h3>
                      <p className="mt-1 text-xs text-slate-500">Illustrative network diagram</p>
                    </div>
                    <Radio size={20} className="text-cyan-300" />
                  </div>
                  <div className="relative mt-5 h-64 overflow-hidden rounded-xl border border-slate-800 bg-[#080e1b]">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      <line x1="10" y1="50" x2="32" y2="25" stroke="#22d3ee" strokeWidth="0.7" strokeDasharray="2 2" />
                      <line x1="10" y1="50" x2="52" y2="72" stroke="#22d3ee" strokeWidth="0.7" strokeDasharray="2 2" />
                      <line x1="32" y1="25" x2="70" y2="35" stroke="#22d3ee" strokeWidth="0.7" strokeDasharray="2 2" />
                      <line x1="52" y1="72" x2="70" y2="35" stroke="#22d3ee" strokeWidth="0.7" strokeDasharray="2 2" />
                      <line x1="70" y1="35" x2="90" y2="50" stroke="#22d3ee" strokeWidth="0.7" strokeDasharray="2 2" />
                    </svg>
                    {[
                      { label: 'Survivor', x: 10, y: 50, tone: 'amber' },
                      { label: 'Relay A', x: 32, y: 25, tone: 'cyan' },
                      { label: 'Relay B', x: 52, y: 72, tone: 'cyan' },
                      { label: 'Relay C', x: 70, y: 35, tone: 'cyan' },
                      { label: 'Center', x: 90, y: 50, tone: 'emerald' },
                    ].map((node) => (
                      <div key={node.label} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                        <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border ${node.tone === 'amber' ? 'border-amber-300 bg-amber-300/15 text-amber-200' : node.tone === 'emerald' ? 'border-emerald-300 bg-emerald-300/15 text-emerald-200' : 'border-cyan-300 bg-cyan-300/15 text-cyan-200'}`}>
                          <Radio size={14} />
                        </div>
                        <p className="mt-1 whitespace-nowrap text-[9px] text-slate-300">{node.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Simulation only: no real phones or mesh traffic are connected.
                  </p>
                </section>
              </div>
            )}

            {page === 'Incidents' && (
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
                  <div className="border-b border-slate-800 p-4">
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search incidents or locations..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="divide-y divide-slate-800">
                    {visibleIncidents.map((item) => (
                      <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full p-4 text-left hover:bg-slate-800/50 ${selectedId === item.id ? 'bg-cyan-950/25' : ''}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium">{item.title}</span>
                          <Badge className={priorityStyles[item.priority]}>{item.priority}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{item.location}</p>
                        <p className="mt-2 text-xs text-slate-500">{item.id} · {item.status} · {item.time}</p>
                      </button>
                    ))}
                    {visibleIncidents.length === 0 && <p className="p-5 text-sm text-slate-400">No matching incidents.</p>}
                  </div>
                </section>

                {selected && (
                  <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Selected report · {selected.id}</p>
                    <h3 className="mt-3 text-xl font-semibold">{selected.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className={priorityStyles[selected.priority]}>{selected.priority} priority</Badge>
                      <Badge className="border-slate-700 bg-slate-800 text-slate-300">{selected.status}</Badge>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">{selected.description}</p>
                    <div className="mt-5 space-y-4 border-t border-slate-800 pt-5 text-sm">
                      <div className="flex gap-3">
                        <MapPin size={18} className="shrink-0 text-cyan-300" />
                        <div><p className="text-slate-500">Location</p><p className="mt-1">{selected.location}</p></div>
                      </div>
                      <div className="flex gap-3">
                        <Radio size={18} className="shrink-0 text-cyan-300" />
                        <div><p className="text-slate-500">Relay status</p><p className="mt-1">{selected.relayed ? 'Simulated relay completed' : 'Not relayed in demo'}</p></div>
                      </div>
                    </div>
                    {selected.status !== 'Resolved' && (
                      <button
                        onClick={() => {
                          setIncidents((old) => old.map((item) => item.id === selected.id ? { ...item, status: 'Resolved' } : item));
                          setNotice(`${selected.id} marked resolved in demo data.`);
                        }}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-950/40 px-4 py-2.5 text-sm text-emerald-200 hover:bg-emerald-900/50"
                      >
                        <CheckCircle2 size={16} /> Mark resolved
                      </button>
                    )}
                  </section>
                )}
              </div>
            )}

            {page === 'Mesh Network' && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h3 className="text-lg font-semibold">Offline relay concept</h3>
                <button
                  onClick={simulateRelay}
                  className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-200"
                >
                <Radio size={18} className="mr-2 inline" />
                  Relay Pending SOS
                </button>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  A real mesh protocol can relay messages between nearby devices when internet access is unavailable. This dashboard only illustrates the idea.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {['Survivor handset', 'Relay node A', 'Relay node B', 'Relay node C', 'Command center'].map((node, index) => (
                    <div key={node} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <Radio size={20} className="text-cyan-300" />
                      <p className="mt-4 font-medium">{node}</p>
                      <p className="mt-1 text-xs text-slate-500">{index === 0 ? 'Source' : index === 4 ? 'Destination' : 'Relay'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-amber-900/60 bg-amber-950/20 p-4 text-sm text-amber-100">
                  <AlertTriangle className="mr-2 inline" size={17} />
                  Demo only — no real devices or mesh protocol are connected.
                </div>
              </section>
            )}

            <footer className="border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">
              <p className="flex items-center gap-2"><Bell size={14} /> MeshRescue hackathon prototype · Sample data only</p>
              <p className="mt-1">This dashboard does not contact emergency services. Do not use it for real dispatch.</p>
            </footer>
          </div>
          
{page === 'Overview' && (
  <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
    <h3 className="mb-1 text-lg font-semibold">Incident Location Map</h3>
    <p className="mb-4 text-sm text-slate-400">
      Sample incident locations in Bengaluru.
    </p>
    <IncidentMap
      incidents={incidents}
      onLocationSelect={(lat, lng) =>
    setForm((old) => ({
      ...old,
      lat: String(lat),
      lng: String(lng),
    }))
  }
/>
  </section>
)}

        </main>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-[#0c1424] p-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">Create demo SOS</h2>
                <p className="mt-1 text-sm text-slate-400">Add a sample incident to this dashboard.</p>
              </div>
              <button onClick={() => setShowForm(false)} aria-label="Close form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={addIncident} className="mt-5 space-y-4">
              <div>
                <label className="text-sm text-slate-300">Incident title *</label>
                <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Road blocked by floodwater" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="text-sm text-slate-300">Description *</label>
                <textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} placeholder="Describe the situation..." className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-cyan-400" />
              </div>
              
              <div>
               <label className="text-sm text-slate-300">Location</label>
               <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-cyan-400" />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm text-slate-300">
                  Select location on map
                </label>

                <p className="mb-2 text-xs text-slate-400">
                  Click on the map to select the SOS location.
                </p>

  <IncidentMap
    incidents={incidents}
    onLocationSelect={(lat, lng) =>
      setForm((old) => ({
        ...old,
        lat: String(lat),
        lng: String(lng),
      }))
    }
  />
</div>
              <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-300">Latitude</label>
                <input type="number" step="any" value={form.lat} onChange={(event) => setForm({ ...form, lat: event.target.value })} placeholder="12.9172" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="text-sm text-slate-300">Longitude</label>
                <input type="number" step="any" value={form.lng} onChange={(event) => setForm({ ...form, lng: event.target.value })} placeholder="77.6228" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-cyan-400" />
              </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-300">Priority</label>
                  <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm">
                    <option>Critical</option><option>High</option><option>Medium</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300">Category</label>
                  <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm">
                    <option>Medical</option><option>Flood</option><option>Fire</option><option>Building Collapse</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
                <button type="submit" className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-200">Add demo SOS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
