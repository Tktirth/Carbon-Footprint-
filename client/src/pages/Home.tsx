import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Layout from '../components/layout/Layout';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="space-y-20 py-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-10 -left-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl animate-pulse-slow" aria-hidden="true" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 rounded-full bg-emerald-600/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} aria-hidden="true" />

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6 animate-scale-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <span aria-hidden="true">🌱</span> Act for the Future
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Analyze. Reduce. Neutralize.<br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Your Personal Carbon Companion
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Track your carbon footprint with scientific accuracy. Get personalized AI-driven action plans, set goals, and connect with a virtual coach to help save our planet.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link to={isAuthenticated ? "/assessment" : "/login"}>
              <Button size="lg" className="w-full sm:w-auto px-8">
                Start Free Assessment
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">
                Learn Methodology
              </Button>
            </Link>
          </div>
        </section>

        {/* Carbon Target Panel */}
        <section className="animate-slide-up stagger-1">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  The Climate Target: 2.0 Tons
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Currently, the average global citizen has a carbon footprint of **4.7 tons** of CO₂ per year, with some countries exceeding **15 tons**. To limit global warming to 1.5°C, we must reduce the average individual footprint to under **2.0 tons** by 2030.
                </p>
                <p className="text-gray-300 leading-relaxed font-light">
                  EcoTrack helps you break down your impact in 6 key categories: Transport, Energy, Food, Consumption, Waste, and Water, giving you specific avenues to make a real difference.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-center mb-6">
                  <span className="text-sm text-emerald-400 font-semibold uppercase tracking-wider">Annual Carbon Budget</span>
                </div>
                <div className="relative flex items-center justify-center">
                  {/* Visual indicator representing target budget */}
                  <div className="w-48 h-48 rounded-full border-4 border-dashed border-emerald-500/20 flex flex-col items-center justify-center p-4">
                    <span className="text-4xl font-extrabold text-white text-shadow-glow">2.0</span>
                    <span className="text-xs text-gray-400 mt-1">Metric Tons CO₂</span>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-2 uppercase tracking-wide">Target Footprint</span>
                  </div>
                  {/* Current global average indicator */}
                  <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold shadow-lg animate-pulse-slow">
                    Average: 4.7T
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="space-y-8 animate-slide-up stagger-2">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-white">Everything You Need To Make An Impact</h2>
            <p className="text-gray-400">Our suite of carbon accounting and reduction tools is fully scientifically audited.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              title="Scientific Tracker" 
              subtitle="Accurate Calculations"
              accent="emerald"
              className="hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="text-3xl mb-3" aria-hidden="true">📊</div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Calculate your weekly emissions across transportation modes, domestic energy use, diets, shopping habits, waste management, and water consumption.
              </p>
            </Card>

            <Card 
              title="AI Action Plans" 
              subtitle="Personalized Roadmap"
              accent="emerald"
              className="hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="text-3xl mb-3" aria-hidden="true">💡</div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Generate structured, step-by-step sustainability plans using Google Gemini AI, segmented into short-term quick wins and long-term transformations.
              </p>
            </Card>

            <Card 
              title="AI Chat Coach" 
              subtitle="Smart Virtual Assistant"
              accent="emerald"
              className="hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="text-3xl mb-3" aria-hidden="true">🤖</div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Ask your dedicated virtual assistant specific questions. Get instant recommendations, explanations of your scores, and helpful tips.
              </p>
            </Card>

            <Card 
              title="Social Leaderboard" 
              subtitle="Gamified Competitions"
              accent="emerald"
              className="hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="text-3xl mb-3" aria-hidden="true">📈</div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Set personal carbon reduction goals, track your progress over time, and compare your achievements on a global, community-driven leaderboard.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="text-center py-12 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-3xl border border-emerald-500/10 animate-slide-up stagger-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to discover your carbon numbers?
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-8 font-light">
            Creating an account takes less than 60 seconds. Take the assessment, identify opportunities, and start carbon cutting.
          </p>
          <Link to={isAuthenticated ? "/dashboard" : "/login"}>
            <Button size="lg" className="px-10">
              {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
            </Button>
          </Link>
        </section>
      </div>
    </Layout>
  );
}
