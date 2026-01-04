const config = {
  magentoEndpoint: 'https://www.crafter.rs/graphql',
  // magentoEndpoint: 'https://magento.test/graphql',
  magentoVersion: 247,
  canonicalBaseUrl: 'http://localhost:3000',
   mediaUrl: 'https://www.crafter.rs/media',
   

  productFiltersPro: true,
  productFiltersLayout: 'SIDEBAR',

  storefront: [
    {
      locale: 'en',
      magentoStoreCode: 'default',
      defaultLocale: true,
    },
  ],
}

module.exports = config
