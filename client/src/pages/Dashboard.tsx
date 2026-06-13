import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import ScoreGauge from '../components/ui/ScoreGauge';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import EmissionsBreakdown from '../components/charts/EmissionsBreakdown';
import CategoryScores from '../components/charts/CategoryScores';
import TrendChart from '../components/charts/TrendChart';
import { formatCO2, formatNumber, getCategoryIcon } from '../utils/format';

export default function Dashboard() {
  const { dashboard, isDashboardLoading, dashboardError, fetchDashboard } = useApp();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isDashboardLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-4">Loading your eco dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (dashboardError || !dashboard) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="text-6xl mb-4" aria-hidden="true">🌿</div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to EcoTrack!</h2>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            {dashboardError || 'Complete your first carbon footprint assessment to see your dashboard.'}
          </p>
          <Link
            to="/assessment"
            className="btn-primary"
          >
            Start Your Assessment →
          </Link>
        </div>
      </Layout>
    );
  }

  const { assessment, score, recommendations, trends, goals, insights } = dashboard;

  if (!assessment || !score) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="text-6xl mb-4" aria-hidden="true">📝</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Assessment Yet</h2>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            Take your first carbon footprint assessment to unlock personalized insights and recommendations.
          </p>
          <Link to="/assessment" className="btn-primary">
            Take Assessment →
          </Link>
        </div>
      </Layout>
    );
  }

  const topRecs = (recommendations || []).filter((r) => !r.isCompleted).slice(0, 3);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-white">Your Eco Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Track your environmental impact and sustainability progress
          </p>
        </div>

        {/* Score Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 flex flex-col items-center justify-center animate-slide-up">
            <ScoreGauge score={score.overallScore} size={180} />
            <p className="text-sm text-gray-400 mt-4 text-center">
              Your sustainability score based on your lifestyle assessment
            </p>
          </Card>

          {/* Emissions Summary Cards */}
          <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4 animate-slide-up stagger-1">
            <Card accent="emerald" hoverable>
              <p className="text-sm text-gray-400">Daily Emissions</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCO2(assessment.dailyEmissionsKg)}
              </p>
              <p className="text-xs text-gray-500 mt-2">per day</p>
            </Card>
            <Card accent="blue" hoverable>
              <p className="text-sm text-gray-400">Monthly Emissions</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCO2(assessment.monthlyEmissionsKg)}
              </p>
              <p className="text-xs text-gray-500 mt-2">per month</p>
            </Card>
            <Card accent="amber" hoverable>
              <p className="text-sm text-gray-400">Annual Emissions</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCO2(assessment.annualEmissionsKg)}
              </p>
              <p className="text-xs text-gray-500 mt-2">per year</p>
            </Card>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Emissions Breakdown" subtitle="Where your carbon footprint comes from" className="animate-slide-up stagger-2">
            <EmissionsBreakdown
              transport={assessment.transportEmissionsKg}
              energy={assessment.energyEmissionsKg}
              food={assessment.foodEmissionsKg}
              consumption={assessment.consumptionEmissionsKg}
              waste={assessment.wasteEmissionsKg}
              water={assessment.waterEmissionsKg}
            />
          </Card>

          <Card title="Category Scores" subtitle="How you score in each area" className="animate-slide-up stagger-3">
            <CategoryScores
              transport={score.transportScore}
              energy={score.energyScore}
              food={score.foodScore}
              consumption={score.consumptionScore}
              waste={score.wasteScore}
            />
          </Card>
        </div>

        {/* Trends */}
        {trends && trends.length > 0 && (
          <Card title="Emission Trends" subtitle="Your carbon footprint over time" className="animate-slide-up stagger-4">
            <TrendChart data={trends} dataKey="emissions" height={250} />
          </Card>
        )}

        {/* Insights & Recommendations */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Key Insights */}
          {insights && (
            <Card title="Key Insights" subtitle="What the data tells us" className="animate-slide-up stagger-4">
              <div className="space-y-3">
                {insights.largestSource && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
                    <span className="text-amber-400 font-medium">Largest Source:</span>
                    <span className="text-gray-300 ml-2">{insights.largestSource}</span>
                  </div>
                )}
                {insights.comparison && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm">
                    <span className="text-blue-400 font-medium">vs National Average:</span>
                    <span className="text-gray-300 ml-2">{insights.comparison}</span>
                  </div>
                )}
                {insights.insights && insights.insights.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {insights.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-emerald-400 mt-0.5" aria-hidden="true">•</span>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Top Recommendations */}
          <Card title="Top Recommendations" subtitle="Actions you can take today" className="animate-slide-up stagger-5">
            {topRecs.length > 0 ? (
              <div className="space-y-3">
                {topRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white flex items-center gap-2">
                          <span aria-hidden="true">{getCategoryIcon(rec.category)}</span>
                          {rec.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {rec.description}
                        </p>
                      </div>
                      <Badge
                        text={`-${formatNumber(rec.co2ReductionKg)} kg`}
                        variant="success"
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
                <Link
                  to="/insights"
                  className="block text-sm text-emerald-400 hover:text-emerald-300 transition-colors text-center pt-2"
                >
                  View all recommendations →
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No pending recommendations 🎉
              </p>
            )}
          </Card>
        </div>

        {/* Goals */}
        {goals && goals.length > 0 && (
          <Card title="Active Goals" subtitle="Track your progress" className="animate-slide-up stagger-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const progress = goal.targetReductionKg > 0
                  ? Math.min(100, (goal.currentReductionKg / goal.targetReductionKg) * 100)
                  : 0;
                return (
                  <div key={goal.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white">{goal.title}</h4>
                      <Badge
                        text={goal.status}
                        variant={goal.status === 'completed' ? 'success' : goal.status === 'active' ? 'info' : 'neutral'}
                        size="sm"
                      />
                    </div>
                    <ProgressBar
                      value={progress}
                      label={`${formatNumber(goal.currentReductionKg, 1)} / ${formatNumber(goal.targetReductionKg, 1)} kg CO₂`}
                      color="emerald"
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
            <Link
              to="/progress"
              className="block text-sm text-emerald-400 hover:text-emerald-300 transition-colors text-center pt-4"
            >
              View all goals →
            </Link>
          </Card>
        )}
      </div>
    </Layout>
  );
}
