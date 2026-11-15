import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `<div class="wrap"><span class="spin"></span><span>Loading…</span></div>`,
  styles: `
    .wrap { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 56px 0; color: var(--pv-muted, #6b7686); font-size: 14px; }
    .spin { width: 20px; height: 20px; border: 3px solid #dbe4ff; border-top-color: var(--pv-primary, #4263eb); border-radius: 50%; animation: s .7s linear infinite; }
    @keyframes s { to { transform: rotate(360deg); } }
  `,
})
export class Loader {}