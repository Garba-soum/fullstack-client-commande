import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Commande } from '../models/commande.model';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // =========================
  //       GET ALL
  // =========================
  getCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/commandes`);
  }

  // =========================
  //       GET BY ID
  // =========================
  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/commandes/${id}`);
  }

  // =========================
  //        CREATE
  // =========================
  addCommande(payload: {
    description: string;
    montant: number;
    dateCommande: string;
    clientId: number;
  }): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/commandes`, payload);
  }

  // =========================
  //        UPDATE
  // =========================
  updateCommande(
    id: number,
    payload: {
      description: string;
      montant: number;
      dateCommande: string;
      clientId: number;
    }
  ): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/commandes/${id}`, payload);
  }

  // =========================
  //        DELETE
  // =========================
  deleteCommande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/commandes/${id}`);
  }
}
