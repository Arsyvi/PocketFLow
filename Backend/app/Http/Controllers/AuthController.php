<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->pockets()->createMany([
            [
                'name' => 'Uang Harian',
                'balance' => 0,
            ],
            [
                'name' => 'Tabungan',
                'balance' => 0,
            ],
            [
                'name' => 'Dana Darurat',
                'balance' => 0,
            ]
        ]);

        return response()->json([
            'message' => 'Register Berhasil!',
            'user' => $user,
        ],201);
    }

    public function login(Request $request) {
        $request->validate([
            'akun' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->akun)->orWhere('name', $request->akun)->first();

        if(!$user) {
            return response()->json([
                'message' => 'Email atau Nama Salah!',
            ],401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Password Salah!'
            ],401);
        }

        $token = $user->createToken('pocketflow-token')->plainTextToken;

        return response()->json([
            'message' => 'Login Berhasil!',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout Berhasil'
        ]);
    }

    public function updateProfile(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
        ]);

        $user = $request->user();
        $user->update(['name' => $validated['name']]);

        return response()->json([
            'message' => 'Nama berhasil diperbarui',
            'user' => $user->refresh(),
        ]);
    }

    public function changePassword(Request $request) {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Kata sandi lama salah',
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
        ])->save();

        $currentTokenId = $user->currentAccessToken()?->id;
        $user->tokens()->when($currentTokenId, fn ($query) => $query->where('id', '!=', $currentTokenId))->delete();

        return response()->json([
            'message' => 'Kata sandi berhasil diubah',
        ]);
    }

    public function forgotPassword(Request $request) {
        $request->validate([
            'email' => 'required|email',
        ]);

        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'Jika email terdaftar, link pengaturan ulang sudah dikirim. Periksa kotak masuk email kamu.',
        ]);
    }

    public function resetPassword(Request $request) {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Link pengaturan ulang tidak valid atau sudah kedaluwarsa. Minta link baru di halaman lupa kata sandi.',
            ], 422);
        }

        return response()->json([
            'message' => 'Kata sandi berhasil diubah. Silakan login dengan kata sandi baru.',
        ]);
    }
}
