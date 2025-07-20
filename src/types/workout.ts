export interface WorkoutSet {
  set: number;
  type: 'warm_up' | 'work';
  reps_from: number;
  reps_to: number;
  weight: number;
}

export interface Exercise {
  exercise: string;
  sets: WorkoutSet[];
  rest_between_sets: number;
}

export interface WorkoutData {
  name: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  workout_plan: {
    monday?: WorkoutData;
    tuesday?: WorkoutData;
    wednesday?: WorkoutData;
    thursday?: WorkoutData;
    friday?: WorkoutData;
    saturday?: WorkoutData;
    sunday?: WorkoutData;
  };
}