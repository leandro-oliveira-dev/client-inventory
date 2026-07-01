/**
 * Serviço de pré-contagem (frontend, Parte 10.1 — modo SEM_EXCEL).
 *
 * Encapsula: criar inventário sem Excel, submeter o levantamento por posição,
 * consultar o resumo e encerrar (materializar o estoque).
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClosePreCountResult,
  CreateBlankInventory,
  PreCountSummary,
  SubmitPreCount,
} from '../models/precount.model';

@Injectable({ providedIn: 'root' })
export class PreCountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pre-contagem`;

  /** Cria um inventário sem Excel (já em pré-contagem). */
  createInventory(data: CreateBlankInventory): Observable<PreCountSummary> {
    return this.http.post<PreCountSummary>(`${this.baseUrl}/inventarios`, data);
  }

  /** Resumo da pré-contagem de um inventário. */
  summary(inventoryId: string): Observable<PreCountSummary> {
    return this.http.get<PreCountSummary>(`${this.baseUrl}/inventarios/${inventoryId}`);
  }

  /** Submete o levantamento de uma posição. */
  submit(data: SubmitPreCount): Observable<PreCountSummary> {
    return this.http.post<PreCountSummary>(`${this.baseUrl}/posicoes`, data);
  }

  /** Encerra a pré-contagem e gera o estoque. */
  close(inventoryId: string): Observable<ClosePreCountResult> {
    return this.http.post<ClosePreCountResult>(
      `${this.baseUrl}/inventarios/${inventoryId}/encerrar`,
      {},
    );
  }
}
