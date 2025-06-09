import { Document } from '../types';

export async function fetchDocuments(): Promise<Document[]> {
  const response = await fetch('http://localhost:3001/documento');
  if (!response.ok) {
    throw new Error('Erro ao buscar documentos');
  }
  const data: Document[] = await response.json();

  // Filtra removendo o documento com o number "5.660"
  const filteredData = data.filter(document => document.number !== '5.660');

  return filteredData;
}