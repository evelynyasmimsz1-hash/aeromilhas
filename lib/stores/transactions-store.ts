"use client";

import { create } from "zustand";
import type { MilesTransaction } from "@/types";
import * as transactionsService from "@/lib/services/transactions";

type TransactionsState = {
  transactions: MilesTransaction[];
  loaded: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<MilesTransaction, "id">) => Promise<void>;
  reset: () => void;
};

export const useTransactionsStore = create<TransactionsState>()((set) => ({
  transactions: [],
  loaded: false,

  fetchTransactions: async () => {
    const transactions = await transactionsService.getTransactions();
    set({ transactions, loaded: true });
  },

  addTransaction: async (transaction) => {
    const created = await transactionsService.addTransaction(transaction);
    set((state) => ({ transactions: [created, ...state.transactions] }));
  },

  reset: () => set({ transactions: [], loaded: false }),
}));
