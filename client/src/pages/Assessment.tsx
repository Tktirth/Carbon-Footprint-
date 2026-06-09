import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ScoreGauge from '../components/ui/ScoreGauge';
import TransportForm from '../components/assessment-form/TransportForm';
import EnergyForm from '../components/assessment-form/EnergyForm';
import FoodForm from '../components/assessment-form/FoodForm';
import ConsumptionForm from '../components/assessment-form/ConsumptionForm';
import WasteForm from '../components/assessment-form/WasteForm';
import WaterForm from '../components/assessment-form/WaterForm';
import type { AssessmentFormData, Assessment, SustainabilityScore, Recommendation } from '../types';
import { api } from '../services/api';
import { formatCO2 } from '../utils/format';

const STEPS = [
  { key: 'transport', label: 'Transport', icon: '🚗' },
  { key: 'energy', label: 'Energy', icon: '⚡' },
  { key: 'food', label: 'Food', icon: '🍽️' },
  { key: 'consumption', label: 'Consumption', icon: '🛍️' },
  { key: 'waste', label: 'Waste', icon: '♻️' },
  { key: 'water', label: 'Water', icon: '💧' },
];

const initialFormData: AssessmentFormData = {
  vehicleType: '',
  travelKmPerWeek: 0,
  publicTransportKmPerWeek: 0,
  flightsPerYear: 0,
  electricityKwhPerMonth: 0,
  acHoursPerDay: 0,
  applianceUsage: '',
  dietType: '',
  onlineOrdersPerMonth: 0,
  clothingItemsPerMonth: 0,
  electronicsPerYear: 0,
  recyclingPercentage: 50,
  wasteBagsPerWeek: 0,
  waterLitersPerDay: 0,
};

interface SubmissionResult {
  assessment: Assessment;
  score: SustainabilityScore;
  recommendations: Recommendation[];
}

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AssessmentFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const navigate = useNavigate();

  const updateFormData = (updates: Partial<AssessmentFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach((key) => delete clearedErrors[key]);
    setErrors(clearedErrors);
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Transport
        if (!formData.vehicleType) newErrors.vehicleType = 'Please select a vehicle type';
        break;
      case 1: // Energy
        if (!formData.applianceUsage) newErrors.applianceUsage = 'Please select appliance usage level';
        break;
      case 2: // Food
        if (!formData.dietType) newErrors.dietType = 'Please select your diet type';
        break;
      case 3: // Consumption
        break;
      case 4: // Waste
        break;
      case 5: // Water
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const response = await api.submitAssessment(formData);
      setResult(response);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show results after submission
  if (result) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="text-6xl mb-4" aria-hidden="true">🎉</div>
            <h1 className="text-3xl font-bold text-white">Assessment Complete!</h1>
            <p className="text-gray-400 mt-2">Here are your results</p>
          </div>

          <Card className="flex flex-col items-center py-8">
            <ScoreGauge score={result.score.overallScore} size={200} />
            <div className="grid grid-cols-3 gap-6 mt-8 w-full">
              <div className="text-center">
                <p className="text-sm text-gray-400">Daily</p>
                <p className="text-lg font-bold text-white">{formatCO2(result.assessment.dailyEmissionsKg)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Monthly</p>
                <p className="text-lg font-bold text-white">{formatCO2(result.assessment.monthlyEmissionsKg)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Annual</p>
                <p className="text-lg font-bold text-white">{formatCO2(result.assessment.annualEmissionsKg)}</p>
              </div>
            </div>
          </Card>

          {result.recommendations.length > 0 && (
            <Card title="Your Personalized Recommendations">
              <div className="space-y-3">
                {result.recommendations.slice(0, 5).map((rec) => (
                  <div key={rec.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-sm font-medium text-white">{rec.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{rec.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/')} variant="primary" size="lg">
              Go to Dashboard
            </Button>
            <Button onClick={() => navigate('/insights')} variant="secondary" size="lg">
              View Insights
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-white">Carbon Footprint Assessment</h1>
          <p className="text-gray-400 mt-1">
            Answer a few questions about your lifestyle to calculate your carbon footprint
          </p>
        </div>

        {/* Step Indicator */}
        <div className="animate-slide-up" role="navigation" aria-label="Assessment steps">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (index < currentStep) setCurrentStep(index);
                  }}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 
                    ${index <= currentStep ? 'cursor-pointer' : 'cursor-default'}
                    ${index === currentStep ? 'scale-110' : ''}`}
                  aria-label={`Step ${index + 1}: ${step.label}${index === currentStep ? ' (current)' : ''}`}
                  aria-current={index === currentStep ? 'step' : undefined}
                  disabled={index > currentStep}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300
                      ${
                        index < currentStep
                          ? 'bg-emerald-500/20 border-2 border-emerald-500'
                          : index === currentStep
                          ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                  >
                    {index < currentStep ? (
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span aria-hidden="true">{step.icon}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block transition-colors
                      ${
                        index === currentStep
                          ? 'text-emerald-400'
                          : index < currentStep
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded transition-all duration-500
                      ${index < currentStep ? 'bg-emerald-500' : 'bg-white/5'}`}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>

        {/* Form Content */}
        <Card padding="lg">
          {currentStep === 0 && <TransportForm data={formData} onChange={updateFormData} errors={errors} />}
          {currentStep === 1 && <EnergyForm data={formData} onChange={updateFormData} errors={errors} />}
          {currentStep === 2 && <FoodForm data={formData} onChange={updateFormData} errors={errors} />}
          {currentStep === 3 && <ConsumptionForm data={formData} onChange={updateFormData} errors={errors} />}
          {currentStep === 4 && <WasteForm data={formData} onChange={updateFormData} errors={errors} />}
          {currentStep === 5 && <WaterForm data={formData} onChange={updateFormData} errors={errors} />}

          {submitError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" role="alert">
              {submitError}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
            <Button
              onClick={handlePrev}
              variant="secondary"
              disabled={currentStep === 0}
            >
              ← Previous
            </Button>
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                size="lg"
              >
                Submit Assessment 🌍
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next →
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
