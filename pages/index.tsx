import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import type { CmsPageFragment } from '@graphcommerce/magento-cms'
import { CmsPageContent, CmsPageDocument } from '@graphcommerce/magento-cms'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { breadcrumbs } from '@graphcommerce/next-config/config'
import { Container, isTypename, LayoutHeader, PageMeta, revalidate } from '@graphcommerce/next-ui'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { t } from '@lingui/core/macro'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation, productListRenderer } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
// import { TestBlockDocument } from '../graphql/TestBlock.gql'
import { ProductListDocument, ProductListItem } from '@graphcommerce/magento-product'
import { Typography } from '@mui/material'

export type CmsPageProps = { 
  cmsPage: CmsPageFragment | null
  // testBlock?: { identifier: string; title: string; content: string } | null
  products?: any
}

type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, CmsPageProps>

function HomePage(props: CmsPageProps) {
  // const { cmsPage, testBlock, products } = props
  const { cmsPage, products } = props
  
  console.log('=== HOMEPAGE DEBUG ===');
  console.log('products:', products);
  console.log('products?.items:', products?.items);
  console.log('products?.items?.length:', products?.items?.length);
  console.log('======================');
  
  if (!cmsPage) return <Container>Configure cmsPage home</Container>
  
  return (
    <>
      <PageMeta
        title={cmsPage.meta_title || cmsPage.title || `Home`}
        metaDescription={cmsPage.meta_description || undefined}
      />
      <LayoutHeader floatingMd hideMd={breadcrumbs} floatingSm />
      
      {/*{testBlock && (
        <Container sx={{ my: 4 }}>
          <div dangerouslySetInnerHTML={{ __html: testBlock.content }} />
        </Container>
      )}*/}

      {products?.items && products.items.length > 0 && (
        <Container sx={{ my: 4 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>Featured Products</Typography>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {products.items.map((product: any) => (
              <ProductListItem key={product.uid} {...product} />
            ))}
          </div>
        </Container>
      )}
      
      <CmsPageContent cmsPage={cmsPage} productListRenderer={productListRenderer} />
    </>
  )
}

HomePage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default HomePage

export const getStaticProps: GetPageStaticProps = async (context) => {
  const client = graphqlSharedClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const staticClient = graphqlSsrClient(context)
  const confData = (await conf).data
  const url = confData?.storeConfig?.cms_home_page ?? 'home'
  
  const cmsPageQuery = staticClient.query({ query: CmsPageDocument, variables: { url } })
  // const testBlockQuery = staticClient.query({ query: TestBlockDocument })
  const productsQuery = staticClient.query({ 
    query: ProductListDocument,
    variables: { 
      filters: {},
      pageSize: 8
    }
  })
  
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: cacheFirst(staticClient),
  })
  
  const cmsPage = (await cmsPageQuery).data?.route
  // const testBlockData = (await testBlockQuery).data
  const productsData = (await productsQuery).data
  
  console.log('=== GETSTATICPROPS DEBUG ===');
  console.log('productsData:', JSON.stringify(productsData, null, 2));
  console.log('productsData?.products:', productsData?.products);
  console.log('============================');
  
  const result = {
    props: {
      cmsPage: cmsPage && isTypename(cmsPage, ['CmsPage']) ? cmsPage : null,
      // testBlock: testBlockData?.cmsBlocks?.items?.[0] || null,
      products: productsData?.products || null,
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: revalidate(),
  }
  
  return result
}