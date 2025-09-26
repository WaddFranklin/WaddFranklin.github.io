// src/components/clients-list.tsx
'use client';

import { useState } from 'react';
import { ClienteComPadaria } from './clients-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Phone, User } from 'lucide-react';
import { ClientDetailDialog } from './client-detail-dialog';

interface ClientsListProps {
  clients: ClienteComPadaria[];
}

export function ClientsList({ clients }: ClientsListProps) {
  const [selectedClient, setSelectedClient] =
    useState<ClienteComPadaria | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleCardClick = (client: ClienteComPadaria) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  if (clients.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-8">
        <p>Nenhum cliente encontrado.</p>
        <p className="text-sm">
          Tente ajustar sua busca ou cadastre novos clientes na tela de
          Padarias.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleCardClick(client)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{client.nome}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{client.padaria.nome || 'Padaria não informada'}</span>
              </div>
              {client.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{client.telefone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedClient && (
        <ClientDetailDialog
          client={selectedClient}
          isOpen={isDetailOpen}
          setIsOpen={setIsDetailOpen}
        />
      )}
    </>
  );
}
