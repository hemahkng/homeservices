
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface BookingPaymentTransaction {
  id: number;
  txnId: string;
  amount: number;
  verifiedAmount: number | null;
  status: string;
  createdAt: string;
  verifiedAt: string | null;
}

export interface BookingPayment {
  status: string;
  amount: number;
  paidAmount: number;
  transactions: BookingPaymentTransaction[];
}

export interface Booking {
  id: number;
  scheduledAt: string;
  address: string;
  notes?: string | null;
  total: number;
  status: BookingStatus;
  service: {
    id: number;
    title: string;
    durationMin: number;
  };
  customer: {
    id: number;
    name: string;
    phone?: string | null;
  };
  provider: {
    id: number;
    name: string;
    phone?: string | null;
  };
  review?: {
    id: number;
    rating: number;
  } | null;
  payment?: BookingPayment | null;
}
