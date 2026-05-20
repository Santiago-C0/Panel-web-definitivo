import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TemplatesService,
  Category,
  TaskTemplate,
  CreateCategoryDto,
  CreateTemplateDto,
  PatchTemplateDto
} from '../../../core/services/templates.service';
import { AuthService } from '../../../core/services/auth.service';

type ModalMode =
  | 'create-category' | 'edit-category' | 'delete-category'
  | 'create-template' | 'edit-template' | 'delete-template'
  | null;

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent implements OnInit {
  categories       = signal<Category[]>([]);
  templates        = signal<TaskTemplate[]>([]);
  loadingCats      = signal(true);
  loadingTpls      = signal(true);
  errorCats        = signal('');
  errorTpls        = signal('');

  selectedCategoryId = signal<number | null>(null);

  modalMode    = signal<ModalMode>(null);
  modalLoading = signal(false);
  modalError   = signal('');
  selectedItem = signal<Category | TaskTemplate | null>(null);

  catForm: CreateCategoryDto = { category_name: '', category_description: '' };
  tplForm: CreateTemplateDto & { id?: number } = {
    id_category: 0,
    name: '',
    description: '',
    foints_base: 0,
    active: true
  };

  constructor(
    private templatesService: TemplatesService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadTemplates();
  }

  loadCategories() {
    this.loadingCats.set(true);
    this.errorCats.set('');
    this.templatesService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories.set(data);
        this.loadingCats.set(false);
      },
      error: (err: any) => {
        this.errorCats.set(this.auth.extractErrorMessage(err, 'No se pudieron cargar las categorías.'));
        this.loadingCats.set(false);
      }
    });
  }

  loadTemplates(categoryId?: number | null) {
    this.loadingTpls.set(true);
    this.errorTpls.set('');
    const id = categoryId !== undefined ? categoryId : this.selectedCategoryId();
    this.templatesService.getTemplates(id ?? undefined).subscribe({
      next: (data: TaskTemplate[]) => {
        this.templates.set(data);
        this.loadingTpls.set(false);
      },
      error: (err: any) => {
        this.errorTpls.set(this.auth.extractErrorMessage(err, 'No se pudieron cargar las plantillas.'));
        this.loadingTpls.set(false);
      }
    });
  }

  filterByCategory(id: number | null) {
    this.selectedCategoryId.set(id);
    this.loadTemplates(id);
  }

  getCategoryName(id: number): string {
    return this.categories().find(c => c.id_category === id)?.category_name ?? '—';
  }

  // ── MODALES CATEGORÍA ──────────────────────────────────

  openCreateCategory() {
    this.catForm = { category_name: '', category_description: '' };
    this.modalError.set('');
    this.modalMode.set('create-category');
  }

  openEditCategory(cat: Category) {
    this.catForm = { category_name: cat.category_name, category_description: cat.category_description };
    this.selectedItem.set(cat);
    this.modalError.set('');
    this.modalMode.set('edit-category');
  }

  openDeleteCategory(cat: Category) {
    this.selectedItem.set(cat);
    this.modalError.set('');
    this.modalMode.set('delete-category');
  }

  submitCategory() {
    if (!this.catForm.category_name.trim()) {
      this.modalError.set('El nombre es obligatorio.');
      return;
    }
    this.modalLoading.set(true);
    this.modalError.set('');

    const isEdit = this.modalMode() === 'edit-category';
    const selected = this.selectedItem() as Category | null;

    const req$ = isEdit && selected
      ? this.templatesService.updateCategory(selected.id_category, this.catForm)
      : this.templatesService.createCategory(this.catForm);

    req$.subscribe({
      next: () => {
        this.modalLoading.set(false);
        this.closeModal();
        this.loadCategories();
      },
      error: (err: any) => {
        this.modalLoading.set(false);
        this.modalError.set(this.auth.extractErrorMessage(err, 'No se pudo guardar la categoría.'));
      }
    });
  }

  confirmDeleteCategory() {
    const cat = this.selectedItem() as Category | null;
    if (!cat) return;
    this.modalLoading.set(true);
    this.modalError.set('');
    this.templatesService.deleteCategory(cat.id_category).subscribe({
      next: () => {
        this.modalLoading.set(false);
        this.closeModal();
        this.loadCategories();
        if (this.selectedCategoryId() === cat.id_category) {
          this.filterByCategory(null);
        }
      },
      error: (err: any) => {
        this.modalLoading.set(false);
        this.modalError.set(this.auth.extractErrorMessage(err, 'No se pudo eliminar. Puede tener plantillas asociadas.'));
      }
    });
  }

  // ── MODALES PLANTILLA ──────────────────────────────────

  openCreateTemplate() {
    const firstCat = this.categories()[0];
    this.tplForm = {
      id_category: firstCat?.id_category ?? 0,
      name: '',
      description: '',
      foints_base: 100,
      active: true
    };
    this.selectedItem.set(null);
    this.modalError.set('');
    this.modalMode.set('create-template');
  }

  openEditTemplate(tpl: TaskTemplate) {
    this.tplForm = {
      id_category: tpl.id_category,
      name: tpl.name,
      description: tpl.description,
      foints_base: tpl.foints_base,
      active: tpl.active
    };
    this.selectedItem.set(tpl);
    this.modalError.set('');
    this.modalMode.set('edit-template');
  }

  openDeleteTemplate(tpl: TaskTemplate) {
    this.selectedItem.set(tpl);
    this.modalError.set('');
    this.modalMode.set('delete-template');
  }

  submitTemplate() {
    if (!this.tplForm.name.trim()) {
      this.modalError.set('El nombre es obligatorio.');
      return;
    }
    if (!this.tplForm.id_category) {
      this.modalError.set('Selecciona una categoría.');
      return;
    }
    this.modalLoading.set(true);
    this.modalError.set('');

    const isEdit = this.modalMode() === 'edit-template';
    const selected = this.selectedItem() as TaskTemplate | null;

    const dto: PatchTemplateDto = {
      id_category: Number(this.tplForm.id_category),
      name: this.tplForm.name,
      description: this.tplForm.description,
      foints_base: Number(this.tplForm.foints_base),
      active: this.tplForm.active
    };

    const req$ = isEdit && selected
      ? this.templatesService.updateTemplate(selected.id_task_template, dto)
      : this.templatesService.createTemplate(dto as CreateTemplateDto);

    req$.subscribe({
      next: () => {
        this.modalLoading.set(false);
        this.closeModal();
        this.loadTemplates();
      },
      error: (err: any) => {
        this.modalLoading.set(false);
        this.modalError.set(this.auth.extractErrorMessage(err, 'No se pudo guardar la plantilla.'));
      }
    });
  }

  confirmDeleteTemplate() {
    const tpl = this.selectedItem() as TaskTemplate | null;
    if (!tpl) return;
    this.modalLoading.set(true);
    this.modalError.set('');
    this.templatesService.deleteTemplate(tpl.id_task_template).subscribe({
      next: () => {
        this.modalLoading.set(false);
        this.closeModal();
        this.loadTemplates();
      },
      error: (err: any) => {
        this.modalLoading.set(false);
        this.modalError.set(this.auth.extractErrorMessage(err, 'No se pudo eliminar. Desactívala si tiene tareas asociadas.'));
      }
    });
  }

  toggleActive(tpl: TaskTemplate) {
    this.templatesService.updateTemplate(tpl.id_task_template, { active: !tpl.active }).subscribe({
      next: (updated: TaskTemplate) => {
        this.templates.update(list =>
          list.map(t => t.id_task_template === updated.id_task_template ? updated : t)
        );
      },
      error: (err: any) => {
        this.errorTpls.set(this.auth.extractErrorMessage(err, 'No se pudo cambiar el estado.'));
      }
    });
  }

  closeModal() {
    this.modalMode.set(null);
    this.selectedItem.set(null);
    this.modalError.set('');
    this.modalLoading.set(false);
  }
}