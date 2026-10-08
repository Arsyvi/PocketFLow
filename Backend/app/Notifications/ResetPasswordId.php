<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordId extends Notification
{
    public function __construct(public string $token) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $url = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/')
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Atur Ulang Kata Sandi PocketFlow')
            ->greeting('Halo ' . ($notifiable->name ?? '') . '!')
            ->line('Kami menerima permintaan untuk mengatur ulang kata sandi akunmu.')
            ->action('Atur Ulang Kata Sandi', $url)
            ->line('Link ini kedaluwarsa dalam 60 menit.')
            ->line('Abaikan email ini jika kamu tidak merasa memintanya.');
    }
}
