// Default automotive images based on category for Action Protection
export const getDefaultProductImage = (categoryId: number, productName: string = ''): string => {
  // Automotive protection service images from Unsplash
  const defaultImages = {
    // Thermal Insulator - Category 1
    1: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400'
    ],
    // Thermal Insulation Protection - Category 2  
    2: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400'
    ],
    // Protection - Category 3
    3: [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400'
    ],
    // Polish - Category 4
    4: [
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400'
    ],
    // Painting and Vacuuming - Category 5
    5: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400'
    ]
  };

  // Get category images or fallback to general automotive images
  const categoryImages = defaultImages[categoryId as keyof typeof defaultImages] || defaultImages[1];
  
  // Use product name hash to consistently pick the same image for the same product
  const hash = productName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const imageIndex = Math.abs(hash) % categoryImages.length;
  return categoryImages[imageIndex];
};

// Fallback image if category not found
export const getFallbackImage = (): string => {
  return 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400';
};