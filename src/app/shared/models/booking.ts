export type BookingStatus =
  'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

export interface Booking {
  id: number;
  scheduledAt: string;
  address: string;
  notes?: string | null;
  total: number;
  status: BookingStatus;
  service: { id: number; title: string; durationMin: number };
  customer: { id: number; name: string; phone?: string | null };
  provider: { id: number; name: string; phone?: string | null };
  review?: { id: number; rating: number } | null;
  payment?: { status: string } | null;
}