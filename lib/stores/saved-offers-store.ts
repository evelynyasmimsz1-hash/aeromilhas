"use client";

import { create } from "zustand";
import * as savedOffersService from "@/lib/services/saved-offers";

type SavedOffersState = {
  savedOfferIds: string[];
  loaded: boolean;
  fetchSavedOfferIds: () => Promise<void>;
  toggleSaved: (offerId: string) => Promise<void>;
  reset: () => void;
};

export const useSavedOffersStore = create<SavedOffersState>()((set, get) => ({
  savedOfferIds: [],
  loaded: false,

  fetchSavedOfferIds: async () => {
    const savedOfferIds = await savedOffersService.getSavedOfferIds();
    set({ savedOfferIds, loaded: true });
  },

  toggleSaved: async (offerId) => {
    const isSaved = get().savedOfferIds.includes(offerId);
    if (isSaved) {
      await savedOffersService.unsaveOffer(offerId);
      set((state) => ({ savedOfferIds: state.savedOfferIds.filter((id) => id !== offerId) }));
    } else {
      await savedOffersService.saveOffer(offerId);
      set((state) => ({ savedOfferIds: [...state.savedOfferIds, offerId] }));
    }
  },

  reset: () => set({ savedOfferIds: [], loaded: false }),
}));
