/**
 * Serviço do motor de contagem (frontend, Parte 6/7).
 *
 * Encapsula as chamadas HTTP do motor: fila de contagens do contador, submissão
 * de contagens, alertas do ADMIN e as operações de gestão (iniciar inventário,
 * progresso e estados de posição).
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AlertsSummary,
  Queue,
  StartResult,
  SubmitCount,
  SubmitCountResult,
} from '../models/engine.model';

@Injectable({ providedIn: 'root' })
export class EngineService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/motor`;

  /**
   * Obtém a fila de contagens do próprio usuário autenticado.
   *
   * @param limit Máximo de tarefas a retornar.
   */
  queue(limit = 20): Observable<Queue> {
    return this.http.get<Queue>(`${this.baseUrl}/fila`, {
      params: { limit: String(limit) },
    });
  }

  /** Submete uma contagem ao motor. */
  submit(data: SubmitCount): Observable<SubmitCountResult> {
    return this.http.post<SubmitCountResult>(`${this.baseUrl}/contagens`, data);
  }

  /** Inicia o motor para um inventário (cria as posições e marca EM_CONTAGEM). */
  start(inventoryId: string): Observable<StartResult> {
    return this.http.post<StartResult>(
      `${this.baseUrl}/inventarios/${inventoryId}/iniciar`,
      {},
    );
  }

  /** Obtém os alertas para o ADMIN (recentes + total não lidos). */
  alerts(limit = 20): Observable<AlertsSummary> {
    return this.http.get<AlertsSummary>(`${this.baseUrl}/alertas`, {
      params: { limit: String(limit) },
    });
  }

  /** Marca todos os alertas como lidos. */
  markAlertsRead(): Observable<{ marcados: number }> {
    return this.http.post<{ marcados: number }>(`${this.baseUrl}/alertas/lidas`, {});
  }
}
