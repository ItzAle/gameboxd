"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { toast } from 'react-toastify';

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const name = searchParams.get('name');

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email || !name) {
      router.push('/auth/signin');
    }
  }, [email, name, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error("Email no disponible. Por favor, inicia sesión de nuevo.");
      setIsLoading(false);
      return;
    }

    try {
      await setDoc(doc(db, "users", email), {
        email,
        name,
        username,
        bio,
        birthdate,
        reviews: [],
        likedGames: [],
      }, { merge: true });
      toast.success("Perfil creado con éxito");
      router.push('/profile');
    } catch (error) {
      console.error("Error creating user profile:", error);
      toast.error("Error al crear el perfil. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !name) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-white">Completa tu perfil</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nombre de usuario"
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
          required
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
        />
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
          required
        />
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? 'Procesando...' : 'Completar registro'}
        </button>
      </form>
    </div>
  );
}
