<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PsychologistUnavailability;
use App\Models\PsychologicalSession;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class PsychologistAvailabilityController extends Controller
{
    public function __invoke($id, Request $request)
    {
        $date = $request->query('date');
        if (!$date) {
            return response()->json(['error' => 'Fecha requerida'], 400);
        }

        // Validar que sea lunes a viernes
        $carbonDate = Carbon::parse($date);
        if ($carbonDate->isWeekend()) {
            return response()->json([
                'date' => $date,
                'available_slots' => [],
                'blocked_slots' => [],
                'is_day_blocked' => true
            ]);
        }

        // Horario base: 8:00 a 14:00 cada 30 minutos
        $start = Carbon::parse($date . ' 08:00');
        $end = Carbon::parse($date . ' 14:00');
        $period = CarbonPeriod::create($start, '30 minutes', $end->subMinutes(30));
        $allSlots = [];
        foreach ($period as $slot) {
            $allSlots[] = $slot->format('H:i');
        }

        // Bloqueos del psicólogo para ese día
        $unavailabilities = PsychologistUnavailability::where('psychologist_id', $id)
            ->where('date', $date)
            ->get();
        $blockedSlots = [];
        $isDayBlocked = false;
        foreach ($unavailabilities as $block) {
            if (!$block->start_time && !$block->end_time) {
                $isDayBlocked = true;
                break;
            }
            $blockStart = $block->start_time ? Carbon::parse($date . ' ' . $block->start_time) : $start;
            $blockEnd = $block->end_time ? Carbon::parse($date . ' ' . $block->end_time) : $end;
            foreach ($allSlots as $slot) {
                $slotTime = Carbon::parse($date . ' ' . $slot);
                if ($slotTime >= $blockStart && $slotTime < $blockEnd) {
                    $blockedSlots[] = $slot;
                }
            }
        }
        if ($isDayBlocked) {
            return response()->json([
                'date' => $date,
                'available_slots' => [],
                'blocked_slots' => $allSlots,
                'is_day_blocked' => true
            ]);
        }

        // Citas ya reservadas para ese psicólogo y día
        $reservedSlots = PsychologicalSession::where('psychologist_id', $id)
            ->where('date', $date)
            ->pluck('time')
            ->toArray();

        // Calcular slots disponibles
        $availableSlots = array_values(array_diff($allSlots, $blockedSlots, $reservedSlots));

        return response()->json([
            'date' => $date,
            'available_slots' => $availableSlots,
            'blocked_slots' => array_values(array_unique(array_merge($blockedSlots, $reservedSlots))),
            'is_day_blocked' => false
        ]);
    }
}
