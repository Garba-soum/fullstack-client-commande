import { Client } from './client.model';

export interface Commande {
  id: number;
  description: string;
  montant: number;
  dateCommande: string; // ISO string venant du backend
  client?: Client; // ou client: Client | null;
}
