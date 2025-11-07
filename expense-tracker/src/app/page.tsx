"use client";

import { useEffect, useMemo, useState } from 'react';

type Expense = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: string;
  note: string;
};

const STORAGE_KEY = 'et_expenses_v1';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
}

function todayIsoDate(): string {
  const now = new Date();
  const tzOffset = new Date(now.getTime() - now.getTimezoneOffset() * 60000); // local date in ISO
  return tzOffset.toISOString().slice(0, 10);
}

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayIsoDate());

  // Form state
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(todayIsoDate());

  // Load persisted data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Expense[];
        if (Array.isArray(parsed)) setExpenses(parsed);
      }
    } catch (_) {
      // ignore
    }
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (_) {
      // ignore
    }
  }, [expenses]);

  const expensesForSelectedDate = useMemo(() => {
    return expenses
      .filter((e) => e.date === selectedDate)
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [expenses, selectedDate]);

  const totalForSelectedDate = useMemo(() => {
    return expensesForSelectedDate.reduce((sum, e) => sum + e.amount, 0);
  }, [expensesForSelectedDate]);

  function resetForm() {
    setAmount('');
    setCategory('General');
    setNote('');
    setDate(selectedDate);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!isFinite(parsedAmount) || parsedAmount <= 0) return;

    const newExpense: Expense = {
      id: String(Date.now()),
      date,
      amount: Math.round(parsedAmount * 100) / 100,
      category: category.trim() || 'General',
      note: note.trim(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    if (date === selectedDate) {
      // leave selected date, but clear inputs
    } else {
      setSelectedDate(date);
    }
    resetForm();
  }

  function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  const presetCategories = [
    'General',
    'Food',
    'Coffee',
    'Transport',
    'Groceries',
    'Bills',
    'Fun',
    'Health',
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Daily Expense Tracker</h1>
      </header>

      {/* Date selector */}
      <section className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 p-4">
        <label className="block text-sm font-medium mb-1">Viewing date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setDate(e.target.value);
          }}
          className="w-full max-w-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Total: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalForSelectedDate)}</span>
        </div>
      </section>

      {/* Add expense */}
      <section className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 p-4">
        <h2 className="text-sm font-medium mb-3">Add expense</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {presetCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Custom">Custom...</option>
          </select>
          {category === 'Custom' ? (
            <input
              type="text"
              placeholder="Category"
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          ) : (
            <input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <button
            type="submit"
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
          >
            Add
          </button>
        </form>
      </section>

      {/* List */}
      <section className="rounded-xl border border-gray-200/60 dark:border-gray-800/60">
        <div className="p-4 border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
          <h2 className="text-sm font-medium">Expenses on {selectedDate}</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">{expensesForSelectedDate.length} item(s)</span>
        </div>
        {expensesForSelectedDate.length === 0 ? (
          <div className="p-6 text-sm text-gray-600 dark:text-gray-400">No expenses yet for this date.</div>
        ) : (
          <ul className="divide-y divide-gray-200/60 dark:divide-gray-800/60">
            {expensesForSelectedDate.map((e) => (
              <li key={e.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{e.category}</div>
                  {e.note && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{e.note}</div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold tabular-nums">{formatCurrency(e.amount)}</div>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-xs rounded-md border border-red-200/60 dark:border-red-900/60 px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="text-center text-xs text-gray-500">Data is stored locally in your browser.</footer>
    </div>
  );
}
