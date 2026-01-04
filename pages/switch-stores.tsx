import { GetStaticProps } from 'next'

export default function SwitchStores() {
  return null
}

export const getStaticProps: GetStaticProps = async () => {
  return { notFound: true }
}
