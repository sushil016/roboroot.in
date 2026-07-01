'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart.store';
import { toast } from 'sonner';
import { ProjectComponentDetail } from '@/features/projects/types/project.types';
import type { ComponentProductType } from '@/types/marketplace.types';
import { Package, ExternalLink, ShoppingCart, CheckCircle2, Plus } from 'lucide-react';

interface ProjectComponentsProps {
  components: ProjectComponentDetail[];
  totalCost?: number;
  projectTitle: string;
}

export function ProjectComponents({ components, totalCost, projectTitle }: ProjectComponentsProps) {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [addingComponentId, setAddingComponentId] = useState<string | null>(null);

  const handleAddToCart = (pc: ProjectComponentDetail) => {
    setAddingComponentId(pc.component.id);
    
    try {
      // Convert ProjectComponentDetail to Component format expected by cart
      const component = {
        id: pc.component.id,
        slug: pc.component.slug,
        name: pc.component.name,
        sku: pc.component.sku || null,
        description: pc.component.description || null,
        typicalUseCase: pc.component.typicalUseCase || null,
        vendorLink: pc.component.vendorLink || null,
        imageUrl: pc.component.imageUrl || null,
        category: pc.component.category || 'Electronics Components',
        subcategory: pc.component.subcategory || 'General',
        productType: (pc.component.productType as ComponentProductType) || 'ELECTRONICS_COMPONENT',
        brand: pc.component.brand || null,
        tags: pc.component.tags || [],
        isBestSeller: pc.component.isBestSeller || false,
        isRobomaniacItem: pc.component.isRobomaniacItem || false,
        isSoftware: pc.component.isSoftware || false,
        unitPriceCents: pc.component.unitPriceCents,
        unitPrice: pc.component.unitPrice,
        stockQuantity: pc.component.stockQuantity,
        isActive: pc.component.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      addItem(component, pc.quantity);

      toast.success(`${pc.component.name} added to cart!`, {
        description: `Quantity: ${pc.quantity}`,
      });
    } catch (error) {
      toast.error('Failed to add component to cart');
      console.error('Error adding component to cart:', error);
    } finally {
      setAddingComponentId(null);
    }
  };

  const handleAddAllToCart = () => {
    setIsAdding(true);
    
    try {
      // Add each component to cart with the required quantity
      components.forEach((pc) => {
        // Convert ProjectComponentDetail to Component format expected by cart
        const component = {
          id: pc.component.id,
          slug: pc.component.slug,
          name: pc.component.name,
          sku: pc.component.sku || null,
          description: pc.component.description || null,
          typicalUseCase: pc.component.typicalUseCase || null,
          vendorLink: pc.component.vendorLink || null,
          imageUrl: pc.component.imageUrl || null,
          category: pc.component.category || 'Electronics Components',
          subcategory: pc.component.subcategory || 'General',
          productType: (pc.component.productType as ComponentProductType) || 'ELECTRONICS_COMPONENT',
          brand: pc.component.brand || null,
          tags: pc.component.tags || [],
          isBestSeller: pc.component.isBestSeller || false,
          isRobomaniacItem: pc.component.isRobomaniacItem || false,
          isSoftware: pc.component.isSoftware || false,
          unitPriceCents: pc.component.unitPriceCents,
          unitPrice: pc.component.unitPrice,
          stockQuantity: pc.component.stockQuantity,
          isActive: pc.component.isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        addItem(component, pc.quantity);
      });

      toast.success(`All components for ${projectTitle} added to cart!`, {
        description: `${components.length} component${components.length > 1 ? 's' : ''} added`,
      });
    } catch (error) {
      toast.error('Failed to add components to cart');
      console.error('Error adding components to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!components || components.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Required Components</h2>
        </div>
        <p className="text-muted-foreground">
          No components have been added to this project yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Required Components</h2>
          <Badge variant="secondary">{components.length}</Badge>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-2xl font-bold">
            ₹{totalCost?.toFixed(2) || components.reduce((sum, pc) => sum + pc.totalCost, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Components List */}
      <div className="space-y-4 mb-6">
        {components.map((projectComponent) => {
          const { component, quantity, notes, totalCost } = projectComponent;
          
          return (
            <div
              key={projectComponent.id}
              className="flex gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              {/* Component Image */}
              <Link
                href={`/components/${component.slug}`}
                className="flex-shrink-0 relative w-20 h-20 rounded-md overflow-hidden bg-muted group"
              >
                {component.imageUrl ? (
                  <Image
                    src={component.imageUrl}
                    alt={component.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </Link>

              {/* Component Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link
                    href={`/components/${component.slug}`}
                    className="font-semibold hover:text-primary transition-colors line-clamp-1"
                  >
                    {component.name}
                  </Link>
                  {component.sku && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {component.sku}
                    </Badge>
                  )}
                </div>

                {component.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {component.description}
                  </p>
                )}

                {notes && (
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-400">{notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantity: </span>
                      <span className="font-semibold">{quantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unit Price: </span>
                      <span className="font-semibold">₹{component.unitPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-bold text-primary">₹{totalCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {component.stockQuantity > 0 ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        In Stock ({component.stockQuantity})
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Out of Stock
                      </Badge>
                    )}

                    {component.vendorLink && (
                      <Link
                        href={component.vendorLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        Vendor
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    
                    {/* Add Individual Component to Cart Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToCart(projectComponent)}
                      disabled={addingComponentId === component.id || component.stockQuantity === 0}
                      className="ml-2"
                    >
                      {addingComponentId === component.id ? (
                        'Adding...'
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add All to Cart Button */}
      <Button
        onClick={handleAddAllToCart}
        disabled={isAdding}
        size="lg"
        className="w-full"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {isAdding ? 'Adding...' : `Add All Components to Cart (₹${totalCost?.toFixed(2) || components.reduce((sum, pc) => sum + pc.totalCost, 0).toFixed(2)})`}
      </Button>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        All {components.length} components will be added to your cart with the correct quantities
      </p>
    </Card>
  );
}
