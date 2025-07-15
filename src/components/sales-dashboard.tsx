// components/sales-dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-provider';
import { Venda, VendaFormValues } from '@/lib/types';
import { toast } from 'sonner';

import { SalesTable } from './sales-table';
import { SalesFormDialog } from './sales-form-dialog';
import { Button } from './ui/button';

export function SalesDashboard() {
  const { user } = useAuth();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(collection(db, 'vendas'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const vendasData: Venda[] = [];
      querySnapshot.forEach((doc) => {
        vendasData.push({ id: doc.id, ...doc.data() } as Venda);
      });
      // Ordena as vendas, por exemplo, por cliente
      vendasData.sort((a, b) => a.cliente.localeCompare(b.cliente));
      setVendas(vendasData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddSale = async (values: VendaFormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar uma venda.');
      return;
    }

    const totalVenda = values.quantidade * values.precoUnitario;
    const promise = addDoc(collection(db, 'vendas'), {
      ...values,
      totalVenda,
      data: new Date().toLocaleDateString('pt-BR'),
      userId: user.uid,
    });

    toast.promise(promise, {
      loading: 'Salvando venda...',
      success: () => {
        setIsAddDialogOpen(false);
        return 'Venda adicionada com sucesso!';
      },
      error: 'Não foi possível adicionar a venda.',
    });
  };

  if (loading) {
    return <p>Carregando vendas...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Adicionar Venda
        </Button>
      </div>

      <SalesFormDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        onSubmit={handleAddSale}
      />

      <SalesTable data={vendas} />
    </div>
  );
}
