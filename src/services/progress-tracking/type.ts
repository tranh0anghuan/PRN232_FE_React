export interface ProgressTrackingEntry {
  trackingId?: number
  username: string
  trackingDate: string
  cigarettesSmoked: number
  cravingsExperienced: number
  moodRating: number
  physicalSymptoms: string
  notes: string
  moneySaved: number
  minutesExercised: number
  waterIntake: number
}

export interface ProgressSummary {
  totalDaysTracked: number
  totalCigarettesSmoked: number
  totalMoneySaved: number
  averageMoodRating: number
  smokeFreeStreak: number
  totalMinutesExercised: number
}

export interface HealthImprovement {
  id: number
  improvementType: string
  description: string
  dateAchieved: string
  isAcknowledged: boolean
}

export interface PhaseActionResponse {
  message: string
}
