/**
 * Serviço de relatórios (frontend, Parte 9).
 *
 * Encapsula as chamadas HTTP do relatório de inventário: obtenção dos dados
 * consolidados (JSON) e download da exportação em Excel.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Report } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/relatorios`;

  /**
   * Obtém o relatório completo de um inventário.
   *
   * @param inventoryId Inventário.
   */
  report(inventoryId: string): Observable<Report> {
    return this.http.get<Report>(`${this.baseUrl}/inventarios/${inventoryId}`);
  }

  /**
   * Baixa a exportação do relatório em Excel (.xlsx) como blob.
   *
   * @param inventoryId Inventário.
   */
  export(inventoryId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/inventarios/${inventoryId}/exportar`, {
      responseType: 'blob',
    });
  }
}
