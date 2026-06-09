export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Assessment {
  id: number;
  userId: number;
  vehicleType: string;
  travelKmPerWeek: number;
  publicTransportKmPerWeek: number;
  flightsPerYear: number;
  electricityKwhPerMonth: number;
  acHoursPerDay: number;
  applianceUsage: string;
  dietType: string;
  onlineOrdersPerMonth: number;
  clothingItemsPerMonth: number;
  electronicsPerYear: number;
  recyclingPercentage: number;
  wasteBagsPerWeek: number;
  waterLitersPerDay: number;
  dailyEmissionsKg: number;
  monthlyEmissionsKg: number;
  annualEmissionsKg: number;
  transportEmissionsKg: number;
  energyEmissionsKg: number;
  foodEmissionsKg: number;
  consumptionEmissionsKg: number;
  wasteEmissionsKg: number;
  waterEmissionsKg: number;
  createdAt: string;
}

export interface SustainabilityScore {
  id: number;
  overallScore: number;
  transportScore: number;
  energyScore: number;
  foodScore: number;
  consumptionScore: number;
  wasteScore: number;
  createdAt: string;
}

export interface Recommendation {
  id: number;
  category: string;
  title: string;
  description: string;
  co2ReductionKg: number;
  difficulty: string;
  financialImpact: string;
  annualSavingsUsd: number;
  priority: number;
  isCompleted: boolean;
}

export interface Goal {
  id: number;
  title: string;
  targetReductionKg: number;
  targetDate: string;
  currentReductionKg: number;
  status: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

export interface DashboardSummary {
  assessment: Assessment | null;
  score: SustainabilityScore | null;
  recommendations: Recommendation[];
  trends: TrendPoint[];
  goals: Goal[];
  insights: {
    largestSource: string;
    comparison: string;
    insights: string[];
  };
}

export interface TrendPoint {
  period: string;
  emissions: number;
  score: number;
}

export interface AssessmentFormData {
  vehicleType: string;
  travelKmPerWeek: number;
  publicTransportKmPerWeek: number;
  flightsPerYear: number;
  electricityKwhPerMonth: number;
  acHoursPerDay: number;
  applianceUsage: string;
  dietType: string;
  onlineOrdersPerMonth: number;
  clothingItemsPerMonth: number;
  electronicsPerYear: number;
  recyclingPercentage: number;
  wasteBagsPerWeek: number;
  waterLitersPerDay: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GoalFormData {
  title: string;
  targetReductionKg: number;
  targetDate: string;
}
