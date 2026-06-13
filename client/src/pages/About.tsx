import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Layout from '../components/layout/Layout';

export default function About() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="space-y-16 py-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl animate-pulse-slow" aria-hidden="true" />
        <div className="absolute bottom-10 -left-40 w-96 h-96 rounded-full bg-emerald-600/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} aria-hidden="true" />

        {/* Title section */}
        <section className="text-center max-w-3xl mx-auto space-y-4 animate-scale-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Methodology &amp; Technology
          </h1>
          <p className="text-lg text-gray-300 font-light">
            A look inside the scientific formulas, carbon emission factors, and advanced software stack powering **EcoTrack**.
          </p>
        </section>

        {/* Our Mission */}
        <section className="grid md:grid-cols-2 gap-8 items-center animate-slide-up stagger-1">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              Our Purpose
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Empowering Individuals to Combat Climate Change</h2>
            <p className="text-gray-300 leading-relaxed">
              Climate change is a global crisis, but individual decisions collectively drive market and environmental shifts. EcoTrack was built to bridge the gap between abstract carbon metrics and actionable daily habits.
            </p>
            <p className="text-gray-300 leading-relaxed font-light">
              By providing a transparent, scientifically backed assessment, we help users visualize where their emissions occur and generate realistic routes to lower them, rather than relying on generic recommendations.
            </p>
          </div>
          <div className="p-8 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
            <div className="text-lg font-semibold text-emerald-400 mb-2">Scientific Backing</div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Our calculator uses carbon emission coefficients sourced from leading global environmental agencies:
            </p>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400" aria-hidden="true">✔</span> **IPCC** — Greenhouse Gas Inventories Guidelines
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400" aria-hidden="true">✔</span> **US EPA** — Greenhouse Gas Equivalencies
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400" aria-hidden="true">✔</span> **UK DEFRA** — Greenhouse Gas Reporting Factors
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400" aria-hidden="true">✔</span> **IEA** — Grid Emission Coefficients
              </li>
            </ul>
          </div>
        </section>

        {/* Carbon Emission Factors Breakdown */}
        <section className="space-y-8 animate-slide-up stagger-2">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-white">The Carbon Mathematics</h2>
            <p className="text-gray-400">Here are the exact emission coefficients and formulas used to compute your annual impact.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Transport & Energy */}
            <div className="glass-card p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                <span aria-hidden="true">🚗</span> Transport &amp; Energy
              </h3>
              
              <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                <div>
                  <h4 className="font-semibold text-white mb-1">Vehicle Travel (kg CO₂ / km)</h4>
                  <ul className="grid grid-cols-2 gap-y-1.5 pl-4 list-disc text-gray-400">
                    <li>Petrol Car: **0.21**</li>
                    <li>Diesel Car: **0.17**</li>
                    <li>Electric Vehicle: **0.05**</li>
                    <li>Motorcycle: **0.10**</li>
                    <li>Public Transport: **0.04**</li>
                  </ul>
                  <p className="text-[11px] text-gray-500 mt-1">{"Formula: $\\text{Weekly km} \\times 52 \\text{ weeks} \\times \\text{Factor}$"}</p>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="font-semibold text-white mb-1">Air Travel</h4>
                  <p className="text-gray-400">Calculated at **255 kg CO₂** per short-haul flight per year.</p>
                  <p className="text-[11px] text-gray-500">{"Formula: $\\text{Flights} \\times 255\\text{ kg}$"}</p>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="font-semibold text-white mb-1">Domestic Energy</h4>
                  <p className="text-gray-400">
                    Electricity uses a global grid average of **0.42 kg CO₂ / kWh**. Air Conditioning runtime draws 1.5 kW. 
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {"Formula: $(\\text{Monthly kWh} \\times 0.42 + \\text{AC Hours} \times 1.5 \\times 30 \\text{ days} \\times 0.42) \\times 12$"}
                  </p>
                </div>
              </div>
            </div>

            {/* Diet, Consumption, Waste */}
            <div className="glass-card p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                <span aria-hidden="true">🍔</span> Diet, Consumption &amp; Waste
              </h3>

              <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                <div>
                  <h4 className="font-semibold text-white mb-1">Dietary Carbon Footprint (kg CO₂ / year)</h4>
                  <ul className="grid grid-cols-2 gap-y-1.5 pl-4 list-disc text-gray-400">
                    <li>Vegan: **1,500**</li>
                    <li>Vegetarian: **1,700**</li>
                    <li>Mixed Diet: **2,500**</li>
                    <li>High Meat: **3,300**</li>
                  </ul>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="font-semibold text-white mb-1">Consumption Lifecycles</h4>
                  <p className="text-gray-400">
                    Includes manufacturing, packaging, and shipping overheads:
                  </p>
                  <ul className="grid grid-cols-2 gap-y-1.5 pl-4 list-disc text-gray-400 mt-1">
                    <li>Online Order: **19 kg**</li>
                    <li>Clothing Item: **14 kg**</li>
                    <li>New Electronic Device: **300 kg**</li>
                  </ul>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="font-semibold text-white mb-1">Waste &amp; Water</h4>
                  <p className="text-gray-400">
                    Garbage bag: **2.5 kg/week**. Water consumption: **0.0003 kg/liter**. Recycling percentage decreases total waste footprint directly.
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {"Formula: $(\\text{Bags} \\times 2.5 \\times 52 \\times [1 - \\text{Recycle}\\%]) + (\\text{Liters} \\times 365 \\times 0.0003)$"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="space-y-8 animate-slide-up stagger-3">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-white">Built for Scalability &amp; Speed</h2>
            <p className="text-gray-400">Leveraging modern frontend components, lightweight databases, and AI endpoints.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-3xl block mb-2" aria-hidden="true">⚛️</span>
              <div className="font-semibold text-white text-sm">React 18</div>
              <div className="text-[11px] text-gray-400 mt-1">Vite build engine</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-3xl block mb-2" aria-hidden="true">📘</span>
              <div className="font-semibold text-white text-sm">TypeScript</div>
              <div className="text-[11px] text-gray-400 mt-1">Type-safe compiling</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-3xl block mb-2" aria-hidden="true">🎨</span>
              <div className="font-semibold text-white text-sm">Tailwind CSS</div>
              <div className="text-[11px] text-gray-400 mt-1">Responsive styling</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-3xl block mb-2" aria-hidden="true">🚂</span>
              <div className="font-semibold text-white text-sm">Express</div>
              <div className="text-[11px] text-gray-400 mt-1">Node.js API Server</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-3xl block mb-2" aria-hidden="true">🗄️</span>
              <div className="font-semibold text-white text-sm">Postgres/SQLite</div>
              <div className="text-[11px] text-gray-400 mt-1">Hybrid DB adapter</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-3xl block mb-2" aria-hidden="true">🤖</span>
              <div className="font-semibold text-white text-sm">Gemini AI</div>
              <div className="text-[11px] text-gray-400 mt-1">Personalized coaching</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-3xl border border-emerald-500/10 animate-slide-up stagger-4">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to start tracking?</h2>
          <p className="text-gray-300 max-w-md mx-auto mb-6 font-light">
            Join our sustainable community and begin cutting emissions with the help of scientific tracking and AI.
          </p>
          <Link to={isAuthenticated ? "/dashboard" : "/login"}>
            <Button size="lg" className="px-8">
              {isAuthenticated ? "View Dashboard" : "Register / Sign In"}
            </Button>
          </Link>
        </section>
      </div>
    </Layout>
  );
}

