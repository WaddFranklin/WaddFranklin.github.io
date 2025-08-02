// src/components/bakeries-table.tsx
'use client';

import { Padaria } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BakeryActions } from './bakery-actions';

interface BakeriesTableProps {
  data: Padaria[];
  onEdit: (padaria: Padaria) => void;
  onDataChange: () => void;
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
            <TableHead>Nome da Padaria</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>CEP</TableHead> {/* Nova Coluna */}
            <TableHead>Bairro</TableHead>
            <TableHead className="text-right w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((padaria) => (
              <TableRow key={padaria.id}>
                <TableCell className="font-medium">{padaria.nome}</TableCell>
                <TableCell>{padaria.cnpj}</TableCell>
                <TableCell>{padaria.telefone}</TableCell>
                <TableCell>{padaria.cep}</TableCell> {/* Nova Célula */}
                <TableCell>{padaria.bairro}</TableCell>
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {' '}
                {/* Colspan atualizado para 6 */}
                Nenhuma padaria cadastrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
