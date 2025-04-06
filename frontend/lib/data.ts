import { Product, Category } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Leather Wallet',
    description: 'Handcrafted genuine leather wallet with multiple card slots and coin pocket',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3',
    category: 'accessories',
    featured: true,
  },
  {
    id: '2',
    name: 'Minimalist Watch',
    description: 'Elegant timepiece with a clean design and premium materials',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=2799&ixlib=rb-4.0.3',
    category: 'accessories',
    featured: true,
  },
  {
    id: '3',
    name: 'Wireless Earbuds',
    description: 'High-quality wireless earbuds with noise cancellation',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=2789&ixlib=rb-4.0.3',
    category: 'electronics',
    featured: true,
  },
  {
    id: '4',
    name: 'Cotton T-Shirt',
    description: 'Premium cotton t-shirt with a comfortable fit',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=2800&ixlib=rb-4.0.3',
    category: 'clothing',
    featured: false,
  },
  {
    id: '5',
    name: 'Laptop Backpack',
    description: 'Durable backpack with dedicated laptop compartment',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3',
    category: 'bags',
    featured: true,
  },
  {
    id: '6',
    name: 'Smart Water Bottle',
    description: 'Temperature-controlled water bottle with smartphone integration',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3',
    category: 'accessories',
    featured: false,
  },
];

export const categories: Category[] = [
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Find the perfect accessories to complement your style',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Trendy and comfortable clothing for all occasions',
  },
  {
    id: 'bags',
    name: 'Bags',
    description: 'Stylish and functional bags for every need',
  },
];