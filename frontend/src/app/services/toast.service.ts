import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message: string = '';
  type: 'success' | 'error' | '' = '';

  showSuccess(msg: string): void {
    this.message = msg;
    this.type = 'success';
    this.autoClear();
  }

  showError(msg: string): void {
    this.message = msg;
    this.type = 'error';
    this.autoClear();
  }

  clear(): void {
    this.message = '';
    this.type = '';
  }

  private autoClear(): void {
    setTimeout(() => this.clear(), 2500);
  }
}
