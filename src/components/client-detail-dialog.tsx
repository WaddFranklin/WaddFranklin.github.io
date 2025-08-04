// src/components/client-detail-dialog.tsx
'use client';

import { ClienteComPadaria } from './clients-dashboard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from './ui/separator';
import { Building2, Phone, MapPin, FileText } from 'lucide-react';

interface ClientDetailDialogProps {
  client: ClienteComPadaria;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ClientDetailDialog({
  client,
  isOpen,
  setIsOpen,
}: ClientDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{client.nome}</DialogTitle>
          <DialogDescription>
            Detalhes do cliente e da padaria associada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold mb-2">Informações do Cliente</h4>
            <div className="text-sm space-y-2 pl-4">
              {client.telefone ? (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.telefone}</span>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Telefone não cadastrado.
                </p>
              )}
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Padaria</h4>
            <div className="text-sm space-y-2 pl-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{client.padaria.nome}</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{client.padaria.cnpj}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.padaria.telefone}</span>
              </div>
              {client.padaria.endereco && (
                <div className="flex items-center gap-3 pt-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {`${client.padaria.endereco}, ${client.padaria.bairro} - CEP: ${client.padaria.cep}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
