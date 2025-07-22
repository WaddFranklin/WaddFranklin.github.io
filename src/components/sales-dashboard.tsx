// src/components/sales-dashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { Venda, VendaFormValues, ItemVenda } from '@/lib/types';
import { toast } from 'sonner';

// Importações do Firestore
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';

import { SalesTable } from './sales-table';
import { SalesFormDialog } from './sales-form-dialog';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export function SalesDashboard() {
  const { user } = useAuth();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vendaToEdit, setVendaToEdit] = useState<Venda | null>(null);

  const fetchVendas = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const vendasCol = collection(db, 'vendas');
      const q = query(
        vendasCol,
        where('userId', '==', user.uid),
        orderBy('data', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const vendasData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const { totalVenda, totalComissao } = data.itens.reduce(
          (
            acc: { totalVenda: number; totalComissao: number },
            item: ItemVenda,
          ) => {
            const subtotal = item.quantidade * item.precoUnitario;
            acc.totalVenda += subtotal;
            acc.totalComissao += subtotal * (item.comissaoPercentual / 100);
            return acc;
          },
          { totalVenda: 0, totalComissao: 0 },
        );

        return {
          id: doc.id,
          ...data,
          totalVenda,
          totalComissao,
        } as Venda;
      });

      setVendas(vendasData);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      toast.error('Não foi possível carregar as vendas.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVendas();
  }, [fetchVendas]);

  const handleOpenEditDialog = (venda: Venda) => {
    setVendaToEdit(venda);
    setIsFormOpen(true);
  };

  const handleOpenAddDialog = () => {
    setVendaToEdit(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: VendaFormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }

    try {
      const vendaData = {
        cliente: values.cliente,
        // CORREÇÃO: values.data já é um objeto Date vindo do formulário.
        // A conversão `new Date()` era desnecessária e causava o erro.
        data: Timestamp.fromDate(values.data as Date),
        itens: values.itens,
        userId: user.uid,
      };

      if (vendaToEdit) {
        const vendaRef = doc(db, 'vendas', vendaToEdit.id);
        await updateDoc(vendaRef, vendaData);
        toast.success('Venda atualizada com sucesso!');
      } else {
        const vendasCol = collection(db, 'vendas');
        await addDoc(vendasCol, vendaData);
        toast.success('Venda registrada com sucesso!');
      }

      fetchVendas();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      toast.error('Ocorreu um erro ao salvar a venda.');
    } finally {
      setIsFormOpen(false);
    }
  };

  if (loading) {
    return <p>Carregando vendas...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Venda
        </Button>
      </div>

      <SalesFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        vendaToEdit={vendaToEdit}
      />

      <SalesTable
        data={vendas}
        onEdit={handleOpenEditDialog}
        onDataChange={fetchVendas}
      />
    </div>
  );
}
