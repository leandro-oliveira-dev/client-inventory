/**
 * Serviço de contadores (frontend, Parte 5).
 *
 * Encapsula as chamadas HTTP do cadastro de contadores, ativação/desativação
 * e vínculo com inventários.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Counter, CreateCounter } from '../models/counter.model';

@Injectable({ providedIn: 'root' })
export class CounterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/contadores`;

  /** Lista todos os contadores. */
  list(): Observable<Counter[]> {
    return this.http.get<Counter[]>(this.baseUrl);
  }

  /** Cadastra um novo contador. */
  create(data: CreateCounter): Observable<Counter> {
    return this.http.post<Counter>(this.baseUrl, data);
  }

  /** Ativa ou desativa um contador. */
  setActive(id: string, active: boolean): Observable<Counter> {
    return this.http.patch<Counter>(`${this.baseUrl}/${id}/status`, { active });
  }

  /** Lista os contadores vinculados a um inventário. */
  listByInventory(inventoryId: string): Observable<Counter[]> {
    return this.http.get<Counter[]>(`${this.baseUrl}/vinculos`, {
      params: { inventory: inventoryId },
    });
  }

  /** Vincula contadores a um inventário. */
  assign(inventoryId: string, counterIds: string[]): Observable<{ vinculados: number }> {
    return this.http.post<{ vinculados: number }>(`${this.baseUrl}/vinculos`, {
      inventoryId,
      counterIds,
    });
  }

  /** Remove o vínculo de um contador com um inventário. */
  unassign(inventoryId: string, counterId: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/vinculos`, {
      body: { inventoryId, counterId },
    });
  }
}
