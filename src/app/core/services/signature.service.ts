/**
 * Serviço de assinatura digital (frontend, Parte 10).
 *
 * Encapsula as chamadas HTTP do fluxo de assinatura: consultar o status, gerar o
 * documento, registrar assinaturas e baixar o PDF (final ou prévia).
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SignatureDocument, SignRequest } from '../models/signature.model';

@Injectable({ providedIn: 'root' })
export class SignatureService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/assinatura`;

  /** Consulta o status do documento de um inventário (null se não gerado). */
  status(inventoryId: string): Observable<SignatureDocument | null> {
    return this.http.get<SignatureDocument | null>(`${this.baseUrl}/inventarios/${inventoryId}`);
  }

  /** Gera (ou recupera) o documento de assinatura do inventário. */
  generate(inventoryId: string): Observable<SignatureDocument> {
    return this.http.post<SignatureDocument>(`${this.baseUrl}/inventarios/${inventoryId}`, {});
  }

  /** Registra uma assinatura (ADMIN ou CLIENTE). */
  sign(inventoryId: string, data: SignRequest): Observable<SignatureDocument> {
    return this.http.post<SignatureDocument>(
      `${this.baseUrl}/inventarios/${inventoryId}/assinar`,
      data,
    );
  }

  /** Baixa o PDF do documento (final quando assinado, ou prévia) como blob. */
  pdf(inventoryId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/inventarios/${inventoryId}/pdf`, {
      responseType: 'blob',
    });
  }
}
