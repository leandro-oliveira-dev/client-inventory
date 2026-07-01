/**
 * Tela de Cadastrar Contadores (Parte 5).
 *
 * Permite ao ADMIN cadastrar contadores, ativar/desativar e vinculá-los a um
 * inventário. O vínculo controla em quais inventários cada contador poderá
 * registrar contagens (validado no backend).
 */

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CounterService } from '../../core/services/counter.service';
import { InventoryService } from '../../core/services/inventory.service';
import { Counter } from '../../core/models/counter.model';
import { Inventory } from '../../core/models/inventory.model';

@Component({
  selector: 'app-contadores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contadores.component.html',
  styleUrls: ['./contadores.component.scss'],
})
export class ContadoresComponent {
  private readonly fb = inject(FormBuilder);
  private readonly counterService = inject(CounterService);
  private readonly inventoryService = inject(InventoryService);

  /** Lista de todos os contadores. */
  readonly counters = signal<Counter[]>([]);
  /** Inventários disponíveis para vínculo. */
  readonly inventories = signal<Inventory[]>([]);
  /** Inventário selecionado para gerenciar vínculos. */
  readonly selectedInventory = signal<string>('');
  /** Contadores vinculados ao inventário selecionado. */
  readonly assigned = signal<Counter[]>([]);

  /** Estados de carregamento/feedback. */
  readonly saving = signal(false);
  readonly feedback = signal<{ type: 'ok' | 'erro'; msg: string } | null>(null);

  /** Formulário de cadastro de contador. */
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  /** IDs dos contadores já vinculados (para filtrar a lista de adição). */
  private readonly assignedIds = computed(
    () => new Set(this.assigned().map((c) => c.id))
  );

  /** Contadores ativos ainda não vinculados ao inventário selecionado. */
  readonly assignable = computed(() =>
    this.counters().filter((c) => c.active && !this.assignedIds().has(c.id))
  );

  constructor() {
    this.loadCounters();
    this.loadInventories();
  }

  /** Cadastra um novo contador. */
  createCounter(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.feedback.set(null);

    this.counterService.create(this.form.getRawValue()).subscribe({
      next: (counter) => {
        this.saving.set(false);
        this.counters.update((list) => [...list, counter].sort(byName));
        this.form.reset();
        this.feedback.set({ type: 'ok', msg: `Contador "${counter.name}" cadastrado.` });
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.feedback.set({ type: 'erro', msg: err.error?.message ?? 'Falha ao cadastrar.' });
      },
    });
  }

  /** Alterna o estado ativo/inativo de um contador. */
  toggleActive(counter: Counter): void {
    this.counterService.setActive(counter.id, !counter.active).subscribe({
      next: (updated) =>
        this.counters.update((list) =>
          list.map((c) => (c.id === updated.id ? updated : c))
        ),
    });
  }

  /** Reage à troca do inventário selecionado. */
  onInventoryChange(inventoryId: string): void {
    this.selectedInventory.set(inventoryId);
    this.assigned.set([]);
    if (inventoryId) {
      this.loadAssigned(inventoryId);
    }
  }

  /** Vincula um contador ao inventário selecionado. */
  assign(counter: Counter): void {
    const inventoryId = this.selectedInventory();
    if (!inventoryId) {
      return;
    }
    this.counterService.assign(inventoryId, [counter.id]).subscribe({
      next: () => this.assigned.update((list) => [...list, counter].sort(byName)),
    });
  }

  /** Remove o vínculo de um contador com o inventário selecionado. */
  unassign(counter: Counter): void {
    const inventoryId = this.selectedInventory();
    this.counterService.unassign(inventoryId, counter.id).subscribe({
      next: () =>
        this.assigned.update((list) => list.filter((c) => c.id !== counter.id)),
    });
  }

  private loadCounters(): void {
    this.counterService.list().subscribe({
      next: (list) => this.counters.set([...list].sort(byName)),
    });
  }

  private loadInventories(): void {
    this.inventoryService.list().subscribe({
      next: (list) => this.inventories.set(list),
    });
  }

  private loadAssigned(inventoryId: string): void {
    this.counterService.listByInventory(inventoryId).subscribe({
      next: (list) => this.assigned.set([...list].sort(byName)),
    });
  }
}

/** Comparador por nome (ordenação alfabética). */
function byName(a: Counter, b: Counter): number {
  return a.name.localeCompare(b.name);
}
