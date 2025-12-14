<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Auditoría</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1e3a5f;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            color: #1e3a5f;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
            font-size: 12px;
        }
        .filters {
            background-color: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .filters h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #1e3a5f;
        }
        .filters p {
            margin: 5px 0;
            font-size: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #1e3a5f;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
        }
        td {
            padding: 6px;
            border-bottom: 1px solid #ddd;
            font-size: 8px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
        }
        .badge-success {
            background-color: #d4edda;
            color: #155724;
        }
        .badge-failed {
            background-color: #f8d7da;
            color: #721c24;
        }
        .badge-warning {
            background-color: #fff3cd;
            color: #856404;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Auditoría del Sistema</h1>
        <p>Generado el: {{ date('d/m/Y H:i:s') }}</p>
        <p>Total de registros: {{ $logs->count() }}</p>
    </div>

    @if(!empty($filters))
    <div class="filters">
        <h3>Filtros Aplicados:</h3>
        @if(isset($filters['type']) && $filters['type'] !== 'all')
            <p><strong>Tipo de acción:</strong> {{ $filters['type'] }}</p>
        @endif
        @if(isset($filters['date']))
            <p><strong>Fecha:</strong> {{ $filters['date'] }}</p>
        @endif
        @if(isset($filters['date_from']))
            <p><strong>Desde:</strong> {{ $filters['date_from'] }}</p>
        @endif
        @if(isset($filters['date_to']))
            <p><strong>Hasta:</strong> {{ $filters['date_to'] }}</p>
        @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Fecha/Hora</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Acción</th>
                <th>Tipo Recurso</th>
                <th>ID Recurso</th>
                <th>IP</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logs as $log)
            <tr>
                <td>{{ $log->id }}</td>
                <td>{{ $log->created_at->format('d/m/Y H:i:s') }}</td>
                <td>{{ $log->user_name ?? 'N/A' }}</td>
                <td>{{ $log->user_email ?? 'N/A' }}</td>
                <td>{{ $log->action }}</td>
                <td>{{ $log->resource_type }}</td>
                <td>{{ $log->resource_id ?? 'N/A' }}</td>
                <td>{{ $log->ip_address ?? 'N/A' }}</td>
                <td>
                    <span class="badge badge-{{ $log->status === 'success' ? 'success' : ($log->status === 'failed' ? 'failed' : 'warning') }}">
                        {{ $log->status }}
                    </span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px;">
                    No se encontraron registros de auditoría
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Este es un documento generado automáticamente por el sistema de auditoría.</p>
        <p>© {{ date('Y') }} - Sistema de Psicología ISTTA</p>
    </div>
</body>
</html>




