<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyTransaction;
use App\Services\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    /** GET /api/v1/loyalty */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $transactions = LoyaltyTransaction::with('order:id,order_code')
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(30);

        return response()->json([
            'data' => $transactions->getCollection()->map(fn(LoyaltyTransaction $tx) => [
                'id'           => $tx->id,
                'type'         => $tx->type,
                'type_label'   => $tx->type_label,
                'points'       => $tx->points,
                'description'  => $tx->description,
                'order_code'   => $tx->order?->order_code,
                'created_at'   => $tx->created_at?->toDateTimeString(),
            ]),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'total'        => $transactions->total(),
            ],
            'summary' => [
                'points'           => $user->loyalty_points,
                'point_value'      => LoyaltyService::POINT_VALUE,
                'amount_per_point' => LoyaltyService::AMOUNT_PER_POINT,
                'min_redeem'       => LoyaltyService::MIN_REDEEM_POINTS,
            ],
        ]);
    }
}
