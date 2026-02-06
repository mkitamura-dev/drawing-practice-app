<?php

namespace App\Http\Controllers;

use App\Models\Drawing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DrawingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->query('limit', 20), 50);
        $limit = max($limit, 1);

        $drawings = Drawing::query()
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Drawing $drawing) => [
                'id' => $drawing->id,
                'prompt' => $drawing->prompt,
                'prompt_type' => $drawing->prompt_type,
                'time_limit_seconds' => $drawing->time_limit_seconds,
                'image_url' => url("/api/drawings/{$drawing->id}/image"),
                'created_at' => $drawing->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'data' => $drawings,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => ['required', 'string', 'max:255'],
            'prompt_type' => ['required', 'in:today,random'],
            'time_limit_seconds' => ['required', 'integer', 'min:10', 'max:3600'],
            'image' => ['required', 'image', 'max:10240'],
        ]);

        $path = $request->file('image')->store('drawings', 'local');

        $drawing = Drawing::query()->create([
            'prompt' => $validated['prompt'],
            'prompt_type' => $validated['prompt_type'],
            'time_limit_seconds' => $validated['time_limit_seconds'],
            'image_path' => $path,
        ]);

        return response()->json([
            'id' => $drawing->id,
            'image_url' => url("/api/drawings/{$drawing->id}/image"),
        ], 201);
    }

    public function image(Drawing $drawing): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($drawing->image_path), 404);

        return Storage::disk('local')->response($drawing->image_path);
    }
}
