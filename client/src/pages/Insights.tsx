import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import EmissionsBreakdown from '../components/charts/EmissionsBreakdown';
import CategoryScores from '../components/charts/CategoryScores';
import { api } from '../services/api';
import { formatCO2, formatNumber, getCategoryIcon } from '../utils/format';
import type { DashboardSummary } from '../types';

export default function InsightsPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [completingId, setCompletingId] = useState<number | null>(null);

  // Action Plan state
  const [actionPlan, setActionPlan] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');
  const [showPlan, setShowPlan] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summary = await api.getDashboard();
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Try to load existing plan
    api.getLatestActionPlan()
      .then((res) => { setActionPlan(res.plan); setShowPlan(true); })
      .catch(() => { /* No existing plan, that's fine */ });
  }, []);

  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    setPlanError('');
    try {
      const res = await api.generateActionPlan();
      setActionPlan(res.plan);
      setShowPlan(true);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Failed to generate action plan');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleCompleteRecommendation = async (id: number) => {
    setCompletingId(id);
    try {
      await api.completeRecommendation(id);
      // Refresh dashboard summary
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete recommendation');
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-red-400 text-5xl mb-4" aria-hidden="true">⚠️</div>
          <h1 className="text-2xl font-bold text-white">Error Loading Insights</h1>
          <p className="text-gray-400 mt-2">{error || 'Please complete your assessment first to get insights.'}</p>
          <div className="mt-6">
            <Button onClick={fetchData}>Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const { assessment, score, recommendations, insights } = data;

  if (!assessment || !score) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
          <div className="text-emerald-500 text-6xl mb-4" aria-hidden="true">🌱</div>
          <h1 className="text-3xl font-bold text-white">No Assessment Data Yet</h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Before we can analyze your habits and give you personalized insights, you need to complete your initial assessment.
          </p>
          <div>
            <Button onClick={() => window.location.href = '/assessment'} size="lg">
              Start Assessment 🚀
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Categories list
  const categories = ['all', 'transport', 'energy', 'food', 'consumption', 'waste'];

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filterCategory === 'all') return true;
    return rec.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Intelligent Insights</h1>
          <p className="text-gray-400 mt-1">
            Data-driven analysis of your habits and actionable plans to reduce your footprint.
          </p>
        </div>

        {/* AI Action Plan Section */}
        <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Sustainability Action Plan</h2>
                <p className="text-gray-400 text-sm">Powered by Gemini — personalized to your assessment data</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGeneratePlan}
              loading={planLoading}
            >
              {actionPlan ? '🔄 Regenerate' : '✨ Generate Plan'}
            </Button>
          </div>

          {planError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4" role="alert">
              {planError}
            </div>
          )}

          {showPlan && actionPlan && (
            <div className="mt-2 p-5 rounded-2xl bg-black/30 border border-emerald-500/10">
              <div className="prose prose-invert prose-sm prose-emerald max-w-none
                [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-emerald-400 [&_h1]:mb-3
                [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2
                [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-200
                [&_p]:text-gray-300 [&_p]:leading-relaxed
                [&_li]:text-gray-300 [&_li]:leading-relaxed
                [&_strong]:text-white
                [&_ol]:list-decimal [&_ol]:pl-5
                [&_ul]:list-disc [&_ul]:pl-5">
                {actionPlan.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
                  if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
                  if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
                  if (line.match(/^\d+\.\s/)) return <p key={i} className="ml-4">{line}</p>;
                  if (line.startsWith('- ')) return <p key={i} className="ml-4">• {line.slice(2)}</p>;
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i}>{line}</p>;
                })}
              </div>
            </div>
          )}

          {!showPlan && !planLoading && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Click "Generate Plan" to create a personalized sustainability roadmap based on your assessment data.</p>
            </div>
          )}
        </Card>

        {/* Top Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" title="Key Opportunities">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Largest Source</span>
                <h3 className="text-lg font-bold text-white mt-1 capitalize">{insights?.largestSource || 'No data'}</h3>
                <p className="text-gray-300 text-sm mt-1">{insights?.comparison || ''}</p>
              </div>
              <div className="space-y-2">
                {insights?.insights?.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-emerald-400 mt-0.5" aria-hidden="true">✓</span>
                    <p className="text-sm text-gray-300">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Category Sustainability Scores">
            <CategoryScores
              transport={score.transportScore}
              energy={score.energyScore}
              food={score.foodScore}
              consumption={score.consumptionScore}
              waste={score.wasteScore}
            />
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Emissions Breakdown">
            <EmissionsBreakdown
              transport={assessment.transportEmissionsKg}
              energy={assessment.energyEmissionsKg}
              food={assessment.foodEmissionsKg}
              consumption={assessment.consumptionEmissionsKg}
              waste={assessment.wasteEmissionsKg}
              water={assessment.waterEmissionsKg}
            />
          </Card>

          <Card className="lg:col-span-2" title="Emissions Analysis">
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">🚗 Transportation</span>
                  <span className="text-white font-semibold">{formatCO2(assessment.transportEmissionsKg)}/yr</span>
                </div>
                <ProgressBar value={score.transportScore} color="blue" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">⚡ Energy</span>
                  <span className="text-white font-semibold">{formatCO2(assessment.energyEmissionsKg)}/yr</span>
                </div>
                <ProgressBar value={score.energyScore} color="amber" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">🍽️ Food Habits</span>
                  <span className="text-white font-semibold">{formatCO2(assessment.foodEmissionsKg)}/yr</span>
                </div>
                <ProgressBar value={score.foodScore} color="emerald" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">🛍️ Consumption</span>
                  <span className="text-white font-semibold">{formatCO2(assessment.consumptionEmissionsKg)}/yr</span>
                </div>
                <ProgressBar value={score.consumptionScore} color="violet" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">♻️ Waste & Water</span>
                  <span className="text-white font-semibold">{formatCO2(assessment.wasteEmissionsKg + assessment.waterEmissionsKg)}/yr</span>
                </div>
                <ProgressBar value={(score.wasteScore + 100) / 2} color="red" />
              </div>
            </div>
          </Card>
        </div>

        {/* Personalized Action Plans */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Personalized Action Plans</h2>
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter recommendations by category">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all
                    ${
                      filterCategory === cat
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredRecommendations.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-gray-400">No active action plans in this category. You're doing great!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecommendations.map((rec) => {
                const isCompleted = rec.isCompleted;
                return (
                  <Card
                    key={rec.id}
                    className={`transition-all duration-300 relative overflow-hidden group
                      ${isCompleted ? 'opacity-60 border-emerald-500/20' : 'hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden="true">
                          {getCategoryIcon(rec.category)}
                        </span>
                        <div>
                          <h3 className={`font-bold text-white text-base ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {rec.title}
                          </h3>
                          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold capitalize">
                            {rec.category}
                          </span>
                        </div>
                      </div>
                      <Badge
                        text={rec.difficulty}
                        variant={
                          rec.difficulty.toLowerCase() === 'easy'
                            ? 'success'
                            : rec.difficulty.toLowerCase() === 'moderate'
                            ? 'warning'
                            : 'danger'
                        }
                      />
                    </div>

                    <p className="text-gray-400 text-sm mt-3">{rec.description}</p>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Reduction Potential</p>
                        <p className="font-semibold text-emerald-400">-{formatCO2(rec.co2ReductionKg)} / yr</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Financial Impact</p>
                        <p className="font-semibold text-white">
                          {rec.annualSavingsUsd > 0 ? `Saves $${formatNumber(rec.annualSavingsUsd)}/yr` : 'Neutral'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      {isCompleted ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                          <span aria-hidden="true">✓</span> Completed
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCompleteRecommendation(rec.id)}
                          loading={completingId === rec.id}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
