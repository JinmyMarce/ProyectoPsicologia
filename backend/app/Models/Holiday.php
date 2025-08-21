<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Holiday extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'date',
        'type',
        'description',
        'is_national',
        'is_regional',
        'region',
        'is_active',
        'year'
    ];

    protected $casts = [
        'date' => 'date',
        'is_national' => 'boolean',
        'is_regional' => 'boolean',
        'is_active' => 'boolean',
        'year' => 'integer'
    ];

    // Scopes para consultas comunes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeNational($query)
    {
        return $query->where('is_national', true);
    }

    public function scopeForYear($query, $year)
    {
        return $query->where('year', $year);
    }

    public function scopeForRegion($query, $region = null)
    {
        if ($region) {
            return $query->where(function($q) use ($region) {
                $q->where('is_national', true)
                  ->orWhere('region', $region);
            });
        }
        return $query->where('is_national', true);
    }

    public function scopeUpcoming($query, $days = 30)
    {
        $today = Carbon::today();
        $endDate = Carbon::today()->addDays($days);
        
        return $query->whereBetween('date', [$today, $endDate]);
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    // Métodos de conveniencia
    public function isToday()
    {
        return $this->date->isToday();
    }

    public function isPast()
    {
        return $this->date->isPast();
    }

    public function isFuture()
    {
        return $this->date->isFuture();
    }

    public function daysUntil()
    {
        return Carbon::today()->diffInDays($this->date, false);
    }

    public function getFormattedDateAttribute()
    {
        return $this->date->format('d/m/Y');
    }

    public function getFormattedDateFullAttribute()
    {
        return $this->date->format('l, d \d\e F \d\e Y');
    }

    // Métodos estáticos útiles
    public static function getHolidaysForYear($year, $region = null)
    {
        return static::active()
            ->forYear($year)
            ->forRegion($region)
            ->orderBy('date')
            ->get();
    }

    public static function getUpcomingHolidays($days = 30, $region = null)
    {
        return static::active()
            ->upcoming($days)
            ->forRegion($region)
            ->orderBy('date')
            ->get();
    }

    public static function isHoliday($date, $region = null)
    {
        $carbonDate = Carbon::parse($date);
        
        return static::active()
            ->where('date', $carbonDate->format('Y-m-d'))
            ->forRegion($region)
            ->exists();
    }

    public static function getHolidayByDate($date, $region = null)
    {
        $carbonDate = Carbon::parse($date);
        
        return static::active()
            ->where('date', $carbonDate->format('Y-m-d'))
            ->forRegion($region)
            ->first();
    }

    public static function getHolidaysInRange($startDate, $endDate, $region = null)
    {
        return static::active()
            ->inDateRange($startDate, $endDate)
            ->forRegion($region)
            ->orderBy('date')
            ->get();
    }
}







