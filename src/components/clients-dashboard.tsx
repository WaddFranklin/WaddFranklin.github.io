// src/components/clients-dashboard.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './auth-provider';
import { Cliente, Padaria } from '@/lib/types';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ClientsList } from './clients-list';
import { Input } from './ui/input'; // Importar o Input
import { Search } from 'lucide-react'; // Importar ícone de busca

export interface ClienteComPadaria extends Cliente {
  padaria: Padaria;
}

export function ClientsDashboard() {
  const { user } = useAuth();
  const [clientesComPadaria, setClientesComPadaria] = useState<
    ClienteComPadaria[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo da busca

  const fetchData = useCallback(async () => {
    // ... (lógica de busca de dados permanece a mesma)
    if (!user) return;
    setLoading(true);
    try {
      const padariasCol = collection(db, 'padarias');
      const qPadarias = query(padariasCol, where('userId', '==', user.uid));
      const padariasSnap = await getDocs(qPadarias);
      const padariasMap = new Map(
        padariasSnap.docs.map((doc) => [
          doc.id,
          { id: doc.id, ...doc.data() } as Padaria,
        ]),
      );

      const clientesCol = collection(db, 'clientes');
      const qClientes = query(
        clientesCol,
        where('userId', '==', user.uid),
        orderBy('nome', 'asc'),
      );
      const clientesSnap = await getDocs(qClientes);

      const clientesData = clientesSnap.docs.map((doc) => {
        const cliente = { id: doc.id, ...doc.data() } as Cliente;
        const padaria = padariasMap.get(cliente.padariaId) || ({} as Padaria);
        return { ...cliente, padaria };
      });

      setClientesComPadaria(clientesData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lógica de filtragem
  const filteredClients = useMemo(() => {
    if (!searchTerm) {
      return clientesComPadaria;
    }
    return clientesComPadaria.filter(
      (client) =>
        client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.padaria.nome?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, clientesComPadaria]);

  if (loading) {
    return (
      <p className="text-center text-muted-foreground mt-8">
        Carregando clientes...
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por cliente ou padaria..."
          className="w-full max-w-sm pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ClientsList clients={filteredClients} />
    </div>
  );
}
