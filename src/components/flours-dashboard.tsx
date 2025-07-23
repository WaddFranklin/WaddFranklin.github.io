// src/components/flours-dashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { Farinha, FarinhaFormValues } from '@/lib/types';
import { toast } from 'sonner';

import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
} from 'firebase/firestore';

import { FloursTable } from './flours-table';
import { FlourFormDialog } from './flour-form-dialog';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export function FloursDashboard() {
  const { user } = useAuth();
  const [farinhas, setFarinhas] = useState<Farinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [farinhaToEdit, setFarinhaToEdit] = useState<Farinha | null>(null);

  const fetchFarinhas = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const farinhasCol = collection(db, 'farinhas');
      const q = query(
        farinhasCol,
        where('userId', '==', user.uid),
        orderBy('nome', 'asc'),
      );

      const querySnapshot = await getDocs(q);
      const farinhasData = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        } as Farinha;
      });

      setFarinhas(farinhasData);
    } catch (error) {
      console.error('Erro ao buscar farinhas:', error);
      toast.error('Não foi possível carregar as farinhas.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFarinhas();
  }, [fetchFarinhas]);

  const handleOpenEditDialog = (farinha: Farinha) => {
    setFarinhaToEdit(farinha);
    setIsFormOpen(true);
  };

  const handleOpenAddDialog = () => {
    setFarinhaToEdit(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: FarinhaFormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }

    try {
      const farinhaData = {
        nome: values.nome,
        userId: user.uid,
      };

      if (farinhaToEdit) {
        const farinhaRef = doc(db, 'farinhas', farinhaToEdit.id);
        await updateDoc(farinhaRef, farinhaData);
        toast.success('Farinha atualizada com sucesso!');
      } else {
        const farinhasCol = collection(db, 'farinhas');
        await addDoc(farinhasCol, farinhaData);
        toast.success('Farinha cadastrada com sucesso!');
      }

      fetchFarinhas();
    } catch (error) {
      console.error('Erro ao salvar farinha:', error);
      toast.error('Ocorreu um erro ao salvar a farinha.');
    } finally {
      setIsFormOpen(false);
    }
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Farinha
        </Button>
      </div>

      <FlourFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        farinhaToEdit={farinhaToEdit}
      />

      <FloursTable
        data={farinhas}
        onEdit={handleOpenEditDialog}
        onDataChange={fetchFarinhas}
      />
    </div>
  );
}