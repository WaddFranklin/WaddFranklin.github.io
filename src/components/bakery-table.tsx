// src/components/bakery-table.tsx
'use client';

import { useState, useCallback } from 'react';
import React from 'react';
import { Padaria, Cliente } from '@/lib/types';
import { useAuth } from './auth-provider';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from './ui/button';
import { ChevronDown, Users, Phone } from 'lucide-react';
import { BakeryActions } from './bakery-actions';
import { toast } from 'sonner';

interface BakeriesTableProps {
  data: Padaria[];
  onEdit: (padaria: Padaria) => void;
  onDataChange: () => void;
}

function BakeryRow({
  padaria,
  onEdit,
  onDataChange,
}: {
  padaria: Padaria;
  onEdit: (padaria: Padaria) => void;
  onDataChange: () => void;
}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchClientes = useCallback(async () => {
    if (!user) return;

    setIsLoadingClients(true);
    try {
      const clientesCol = collection(db, 'clientes');
      const q = query(
        clientesCol,
        where('padariaId', '==', padaria.id),
        where('userId', '==', user.uid),
      );
      const snapshot = await getDocs(q);
      const clientesData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Cliente),
      );
      setClientes(clientesData);
    } catch (error) {
      toast.error('Erro ao carregar os clientes desta padaria.');
      console.error(error);
    } finally {
      setIsLoadingClients(false);
      setHasFetched(true);
    }
  }, [user, padaria.id]);

  const handleToggle = () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen && !hasFetched) {
      fetchClientes();
    }
  };

  // --- INÍCIO DA CORREÇÃO ---
  // Lógica para montar o endereço completo de forma segura
  const enderecoCompleto = [padaria.endereco, padaria.numero]
    .filter(Boolean)
    .join(', ');
  // --- FIM DA CORREÇÃO ---

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            aria-expanded={isOpen}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </TableCell>
        <TableCell className="font-medium">{padaria.nome}</TableCell>
        <TableCell>{padaria.cpf || padaria.cnpj || 'N/A'}</TableCell>
        <TableCell>{padaria.telefone || 'N/A'}</TableCell>
        <TableCell>
          {/* Usamos a nova variável que já tratou o caso de número ausente */}
          {enderecoCompleto || 'N/A'}
        </TableCell>
        <TableCell>{padaria.bairro || 'N/A'}</TableCell>
        <TableCell>{padaria.cep || 'N/A'}</TableCell>
        <TableCell className="text-right">
          <div>
            <BakeryActions
              padaria={padaria}
              onEdit={() => onEdit(padaria)}
              onDataChange={onDataChange}
            />
          </div>
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableCell colSpan={8} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5" />
              <h4 className="font-semibold">Contatos Associados</h4>
            </div>
            {isLoadingClients ? (
              <p className="text-sm text-muted-foreground pl-6">
                Carregando contatos...
              </p>
            ) : clientes.length > 0 ? (
              <ul className="space-y-2 pl-6">
                {clientes.map((cliente) => (
                  <li
                    key={cliente.id}
                    className="text-sm flex items-center gap-4"
                  >
                    <span>{cliente.nome}</span>
                    {cliente.telefone && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {cliente.telefone}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground pl-6">
                Nenhum contato cadastrado para este cliente.
              </p>
            )}
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

export function BakeriesTable({
  data,
  onEdit,
  onDataChange,
}: BakeriesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Documento (CPF/CNPJ)</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Bairro</TableHead>
            <TableHead>CEP</TableHead>
            <TableHead className="text-right w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((padaria) => (
              <BakeryRow
                key={padaria.id}
                padaria={padaria}
                onEdit={onEdit}
                onDataChange={onDataChange}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhum cadastro encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
