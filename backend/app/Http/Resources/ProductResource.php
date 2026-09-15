<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'name'                 => $this->name,
            'slug'                 => $this->slug,
            'sku'                  => $this->sku,
            'short_description'    => $this->short_description,
            'description'          => $this->when(
                $request->routeIs('*.products.show') || $request->is('api/v1/products/*'),
                $this->description
            ),
            'price'                => (float) $this->price,
            'sale_price'           => $this->sale_price ? (float) $this->sale_price : null,
            'current_price'        => (float) $this->current_price,
            'discount_percentage'  => $this->discount_percentage,
            'is_flash_sale'        => $this->is_flash_sale,
            'flash_sale_price'     => $this->flash_sale_price ? (float) $this->flash_sale_price : null,
            'flash_sale_end_at'    => $this->flash_sale_end_at?->toISOString(),
            'stock_quantity'       => $this->stock_quantity,
            'unit'                 => $this->unit,
            'origin'               => $this->origin,
            'sold_count'           => $this->sold_count,
            'view_count'           => $this->view_count,
            'avg_rating'           => (float) $this->avg_rating,
            'review_count'         => $this->review_count,
            'is_active'            => $this->is_active,
            'is_featured'          => $this->is_featured,
            'meta_title'           => $this->meta_title,
            'meta_description'     => $this->meta_description,
            'category'             => new CategoryResource($this->whenLoaded('category')),
            'primary_image'        => $this->whenLoaded('primaryImage', function () {
                return $this->primaryImage ? [
                    'url'     => $this->primaryImage->image_url,
                    'alt'     => $this->primaryImage->alt_text ?? $this->name,
                ] : null;
            }),
            'images'               => $this->whenLoaded('images', function () {
                return $this->images->map(fn($img) => [
                    'id'         => $img->id,
                    'url'        => $img->image_url,
                    'alt'        => $img->alt_text ?? $this->name,
                    'is_primary' => $img->is_primary,
                    'sort_order' => $img->sort_order,
                ]);
            }),
            'variants'             => $this->whenLoaded('variants', function () {
                return $this->variants->map(fn($v) => [
                    'id'            => $v->id,
                    'name'          => $v->name,
                    'value'         => $v->value,
                    'price_adjust'  => (float) $v->price_adjust,
                    'stock'         => $v->stock,
                    'sku'           => $v->sku,
                ]);
            }),
            'created_at'           => $this->created_at?->toDateString(),
        ];
    }
}
