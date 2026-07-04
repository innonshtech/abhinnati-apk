import { create } from 'zustand';
import { Service } from '../api/mockData';

interface BookingState {
  selectedVendorId: string | null;
  selectedVendorName: string | null;
  selectedService: Service | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedTime: string | null; // HH:MM
  notes: string;
  
  setBookingVendor: (vendorId: string, vendorName: string) => void;
  setBookingService: (service: Service) => void;
  setBookingDateTime: (date: string, time: string) => void;
  setNotes: (notes: string) => void;
  clearBookingState: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedVendorId: null,
  selectedVendorName: null,
  selectedService: null,
  selectedDate: null,
  selectedTime: null,
  notes: '',

  setBookingVendor: (vendorId, vendorName) => {
    set({ selectedVendorId: vendorId, selectedVendorName: vendorName });
  },

  setBookingService: (service) => {
    set({ selectedService: service });
  },

  setBookingDateTime: (date, time) => {
    set({ selectedDate: date, selectedTime: time });
  },

  setNotes: (notes) => {
    set({ notes });
  },

  clearBookingState: () => {
    set({
      selectedVendorId: null,
      selectedVendorName: null,
      selectedService: null,
      selectedDate: null,
      selectedTime: null,
      notes: '',
    });
  },
}));

export default useBookingStore;
