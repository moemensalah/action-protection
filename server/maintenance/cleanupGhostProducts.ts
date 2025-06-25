// Production Ghost Product Cleanup Utility
// This script safely identifies and removes ghost/duplicate products

import { db } from "../db";
import { products, categories } from "@shared/schema";
import { eq, isNull, notInArray } from "drizzle-orm";

interface CleanupResult {
  ghostProducts: any[];
  duplicateProducts: any[];
  removedCount: number;
}

export async function analyzeGhostProducts(): Promise<CleanupResult> {
  console.log("🔍 Analyzing database for ghost products...");
  
  // Find products with missing required data
  const ghostProducts = await db
    .select()
    .from(products)
    .where(
      // Products with null names or missing category
      isNull(products.nameEn)
    );

  // Find potential duplicates (same name in same category)
  const allProducts = await db.select().from(products);
  const duplicateGroups = new Map<string, any[]>();
  
  allProducts.forEach(product => {
    if (product.nameEn && product.categoryId) {
      const key = `${product.nameEn}-${product.categoryId}`;
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      duplicateGroups.get(key)!.push(product);
    }
  });

  const duplicateProducts = Array.from(duplicateGroups.values())
    .filter(group => group.length > 1)
    .flat();

  return {
    ghostProducts,
    duplicateProducts,
    removedCount: 0
  };
}

export async function cleanupGhostProducts(dryRun: boolean = true): Promise<CleanupResult> {
  const analysis = await analyzeGhostProducts();
  
  if (dryRun) {
    console.log("🧪 DRY RUN - No changes will be made");
    console.log(`Found ${analysis.ghostProducts.length} ghost products`);
    console.log(`Found ${analysis.duplicateProducts.length} potential duplicates`);
    return analysis;
  }

  console.log("🧹 Cleaning up ghost products...");
  
  let removedCount = 0;
  
  // Remove products with missing names (clear ghosts)
  if (analysis.ghostProducts.length > 0) {
    const ghostIds = analysis.ghostProducts.map(p => p.id);
    await db.delete(products).where(
      // Only delete products that are clearly invalid
      isNull(products.nameEn)
    );
    removedCount += analysis.ghostProducts.length;
  }

  console.log(`✅ Removed ${removedCount} ghost products`);
  
  return {
    ...analysis,
    removedCount
  };
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  
  cleanupGhostProducts(dryRun)
    .then(result => {
      console.log("📊 Cleanup Results:");
      console.log(`  Ghost products: ${result.ghostProducts.length}`);
      console.log(`  Duplicate products: ${result.duplicateProducts.length}`);
      console.log(`  Removed: ${result.removedCount}`);
      
      if (dryRun && (result.ghostProducts.length > 0 || result.duplicateProducts.length > 0)) {
        console.log("");
        console.log("💡 To execute cleanup, run:");
        console.log("  tsx server/maintenance/cleanupGhostProducts.ts --execute");
      }
    })
    .catch(console.error);
}