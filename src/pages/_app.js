import { ReviewsProvider } from '../context/ReviewsContext';

function MyApp({ Component, pageProps }) {
  return (
    <ReviewsProvider>
      <Component {...pageProps} />
    </ReviewsProvider>
  );
}

export default MyApp;