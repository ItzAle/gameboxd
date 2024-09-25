import CollectionDetails from '../../../Components/Collections/CollectionDetails';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';

export default function CollectionDetailsPage({ params }: { params: Params }) {
  return <CollectionDetails collectionId={params.id} />;
}
