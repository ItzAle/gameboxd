import EditCollectionPage from '../../../../Components/Collections/EditCollectionPage';

export default function EditCollectionRoute({ params }) {
  return <EditCollectionPage collectionId={params.id} />;
}
