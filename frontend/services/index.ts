// Re-export des services
export { default as apiService } from './api';
export { default as productService } from './products';
export { default as categoryService } from './categories';
export { default as tenantService } from './tenant.service';

// Re-export des types depuis les services
export type { Product, ProductCreateData, ProductUpdateData } from './products';
export type { Tenant } from './tenants'; 