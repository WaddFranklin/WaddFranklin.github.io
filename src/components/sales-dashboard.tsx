// src/components/sales-dashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-provider';
import {
  Venda,
  VendaFormValues,
  ItemVenda,
  Cliente,
  Padaria,
} from '@/lib/types'; // Adicionado Cliente e Padaria
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

  // Armazenaremos os clientes e padarias em cache para evitar buscas repetidas
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [padarias, setPadarias] = useState<Padaria[]>([]);

  const fetchVendasEComplementos = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Busca de Clientes
      const clientesCol = collection(db, 'clientes');
      const qClientes = query(clientesCol, where('userId', '==', user.uid));
      const clientesSnap = await getDocs(qClientes);
      const clientesData = clientesSnap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Cliente),
      );
      setClientes(clientesData);

      // Busca de Padarias
      const padariasCol = collection(db, 'padarias');
      const qPadarias = query(padariasCol, where('userId', '==', user.uid));
      const padariasSnap = await getDocs(qPadarias);
      const padariasData = padariasSnap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Padaria),
      );
      setPadarias(padariasData);

      // Busca de Vendas
      const vendasCol = collection(db, 'vendas');
      const qVendas = query(
        vendasCol,
        where('userId', '==', user.uid),
        orderBy('data', 'desc'),
      );

      const vendasSnapshot = await getDocs(qVendas);
      const vendasData = vendasSnapshot.docs.map((doc) => {
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
      console.error('Erro ao buscar dados:', error);
      toast.error('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVendasEComplementos();
  }, [fetchVendasEComplementos]);

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
      // --- INÍCIO DA CORREÇÃO ---
      // 1. Encontrar o cliente selecionado na nossa lista em cache
      const clienteSelecionado = clientes.find(
        (c) => c.id === values.clienteId,
      );
      if (!clienteSelecionado) {
        toast.error('Cliente selecionado não foi encontrado.');
        return;
      }

      // 2. Encontrar a padaria associada a esse cliente
      const padariaAssociada = padarias.find(
        (p) => p.id === clienteSelecionado.padariaId,
      );
      if (!padariaAssociada) {
        toast.error('Padaria do cliente não foi encontrada.');
        return;
      }

      // 3. Montar o objeto completo da venda
      const vendaData = {
        clienteId: values.clienteId,
        clienteNome: clienteSelecionado.nome, // Adicionado
        padariaNome: padariaAssociada.nome, // Adicionado
        data: Timestamp.fromDate(values.data as Date),
        itens: values.itens,
        userId: user.uid,
      };
      // --- FIM DA CORREÇÃO ---

      if (vendaToEdit) {
        const vendaRef = doc(db, 'vendas', vendaToEdit.id);
        await updateDoc(vendaRef, vendaData);
        toast.success('Venda atualizada com sucesso!');
      } else {
        const vendasCol = collection(db, 'vendas');
        await addDoc(vendasCol, vendaData);
        toast.success('Venda registrada com sucesso!');
      }

      // Recarrega todos os dados
      fetchVendasEComplementos();
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
        onDataChange={fetchVendasEComplementos}
      />
    </div>
  );
}
