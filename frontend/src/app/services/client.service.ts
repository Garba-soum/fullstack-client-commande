import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /clients  -> liste
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl + '/clients');
  }

  // GET /clients/{id} -> détail (utile pour edit)
  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(this.apiUrl + '/clients/' + id);
  }

  // POST /clients -> création
  addClient(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.apiUrl + '/clients', client);
  }

  // PUT /clients/{id} -> modification
  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(this.apiUrl + '/clients/' + id, client);
  }

  // DELETE /clients/{id} -> suppression
  deleteClient(id: number): Observable<void> {
  return this.http.delete<void>(this.apiUrl + '/clients/' + id);
}




}
