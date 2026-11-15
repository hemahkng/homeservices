export interface Service {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  durationMin: number;
  category: { id: number; name: string };
  provider: {
    id: number;
    name: string;
    providerProfile?: { city: string; ratingAvg: number; experienceYears: number } | null;
  };
}