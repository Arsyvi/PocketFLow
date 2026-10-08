<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\GoalContribution;
use App\Models\Pocket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GoalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $goals = Goal::where('user_id', auth()->id())
            ->latest()
            ->get()
        ;

        return response()->json($goals);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
       //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|min:3|max:225',
            'target_amount' => 'required|numeric|min:1',
            'current_amount' => 'nullable|numeric|min:0',
        ]);

         $goal = Goal::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'target_amount' => $request->target_amount,
            'current_amount' => min($request->current_amount ?? 0, $request->target_amount),
        ]);

        return response()->json($goal, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Goal $goal)
    {
        if($goal->user_id !== auth()->id() ) {
            abort(404);
        }
        
        return response()->json($goal);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Goal $goal)
    {
        if($goal->user_id !== auth()->id() ) {
            abort(404);
        }

         $request->validate([
            'name' => 'required|string|min:3|max:225',
            'target_amount' => 'required|numeric|min:1',
        ]);

        $goal->update([
            'name' => $request->name,
            'target_amount' => $request->target_amount,
        ]);

        return response()->json($goal);
    }


    // Untuk edit jumlah uang tabungan.
    // Bisa transfer dari 1 pocket (pocket_id + amount),
    // dari banyak pocket sekaligus (sources[]),
    // atau tambah langsung / legacy (amount saja).
    public function editAmountGoal(Request $request, Goal $goal) {
        if($goal->user_id !== auth()->id() ) {
            abort(404);
        }

        $request->validate([
            'amount' => 'nullable|numeric|min:1',
            'pocket_id' => 'nullable|integer|exists:pockets,id',
            'sources' => 'nullable|array|min:1|max:20',
            'sources.*.pocket_id' => 'required|integer|exists:pockets,id',
            'sources.*.amount' => 'required|numeric|min:1|max:999999999999',
        ]);

        $remaining = $goal->target_amount - $goal->current_amount;
        if ($remaining <= 0) {
            return response()->json([
                'message' => 'Goal sudah tercapai',
            ], 422);
        }

        // Mode multi-pocket: [{pocket_id, amount}, ...]
        if (is_array($request->sources) && count($request->sources) > 0) {
            // Gabung duplikat pocket yang sama
            $merged = [];
            foreach ($request->sources as $source) {
                $pid = (int) $source['pocket_id'];
                $merged[$pid] = ($merged[$pid] ?? 0) + $source['amount'];
            }

            $pockets = Pocket::whereIn('id', array_keys($merged))
                ->where('user_id', auth()->id())
                ->get()
                ->keyBy('id');

            if ($pockets->count() !== count($merged)) {
                abort(404);
            }

            foreach ($merged as $pid => $wanted) {
                if ($pockets[$pid]->balance < $wanted) {
                    return response()->json([
                        'message' => 'Saldo "' . $pockets[$pid]->name . '" tidak mencukupi',
                    ], 422);
                }
            }

            // Alokasi berurutan: isi sampai target penuh, sisanya tetap di pocket
            $left = $remaining;
            $takes = [];
            foreach ($merged as $pid => $wanted) {
                if ($left <= 0) break;
                $take = min($wanted, $left);
                $takes[$pid] = $take;
                $left -= $take;
            }
            $credited = array_sum($takes);
            $userId = auth()->id();

            DB::transaction(function () use ($pockets, $takes, $goal, $credited, $userId) {
                foreach ($takes as $pid => $take) {
                    $pockets[$pid]->decrement('balance', $take);
                    GoalContribution::create([
                        'user_id' => $userId,
                        'goal_id' => $goal->id,
                        'pocket_id' => $pid,
                        'amount' => $take,
                    ]);
                }
                $goal->increment('current_amount', $credited);
            });

            return response()->json([
                'message' => 'Dana berhasil dipindahkan ke goal',
                'credited' => $credited,
                'goal' => $goal->refresh(),
                'pockets' => Pocket::whereIn('id', array_keys($takes))->get(),
            ]);
        }

        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        // Hanya ambil secukupnya sampai target (kelebihan tidak hangus, tetap di pocket)
        $credited = min($request->amount, $remaining);

        // Transfer dari pocket: kurangi saldo pocket, tambah ke goal (atomik)
        if ($request->pocket_id) {
            $pocket = Pocket::where('id', $request->pocket_id)
                ->where('user_id', auth()->id())
                ->firstOrFail();

            if ($pocket->balance < $credited) {
                return response()->json([
                    'message' => 'Saldo pocket tidak mencukupi',
                ], 422);
            }

            DB::transaction(function () use ($pocket, $goal, $credited) {
                $pocket->decrement('balance', $credited);
                GoalContribution::create([
                    'user_id' => auth()->id(),
                    'goal_id' => $goal->id,
                    'pocket_id' => $pocket->id,
                    'amount' => $credited,
                ]);
                $goal->increment('current_amount', $credited);
            });

            return response()->json([
                'message' => 'Dana berhasil dipindahkan ke goal',
                'credited' => $credited,
                'goal' => $goal->refresh(),
                'pocket' => $pocket->refresh(),
            ]);
        }

        $goal->current_amount = min($goal->current_amount + $request->amount, $goal->target_amount);
        $goal->save();

        return response()->json($goal);
    }

    /**
     * Asal dana goal per pocket (untuk preview pengembalian saat hapus).
     */
    public function contributions(Goal $goal)
    {
        if($goal->user_id !== auth()->id() ) {
            abort(404);
        }

        $rows = GoalContribution::with('pocket:id,user_id,name,icon,color')
            ->where('goal_id', $goal->id)
            ->where('user_id', auth()->id())
            ->get()
            ->filter(fn ($row) => $row->pocket && $row->pocket->user_id === auth()->id())
            ->groupBy('pocket_id')
            ->map(fn ($group) => [
                'pocket_id' => $group->first()->pocket_id,
                'amount' => (string) $group->sum('amount'),
                'pocket' => $group->first()->pocket,
            ])
            ->values();

        $tracked = (float) $rows->sum('amount');
        $remainder = round((float) $goal->current_amount - $tracked, 2);

        return response()->json([
            'current_amount' => $goal->current_amount,
            'tracked' => $tracked,
            'remainder' => $remainder,
            'contributions' => $rows,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Goal $goal)
    {
        if($goal->user_id !== auth()->id() ) {
            abort(404);
        }

        $amount = (float) $goal->current_amount;

        // Goal kosong: hapus langsung, tidak perlu pocket
        if ($amount <= 0) {
            $goal->delete();

            return response()->json([
                'message' => 'Goal Berhasil Dihapus'
            ]);
        }

        // Kumpulkan refund per pocket asal yang masih ada
        $rows = GoalContribution::where('goal_id', $goal->id)
            ->where('user_id', auth()->id())
            ->get();
        $refunds = [];
        $tracked = 0;
        foreach ($rows as $row) {
            $pocket = Pocket::where('id', $row->pocket_id)
                ->where('user_id', auth()->id())
                ->first();
            if (!$pocket) continue; // pocket sumber sudah dihapus
            $refunds[$pocket->id] = ($refunds[$pocket->id] ?? 0) + (float) $row->amount;
            $tracked += (float) $row->amount;
        }

        // Sisa yang tidak terlacak (legacy / pocket sumber sudah dihapus)
        $saldoAwal = round($amount - $tracked, 2);
        if ($saldoAwal < 0) {
            $saldoAwal = 0;
        }

        DB::transaction(function () use ($goal, $refunds) {
            foreach ($refunds as $pid => $amt) {
                Pocket::where('id', $pid)->increment('balance', $amt);
            }
            $goal->delete(); // contributions ikut terhapus (cascade)
        });

        $refundedPockets = Pocket::whereIn('id', array_keys($refunds))->get()
            ->map(fn ($pocket) => [
                'pocket' => $pocket,
                'amount' => (string) $refunds[$pocket->id],
            ])
            ->values();

        return response()->json([
            'message' => 'Goal berhasil dihapus, dana setoran dikembalikan ke pocket',
            'refunded' => $tracked,
            'refunds' => $refundedPockets,
            'saldo_awal' => $saldoAwal,
            'remainder' => $saldoAwal,
            'remainder_pocket' => null,
        ]);
    }
}
