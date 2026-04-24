import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export interface NutritionItem {
  name: string;
  amount: string;
  percentage: string;
}

export interface SoilIngredient {
  name: string;
  parts: string;
}

export interface SoilHelper {
  title?: string;
  ingredients?: SoilIngredient[];
  ph_range?: string;
  moisture_tip?: string;
  watering_tip?: string;
  drainage_tip?: string;
}

export interface PlantWarnings {
  risk_level?: 'Low' | 'Medium' | 'High' | string;
  summary?: string;
  symptoms?: string[];
  child_safety?: string;
  pet_safety?: string;
  child_note?: string;
  pet_note?: string;
}

export interface PlantReport {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  benefits: string;
  care: string;
  nutrition: NutritionItem[];
  imageBase64?: string;
  createdAt: string;
  distribution?: string;
  usageMethods?: string[];
  medicalBenefits?: string[];
  warnings?: PlantWarnings;
  soilHelper?: SoilHelper;
  communityAlerts?: string[];
}

export interface SavedPlant {
  id: string;
  userId: string;
  plantName: string;
  scientificName: string;
  description: string;
  benefits: string;
  care: string;
  nutrition: NutritionItem[];
  imageBase64?: string | null;
  savedAt: string;
}

interface PlantContextValue {
  currentReport: PlantReport | null;
  setCurrentReport: (report: PlantReport | null) => void;
}

const PlantContext = createContext<PlantContextValue | null>(null);

export function PlantProvider({ children }: { children: ReactNode }) {
  const [currentReport, setCurrentReport] = useState<PlantReport | null>(null);

  const value = useMemo(() => ({ currentReport, setCurrentReport }), [currentReport]);

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
}

export function usePlant() {
  const ctx = useContext(PlantContext);
  if (!ctx) throw new Error('usePlant must be used within PlantProvider');
  return ctx;
}
