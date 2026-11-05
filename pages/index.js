export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/start',
      permanent: false,
    },
  };
}

export default function RootPage() {
  return null;
}
