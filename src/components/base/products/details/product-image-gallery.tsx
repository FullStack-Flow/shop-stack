import { Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProductThumbnail from './product-thumnail';

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  className?: string;
}
export default function ProductImageGallery({
  images,
  className,
}: ProductImageGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const activeImage = images[activeImageIndex];

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted">
        <span className="text-muted-foreground">No images available</span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Main Image */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-lg border bg-white">
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className="relative h-full w-full overflow-hidden border-0 bg-transparent p-0"
          aria-label={isZoomed ? 'Zoom out image' : 'Zoom in image'}
        >
          <img
            src={activeImage.url}
            alt={activeImage.alt}
            className={cn(
              'h-full w-full object-cover object-center transition-transform duration-500',
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            )}
          />
        </button>

        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => setIsZoomed(!isZoomed)}
          aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-4">
          {images.map((image, index) => (
            <ProductThumbnail
              key={image.id}
              image={image.url}
              alt={image.alt}
              isActive={index === activeImageIndex}
              onClick={() => {
                setActiveImageIndex(index);
                setIsZoomed(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
