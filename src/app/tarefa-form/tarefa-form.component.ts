import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-tarefa-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule, 
  ],
  templateUrl: './tarefa-form.component.html',
  styleUrls: ['./tarefa-form.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class TarefaFormComponent {
  tarefaForm: FormGroup;
  isEditing: boolean;
  minDate: Date;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TarefaFormComponent>,
    private snackBar: MatSnackBar, 
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditing = !!data?.tarefa;
    this.minDate = new Date(); 

    this.tarefaForm = this.fb.group({
      id: [data?.tarefa?.id || null],
      nome: [data?.tarefa?.nome || '', Validators.required],
      custo: [data?.tarefa?.custo || 0, [Validators.required, Validators.min(0)]],
      dataLimite: [data?.tarefa?.dataLimite || null, Validators.required],
      ordem: [data?.tarefa?.ordem || null],
    });

    if (!this.isEditing) {
      this.tarefaForm.removeControl('ordem');
    }
  }

  salvar() {
    if (this.tarefaForm.valid) {
      this.dialogRef.close(this.tarefaForm.value);
    } else {
      if (this.tarefaForm.get('nome')?.hasError('required')) {
        this.exibirAviso('O campo "Nome" é obrigatório.');
      } else if (this.tarefaForm.get('custo')?.hasError('required')) {
        this.exibirAviso('O campo "Custo" é obrigatório.');
      } else if (this.tarefaForm.get('dataLimite')?.hasError('required')) {
        this.exibirAviso('O campo "Data Limite" é obrigatório.');
      } else if (this.tarefaForm.get('custo')?.hasError('min')) {
        this.exibirAviso('O custo não pode ser negativo.');
      }
    }
  }

  fechar() {
    this.dialogRef.close();
  }

  exibirAviso(mensagem: string) {
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = []; 
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';

    
    this.snackBar.open(mensagem, 'Fechar', {
      ...config,
      panelClass: 'snackbar-amarelo',
    });
  }
}
