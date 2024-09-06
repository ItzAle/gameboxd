import { db, collection, addDoc, getDocs } from "../../../../lib/firebase";

export async function GET() {
  try {
    const reviewsCollection = collection(db, "reviews");
    const snapshot = await getDocs(reviewsCollection);
    const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return new Response(JSON.stringify(reviews), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const review = await request.json();
    const reviewsCollection = collection(db, "reviews");
    const docRef = await addDoc(reviewsCollection, review);
    return new Response(JSON.stringify({ id: docRef.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
