import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponseSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiResponseError {
  success: false;
  message: string;
  data: null;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export const API_URL = 'https://felipe-fattocs.azurewebsites.net'; 

@Injectable({
  providedIn: 'root',
})
export class TarefasService {
  private apiUrl = `${API_URL}/tarefas`;

  constructor(private http: HttpClient) {}

  carregarTarefas(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl);
  }

  adicionarTarefa(tarefa: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, tarefa);
  }

  editarTarefa(id: number, tarefaAtualizada: any): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}`, tarefaAtualizada);
  }

  excluirTarefa(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  atualizarOrdens(tarefas: { id: number; novaOrdem: number }[]): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/reorder`, tarefas);
  }

  moverParaCima(id: number): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.apiUrl}/${id}/move-up`, {});
  }

  moverParaBaixo(id: number): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.apiUrl}/${id}/move-down`, {});
  }
}
