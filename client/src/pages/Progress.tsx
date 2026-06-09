import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import TrendChart from '../components/charts/TrendChart';
import { api } from '../services/api';
import { formatCO2, formatNumber } from '../utils/format';
import type { DashboardSummary, Goal } from '../types';

export default function ProgressPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState(0);
  const [goalDate, setGoalDate] = useState('');
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);
  const [goalError, setGoalError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const summary = await api.getDashboard();
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || goalTarget <= 0 || !goalDate) {
      setGoalError('Please fill in all fields with valid data');
      return;
    }

    setIsSubmittingGoal(true);
    setGoalError('');
    try {
      await api.createGoal({
        title: goalTitle,
        targetReductionKg: goalTarget,
        targetDate: goalDate,
      });
      setGoalTitle('');
      setGoalTarget(0);
      setGoalDate('');
      // Refresh summary
      await fetchData();
    } catch (err) {
      setGoalError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  const handleLogReduction = async (id: number, currentReduction: number, targetReduction: number) => {
    const amountStr = prompt('Enter the amount of CO2 reduced (kg):');
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number');
      return;
    }

    const newReduction = currentReduction + amount;
    const status = newReduction >= targetReduction ? 'completed' : 'active';

    try {
      await api.updateGoal(id, {
        currentReductionKg: newReduction,
        status,
      });
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update goal progress');
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
          <h1 className="text-2xl font-bold text-white">Error Loading Progress</h1>
          <p className="text-gray-400 mt-2">{error || 'Please complete your assessment first to track progress.'}</p>
          <div className="mt-6">
            <Button onClick={fetchData}>Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const { trends, goals } = data;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Progress Tracking</h1>
          <p className="text-gray-400 mt-1">
            Monitor your historical carbon emissions and manage your reduction goals.
          </p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Emissions Trend (kg CO₂)">
            <div className="h-72 mt-4">
              <TrendChart data={trends} dataKey="emissions" />
            </div>
          </Card>
          <Card title="Sustainability Score Trend">
            <div className="h-72 mt-4">
              <TrendChart data={trends} dataKey="score" />
            </div>
          </Card>
        </div>

        {/* Goals Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" title="Active Carbon Reduction Goals">
            {goals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-3xl mb-2 block" aria-hidden="true">🎯</span>
                No active reduction goals. Create one on the right to start tracking!
              </div>
            ) : (
              <div className="space-y-6">
                {goals.map((goal) => {
                  const pct = Math.min(100, Math.max(0, (goal.currentReductionKg / goal.targetReductionKg) * 100));
                  return (
                    <div key={goal.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-lg">{goal.title}</h3>
                          <p className="text-xs text-gray-500">Target Date: {new Date(goal.targetDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider
                            ${goal.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {goal.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Progress</span>
                          <span>{formatNumber(pct, 0)}% Complete</span>
                        </div>
                        <ProgressBar value={pct} />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Reduced {formatCO2(goal.currentReductionKg)}</span>
                          <span>Target {formatCO2(goal.targetReductionKg)}</span>
                        </div>
                      </div>

                      {goal.status !== 'completed' && (
                        <div className="flex justify-end pt-2">
                          <Button size="sm" variant="secondary" onClick={() => handleLogReduction(goal.id, goal.currentReductionKg, goal.targetReductionKg)}>
                            Log CO₂ Saved
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Set a New Goal">
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <Input
                label="Goal Description"
                placeholder="e.g. Reduce transportation emissions"
                value={goalTitle}
                onChange={setGoalTitle}
                required
                id="goal-title"
              />
              <Input
                label="Target Reduction (kg CO₂)"
                type="number"
                placeholder="e.g. 150"
                value={goalTarget === 0 ? '' : goalTarget}
                onChange={(val) => setGoalTarget(parseFloat(val) || 0)}
                required
                id="goal-target"
              />
              <Input
                label="Target Date"
                type="date"
                value={goalDate}
                onChange={setGoalDate}
                required
                id="goal-date"
              />

              {goalError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs" role="alert">
                  {goalError}
                </div>
              )}

              <Button type="submit" fullWidth loading={isSubmittingGoal}>
                Create Goal 🎯
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
