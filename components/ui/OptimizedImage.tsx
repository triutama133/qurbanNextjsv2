import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  onLoadComplete?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  onLoadComplete,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoadComplete?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${fill ? `object-${objectFit}` : ''}`}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

// Avatar component dengan fallback
interface AvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallbackText?: string
  className?: string
}

export function Avatar({
  src,
  alt,
  size = 'md',
  fallbackText,
  className = '',
}: AvatarProps) {
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg',
  }

  const fallback = fallbackText || alt.charAt(0).toUpperCase()

  if (hasError || !src) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          bg-emerald-100 text-emerald-700 
          rounded-full flex items-center justify-center 
          font-semibold ${className}
        `}
      >
        {fallback}
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        objectFit="cover"
        onLoadComplete={() => setHasError(false)}
      />
    </div>
  )
}

// Hero image component dengan multiple sources untuk responsive
interface HeroImageProps {
  src: string
  mobileSrc?: string
  alt: string
  className?: string
  priority?: boolean
}

export function HeroImage({ 
  src, 
  mobileSrc, 
  alt, 
  className = '',
  priority = true 
}: HeroImageProps) {
  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
      />
      
      {mobileSrc && (
        <OptimizedImage
          src={mobileSrc}
          alt={alt}
          fill
          priority={priority}
          quality={85}
          className="object-cover md:hidden"
        />
      )}
    </div>
  )
}

// Generate blur placeholder untuk images
export function generateBlurDataURL(width = 8, height = 8) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// Gallery component dengan lazy loading
interface GalleryProps {
  images: Array<{
    src: string
    alt: string
    width?: number
    height?: number
  }>
  className?: string
}

export function Gallery({ images, className = '' }: GalleryProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {images.map((image, index) => (
        <div key={index} className="relative aspect-square">
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            fill
            priority={index < 6} // Prioritize first 6 images
            quality={75}
            placeholder="blur"
            blurDataURL={generateBlurDataURL()}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  )
}