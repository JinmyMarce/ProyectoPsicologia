<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class AuditLogController extends Controller
{
    /**
     * Obtener todos los logs de auditoría con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = AuditLog::with('user')
                ->orderBy('created_at', 'desc');

            // Filtro por tipo de acción
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('action', $request->type);
            }

            // Filtro por fecha
            if ($request->has('date') && $request->date) {
                $query->whereDate('created_at', $request->date);
            }

            // Filtro por usuario
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Filtro por tipo de recurso
            if ($request->has('resource_type')) {
                $query->where('resource_type', $request->resource_type);
            }

            // Filtro por rango de fechas
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Paginación
            $perPage = $request->get('per_page', 50);
            $logs = $query->paginate($perPage);

            // Formatear los datos para la respuesta
            $formattedLogs = $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user_id' => $log->user_id,
                    'user_name' => $log->user_name,
                    'user_email' => $log->user_email,
                    'action' => $log->action,
                    'resource_type' => $log->resource_type,
                    'resource_id' => $log->resource_id,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'details' => $log->details,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                    'status' => $log->status,
                    'created_at' => $log->created_at->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedLogs,
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error obteniendo logs de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los logs de auditoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un log específico
     */
    public function show($id)
    {
        try {
            $log = AuditLog::with('user')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $log->id,
                    'user_id' => $log->user_id,
                    'user_name' => $log->user_name,
                    'user_email' => $log->user_email,
                    'action' => $log->action,
                    'resource_type' => $log->resource_type,
                    'resource_id' => $log->resource_id,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'details' => $log->details,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                    'status' => $log->status,
                    'created_at' => $log->created_at->toISOString(),
                    'updated_at' => $log->updated_at->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error obteniendo log de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Log de auditoría no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Obtener estadísticas de auditoría
     */
    public function stats(Request $request)
    {
        try {
            $query = AuditLog::query();

            // Filtro por rango de fechas
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $totalLogs = $query->count();
            $actionsCount = $query->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->pluck('count', 'action')
                ->toArray();
            
            $resourceTypesCount = $query->selectRaw('resource_type, COUNT(*) as count')
                ->groupBy('resource_type')
                ->pluck('count', 'resource_type')
                ->toArray();

            $statusCount = $query->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            $topUsers = $query->selectRaw('user_id, user_name, user_email, COUNT(*) as count')
                ->whereNotNull('user_id')
                ->groupBy('user_id', 'user_name', 'user_email')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'user_id' => $item->user_id,
                        'user_name' => $item->user_name,
                        'user_email' => $item->user_email,
                        'count' => $item->count,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'total_logs' => $totalLogs,
                    'actions_count' => $actionsCount,
                    'resource_types_count' => $resourceTypesCount,
                    'status_count' => $statusCount,
                    'top_users' => $topUsers,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error obteniendo estadísticas de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar logs a PDF
     */
    public function exportPDF(Request $request)
    {
        try {
            $query = AuditLog::with('user')->orderBy('created_at', 'desc');

            // Aplicar filtros
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('action', $request->type);
            }
            if ($request->has('date') && $request->date) {
                $query->whereDate('created_at', $request->date);
            }
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $logs = $query->limit(1000)->get(); // Limitar a 1000 registros para PDF

            $html = view('audit-logs-pdf', [
                'logs' => $logs,
                'filters' => $request->all(),
            ])->render();

            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('a4', 'landscape');
            $filename = 'audit-log-' . date('Y-m-d_His') . '.pdf';

            return $pdf->download($filename);
        } catch (\Exception $e) {
            Log::error('Error exportando PDF de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar logs a Excel
     */
    public function exportExcel(Request $request)
    {
        try {
            $query = AuditLog::with('user')->orderBy('created_at', 'desc');

            // Aplicar filtros
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('action', $request->type);
            }
            if ($request->has('date') && $request->date) {
                $query->whereDate('created_at', $request->date);
            }
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $logs = $query->limit(10000)->get(); // Limitar a 10000 registros para Excel

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Logs de Auditoría');

            // Encabezados
            $headers = ['ID', 'Fecha', 'Usuario', 'Email', 'Acción', 'Tipo de Recurso', 'ID Recurso', 'IP', 'Estado', 'Detalles'];
            $sheet->fromArray($headers, null, 'A1');

            // Estilo de encabezados
            $headerStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1e3a5f']
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ];
            $sheet->getStyle('A1:J1')->applyFromArray($headerStyle);

            // Datos
            $row = 2;
            foreach ($logs as $log) {
                $sheet->setCellValue('A' . $row, $log->id);
                $sheet->setCellValue('B' . $row, $log->created_at->format('Y-m-d H:i:s'));
                $sheet->setCellValue('C' . $row, $log->user_name ?? 'N/A');
                $sheet->setCellValue('D' . $row, $log->user_email ?? 'N/A');
                $sheet->setCellValue('E' . $row, $log->action);
                $sheet->setCellValue('F' . $row, $log->resource_type);
                $sheet->setCellValue('G' . $row, $log->resource_id ?? 'N/A');
                $sheet->setCellValue('H' . $row, $log->ip_address ?? 'N/A');
                $sheet->setCellValue('I' . $row, $log->status);
                $sheet->setCellValue('J' . $row, $log->details ?? '');
                $row++;
            }

            // Ajustar ancho de columnas
            foreach (range('A', 'J') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // Bordes
            $borderStyle = [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'CCCCCC'],
                    ],
                ],
            ];
            $sheet->getStyle('A1:J' . ($row - 1))->applyFromArray($borderStyle);

            $writer = new Xlsx($spreadsheet);
            $filename = 'audit-log-' . date('Y-m-d_His') . '.xlsx';
            $tempFile = tempnam(sys_get_temp_dir(), $filename);
            $writer->save($tempFile);

            return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            Log::error('Error exportando Excel de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

