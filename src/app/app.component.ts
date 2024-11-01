

import { Component, ViewChild, TemplateRef, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TarefasService, ApiResponse, ApiResponseSuccess } from './services/tarefas.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TarefaFormComponent } from './tarefa-form/tarefa-form.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLinkedin, faGithub, faWhatsapp } from '@fortawesome/free-brands-svg-icons';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    DragDropModule,
    MatDialogModule,
    ReactiveFormsModule,
    CommonModule,
    TarefaFormComponent,
    MatSnackBarModule,
    FontAwesomeModule 
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  tarefasService = inject(TarefasService);
  dialog = inject(MatDialog);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);

  title = 'Sistema de Lista de Tarefas';
  tarefas: any[] = [];
  tarefaForm: FormGroup;
  isEditing = false;
  formularioAberto = false;
  isReordering = false;

  constructor() {
    this.tarefaForm = this.fb.group({
      id: [null],
      nome: ['', Validators.required],
      custo: [0, [Validators.required, Validators.min(0)]],
      dataLimite: [null, Validators.required],
    });
    this.carregarTarefas();
  }

  
  mostrarNotificacao(mensagem: string, tipo: 'sucesso' | 'erro') {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: tipo === 'sucesso' ? 'snackbar-sucesso' : 'snackbar-erro'
    });
  }

  
  isSuccess<T>(response: ApiResponse<T>): response is ApiResponseSuccess<T> {
    return response.success;
  }

  
  carregarTarefas() {
    this.tarefasService.carregarTarefas().subscribe({
      next: (response: ApiResponse<any[]>) => {
        if (this.isSuccess(response)) {
          this.tarefas = response.data.map((tarefa: any) => {
            const dataLimite = new Date(tarefa.dataLimite);
            const dataAjustada = new Date(
              dataLimite.getUTCFullYear(),
              dataLimite.getUTCMonth(),
              dataLimite.getUTCDate()
            );
            return {
              ...tarefa,
              dataLimite: dataAjustada
            };
          }).sort((a: any, b: any) => a.ordem - b.ordem);
        
        } 
      },
      error: (error) => {
        
        console.error('Erro ao carregar tarefas:', error);
        this.mostrarNotificacao('Erro inesperado ao carregar tarefas.', 'erro');
      }
    });
  }

  
  abrirFormulario(tarefa?: any) {
    const dialogRef = this.dialog.open(TarefaFormComponent, {
      width: '400px',
      data: { tarefa },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const data = new Date(result.dataLimite);
        result.dataLimite = data.toISOString().split('T')[0];

        if (result.id) {
          const { id, ...tarefaAtualizada } = result;
          this.tarefasService.editarTarefa(id, tarefaAtualizada).subscribe({
            next: (response: ApiResponse<any>) => {
              if (this.isSuccess(response)) {
                this.carregarTarefas();
              }
              this.mostrarNotificacao(response.message, response.success ? 'sucesso' : 'erro');
            },
            error: (error) => {
              console.error('Erro ao editar tarefa:', error);
              this.mostrarNotificacao('Erro inesperado ao editar tarefa.', 'erro');
            }
          });
        } else {
          const { id, ...novaTarefa } = result;
          this.tarefasService.adicionarTarefa(novaTarefa).subscribe({
            next: (response: ApiResponse<any>) => {
              if (this.isSuccess(response)) {
                this.carregarTarefas();
              }
              this.mostrarNotificacao(response.message, response.success ? 'sucesso' : 'erro');
            },
            error: (error) => {
              console.error('Erro ao adicionar tarefa:', error);
              this.mostrarNotificacao('Erro inesperado ao adicionar tarefa.', 'erro');
            }
          });
        }
      }
    });
  }

  
  confirmarExclusao(tarefa: any) {
    const dialogRef = this.dialog.open(this.confirmDialog, { data: tarefa });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.tarefasService.excluirTarefa(tarefa.id).subscribe({
          next: (response: ApiResponse<null>) => {
            if (this.isSuccess(response)) {
              this.carregarTarefas();
            }
            this.mostrarNotificacao(response.message, response.success ? 'sucesso' : 'erro');
          },
          error: (error) => {
            console.error('Erro ao excluir tarefa:', error);
            this.mostrarNotificacao('Erro inesperado ao excluir tarefa.', 'erro');
          }
        });
      }
    });
  }

  
  drop(event: CdkDragDrop<any[]>) {
    if (event.previousIndex === event.currentIndex || this.isReordering) {
      return;
    }
  
    moveItemInArray(this.tarefas, event.previousIndex, event.currentIndex);

    this.tarefas.forEach((tarefa, index) => {
      tarefa.ordem = index + 1; 
    });

    this.atualizarOrdens();
  }

  
  atualizarOrdens() {
    this.isReordering = true;

    const payload = this.tarefas.map((tarefa) => ({
      id: tarefa.id,
      novaOrdem: tarefa.ordem,
    }));

    this.tarefasService.atualizarOrdens(payload)
      .pipe(finalize(() => (this.isReordering = false)))
      .subscribe({
        next: (response: ApiResponse<null>) => {
          if (this.isSuccess(response)) {
            console.log('Ordens atualizadas com sucesso via drag-and-drop.');
          }
          this.mostrarNotificacao(response.message, response.success ? 'sucesso' : 'erro');
        },
        error: (error) => {
          console.error('Erro ao atualizar ordens via drag-and-drop:', error);
          this.mostrarNotificacao('Erro inesperado ao atualizar ordens.', 'erro');
        },
      });
  }

  
  subirTarefa(tarefa: any) {
    this.tarefasService.moverParaCima(tarefa.id).subscribe({
      next: (response: ApiResponse<null>) => {
        if (this.isSuccess(response)) {
          this.carregarTarefas();
        }
        this.mostrarNotificacao(response.message, response.success ? 'sucesso' : 'erro');
      },
      error: (error) => {
        console.error('Erro ao mover tarefa para cima:', error);
        this.mostrarNotificacao('Erro inesperado ao mover tarefa para cima.', 'erro');
      }
    });
  }

  
  descerTarefa(tarefa: any) {
    this.tarefasService.moverParaBaixo(tarefa.id).subscribe({
      next: (response: ApiResponse<null>) => {
        if (this.isSuccess(response)) {
          this.carregarTarefas();
        }
        this.mostrarNotificacao(response.message, response.success ? 'sucesso' : 'erro');
      },
      error: (error) => {
        console.error('Erro ao mover tarefa para baixo:', error);
        this.mostrarNotificacao('Erro inesperado ao mover tarefa para baixo.', 'erro');
      }
    });
  }

  
  isFirst(tarefa: any): boolean {
    return this.tarefas.indexOf(tarefa) === 0;
  }

  
  isLast(tarefa: any): boolean {
    return this.tarefas.indexOf(tarefa) === this.tarefas.length - 1;
  }

  abrirLinkedIn() {
    window.open('https://www.linkedin.com/in/feliipenevesnow/', '_blank');
  }
  
  abrirGitHub() {
    window.open('https://github.com/feliipenevesnow', '_blank');
  }
  
  abrirWhatsApp() {
    window.open('https://wa.me/5518981712939', '_blank');
  }
  
  enviarEmail() {
    window.location.href = 'mailto:feliipenevesnow@gmail.com';
  }
  
}
