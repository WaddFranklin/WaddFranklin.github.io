// src/components/bakeries-dashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { Padaria, PadariaFormValues } from '@/lib/types';
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
  writeBatch,
  orderBy,
} from 'firebase/firestore';

import { BakeriesTable } from './bakery-table';
import { BakeryFormDialog } from './bakery-form-dialog';
import { Button } from './ui/button';
import { Plus, Building2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function BakeriesDashboard() {
  const { user } = useAuth();
  const [padarias, setPadarias] = useState<Padaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [padariaToEdit, setPadariaToEdit] = useState<Padaria | null>(null);

  const fetchPadarias = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const padariasCol = collection(db, 'padarias');
      const q = query(
        padariasCol,
        where('userId', '==', user.uid),
        orderBy('nome', 'asc'),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Padaria),
      );
      setPadarias(data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar padarias.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPadarias();
  }, [fetchPadarias]);

  const handleOpenEditDialog = (padaria: Padaria) => {
    setPadariaToEdit(padaria);
    setIsFormOpen(true);
  };

  const handleOpenAddDialog = () => {
    setPadariaToEdit(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: PadariaFormValues) => {
    if (!user) return;

    try {
      const padariaData = {
        nome: values.nome,
        endereco: values.endereco || '',
        numero: values.numero || '', // Adicionado
        bairro: values.bairro || '',
        cep: values.cep || '',
        cpf: values.cpf || '',
        cnpj: values.cnpj || '',
        telefone: values.telefone || '',
        userId: user.uid,
      };

      let padariaId: string;

      if (padariaToEdit) {
        padariaId = padariaToEdit.id;
        const padariaRef = doc(db, 'padarias', padariaId);
        await updateDoc(padariaRef, padariaData);
      } else {
        const padariasCol = collection(db, 'padarias');
        const docRef = await addDoc(padariasCol, padariaData);
        padariaId = docRef.id;
      }

      const batch = writeBatch(db);
      values.clientes.forEach((cliente) => {
        const clienteData = {
          nome: cliente.nome,
          telefone: cliente.telefone || '',
          padariaId: padariaId,
          userId: user.uid,
        };
        const clienteRef = cliente.id
          ? doc(db, 'clientes', cliente.id)
          : doc(collection(db, 'clientes'));

        batch.set(clienteRef, clienteData, { merge: true });
      });

      await batch.commit();

      toast.success(
        `Cadastro ${padariaToEdit ? 'atualizado' : 'realizado'} com sucesso!`,
      );
      fetchPadarias();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar os dados.');
    } finally {
      setIsFormOpen(false);
    }
  };

  return (
    <>
      <BakeryFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        padariaToEdit={padariaToEdit}
      />
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Gestão de Padarias e Clientes
            </CardTitle>
            <CardDescription>
              Cadastre e gerencie suas padarias e clientes.
            </CardDescription>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cadastro
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : (
            <BakeriesTable
              data={padarias}
              onEdit={handleOpenEditDialog}
              onDataChange={fetchPadarias}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
