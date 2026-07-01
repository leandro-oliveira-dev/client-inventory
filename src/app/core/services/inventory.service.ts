/**
 * Serviço de inventário (frontend, Parte 4).
 *
 * Encapsula as chamadas HTTP do módulo de inventário: download do modelo
 * Excel, importação da planilha e listagem dos inventários importados.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImportResult, Inventory, Product } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/inventarios`;

  /**
   * Baixa a planilha-modelo (.xlsx) como blob.
   *
   * @returns Observable com o conteúdo binário do arquivo.
   */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/modelo`, { responseType: 'blob' });
  }

  /**
   * Importa uma planilha de inventário.
   *
   * @param file Arquivo Excel selecionado.
   * @param nome Nome opcional do inventário.
   * @returns Observable com o resumo da importação.
   */
  import(file: File, nome?: string): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('arquivo', file);
    if (nome) {
      formData.append('nome', nome);
    }
    return this.http.post<ImportResult>(`${this.baseUrl}/importar`, formData);
  }

  /**
   * Lista os inventários já importados.
   *
   * @returns Observable com a lista de inventários.
   */
  list(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.baseUrl);
  }

  /**
   * Lista os produtos de um inventário (para edição de valores — Parte 10.1).
   *
   * @param inventoryId Inventário.
   */
  listProducts(inventoryId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/${inventoryId}/produtos`);
  }

  /**
   * Atualiza o valor unitário de um produto (ADMIN, antes de finalizar).
   *
   * @param productId Produto.
   * @param valorUnitario Novo valor unitário.
   */
  updateProductValue(productId: string, valorUnitario: number): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/produtos/${productId}/valor`, {
      valorUnitario,
    });
  }
}
