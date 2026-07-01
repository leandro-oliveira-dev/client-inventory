/**
 * Serviço do painel de acompanhamento (frontend, Parte 8).
 *
 * Encapsula a chamada HTTP do painel administrativo. A atualização em tempo real
 * é feita pela camada de componente, que reinvoca `panel()` periodicamente
 * (polling), consistente com a estratégia da tela do contador (Parte 7).
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TrackingFilter, TrackingPanel } from '../models/tracking.model';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/acompanhamento`;

  /**
   * Obtém o painel de acompanhamento de um inventário, aplicando os filtros
   * informados à lista de posições (o resumo é sempre global).
   *
   * @param inventoryId Inventário a acompanhar.
   * @param filtros Filtros de rua/posição/contador/situação.
   */
  panel(inventoryId: string, filtros: TrackingFilter = {}): Observable<TrackingPanel> {
    let params = new HttpParams();
    if (filtros.rua) {
      params = params.set('rua', filtros.rua);
    }
    if (filtros.posicao) {
      params = params.set('posicao', filtros.posicao);
    }
    if (filtros.counterId) {
      params = params.set('counterId', filtros.counterId);
    }
    if (filtros.status) {
      params = params.set('status', filtros.status);
    }
    return this.http.get<TrackingPanel>(`${this.baseUrl}/inventarios/${inventoryId}`, {
      params,
    });
  }
}
