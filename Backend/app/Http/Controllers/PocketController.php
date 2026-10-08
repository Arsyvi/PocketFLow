<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pocket;

class PocketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pockets = Pocket::where('user_id',auth()->id())->latest()->get();

        return response()->json($pockets);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|in:wallet,piggy,alert,briefcase,cart,home,plane,heart',
            'color' => 'nullable|string|in:blue,green,yellow,purple,red,cyan',
        ]);

        $pocket = Pocket::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'icon' => $validated['icon'] ?? null,
            'color' => $validated['color'] ?? null,
            'balance' => 0,
        ]);

        return response()->json([
            'message' => 'Pocket Berhasil dibuat',
            'data' => $pocket,
        ],201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Pocket $pocket)
    {
        if ($pocket->user_id !== auth()->id()) {
            abort(404);
        }

        return response()->json($pocket);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pocket $pocket)
    {
        if ($pocket->user_id !== auth()->id()) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|in:wallet,piggy,alert,briefcase,cart,home,plane,heart',
            'color' => 'nullable|string|in:blue,green,yellow,purple,red,cyan',
        ]);

        $pocket->update([
            'name' => $validated['name'],
            'icon' => $validated['icon'] ?? null,
            'color' => $validated['color'] ?? null,
        ]);

        return response()->json([
            'message' => 'Pocket berhasil diperbarui',
            'data' => $pocket
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pocket $pocket)
    {
        if ($pocket->user_id !== auth()->id()) {
            abort(404);
        }

        $pocket->delete();

        return response()->json([
            'message' => 'Pocket berhasil dihapus',
        ]);
    }
}
