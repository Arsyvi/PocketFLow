<?php

namespace App\Http\Controllers;

use App\Models\Pocket;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $transactions = Transaction::with('pocket:id,name')
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return response()->json($transactions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pocket_id' => 'required|integer|exists:pockets,id',
            'type' => 'required|string|in:income,expense',
            'amount' => 'required|numeric|min:1|max:999999999999',
            'description' => 'nullable|string|max:255',
        ]);

        $pocket = Pocket::where('id', $validated['pocket_id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($validated['type'] === 'expense' && $pocket->balance < $validated['amount']) {
            return response()->json([
                'message' => 'Saldo pocket tidak mencukupi',
            ], 422);
        }

        $transaction = DB::transaction(function () use ($validated, $pocket) {
            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'pocket_id' => $pocket->id,
                'type' => $validated['type'],
                'amount' => $validated['amount'],
                'description' => $validated['description'] ?? null,
            ]);

            if ($validated['type'] === 'income') {
                $pocket->increment('balance', $validated['amount']);
            } else {
                $pocket->decrement('balance', $validated['amount']);
            }

            return $transaction->load('pocket:id,name');
        });

        return response()->json([
            'message' => $validated['type'] === 'income'
                ? 'Pemasukan berhasil dicatat'
                : 'Pengeluaran berhasil dicatat',
            'data' => $transaction,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        if ($transaction->user_id !== auth()->id()) {
            abort(404);
        }

        return response()->json($transaction->load('pocket:id,name'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        if ($transaction->user_id !== auth()->id()) {
            abort(404);
        }

        DB::transaction(function () use ($transaction) {
            $pocket = Pocket::where('id', $transaction->pocket_id)
                ->where('user_id', auth()->id())
                ->first();

            // Kembalikan saldo seperti sebelum transaksi dicatat
            if ($pocket) {
                if ($transaction->type === 'income') {
                    $pocket->decrement('balance', $transaction->amount);
                } else {
                    $pocket->increment('balance', $transaction->amount);
                }
            }

            $transaction->delete();
        });

        return response()->json([
            'message' => 'Transaksi berhasil dihapus',
        ]);
    }
}
