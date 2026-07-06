/**
 * Component Card
 * Displays a component in a card format with image, name, price, and add to cart
 */

'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { Component } from '@/lib/types/marketplace.types';
import { useCartStore, formatPrice } from '@/lib/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlistStore } from '@/lib/store/wishlistStore';

interface ComponentCardProps {
  component: Component;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const itemQuantity = useCartStore((state) => state.getItemQuantity(component.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(component.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (component.stockQuantity === 0) {
      toast.error('Out of stock');
      return;
    }

    addItem(component, 1);
    toast.success('Added to cart!', {
      description: component.name,
    });
  };

  const isOutOfStock = component.stockQuantity === 0;
  const isLowStock = component.stockQuantity > 0 && component.stockQuantity <= 10;

  return (
    <Link href={`/components/${component.id}`}>
      <Card className="card-hover-bar h-full cursor-pointer group transition border border-[#D2D2D0] bg-[#F2F2F0]">
        <CardContent className="p-4">
          {/* Image */}
          <div className="relative aspect-square mb-4 bg-muted rounded-lg overflow-hidden">
            <button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleWishlist(component);
                toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
              }}
              className={`absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow ${
                isWishlisted ? 'bg-[#1CA2D1] text-white' : 'bg-[#F2F2F0] text-zinc-700'
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            {component.imageUrl ? (
              <img
                src={component.imageUrl}
                alt={component.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            
            {/* Stock Badge */}
            {isOutOfStock && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                Out of Stock
              </div>
            )}
            {isLowStock && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md">
                Low Stock
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-zinc-950">
            {component.name}
          </h3>

          {/* SKU */}
          {component.sku && (
            <p className="text-xs text-muted-foreground mb-2">
              SKU: {component.sku}
            </p>
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#F2F2F0] px-2 py-1 text-xs font-semibold text-zinc-700">
              {component.subcategory || component.category}
            </span>
            {component.isBestSeller && (
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                Best seller
              </span>
            )}
            {component.isRobomaniacItem && (
              <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
                Robomaniac
              </span>
            )}
          </div>

          {/* Description */}
          {component.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {component.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-[#1CA2D1]">
              {formatPrice(component.unitPriceCents)}
            </span>
            <span className="text-sm text-muted-foreground">per unit</span>
          </div>
          <p className="mb-3 text-xs font-black text-emerald-700">Inc. GST</p>

          {/* Stock Info */}
          <p className="text-xs text-muted-foreground mb-4">
            {isOutOfStock ? 'Out of stock' : `${component.stockQuantity} in stock`}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full btn-underline-white bg-[#1CA2D1] text-white hover:opacity-90"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {itemQuantity > 0 ? `In Cart (${itemQuantity})` : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
