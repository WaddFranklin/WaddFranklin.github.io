// src/components/flours-table.tsx
'use client';

import { Farinha } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FlourActions } from './flour-actions';

interface FloursTableProps {
  data: Farinha[];
  onEdit: (farinha: Farinha) => void;
  onDataChange: () => void;
}

export function FloursTable({ data, onEdit, onDataChange }: FloursTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Farinha</TableHead>
            <TableHead className="text-right w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((farinha) => (
              <TableRow key={farinha.id}>
                <TableCell className="font-medium">{farinha.nome}</TableCell>
                <TableCell className="text-right">
                  <FlourActions
                    farinha={farinha}
                    onEdit={() => onEdit(farinha)}
                    onDataChange={onDataChange}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                Nenhum tipo de farinha cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}