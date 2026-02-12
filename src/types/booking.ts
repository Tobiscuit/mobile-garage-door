export interface BookingFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress: string;
  guestPassword?: string;
  issueDescription: string;
  urgency: 'standard' | 'emergency';
  scheduledTime: string;
}

export type BookingStep = 0 | 1 | 2 | 3;
