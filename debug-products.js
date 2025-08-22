async function testProductLoading() {
  try {
    console.log('Testing product data loading...');
    
    // Test the homepage data loader
    const { getBatchProducts } = await import('./lib/data/products.js');
    console.log('getBatchProducts function found:', typeof getBatchProducts);
    
    const result = await getBatchProducts();
    console.log('getBatchProducts result:', {
      featured: result?.featured?.length || 0,
      new: result?.new?.length || 0
    });
    
  } catch (error) {
    console.error('Error testing product loading:', error);
  }
}

testProductLoading();
