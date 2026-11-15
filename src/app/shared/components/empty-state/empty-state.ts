import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="box">
      <div class="ic">{{ icon() }}</div>
      <h3>{{ title() }}</h3>
      @if (text()) { <p>{{ text() }}</p> }
      <div class="act"><ng-content /></div>
    </div>
  `,
  styles: `
    .box { text-align: center; padding: 48px 20px; background: var(--pv-card, #fff); border: 1px dashed var(--pv-line, #e6e9f0); border-radius: 14px; }
    .ic { font-size: 40px; margin-bottom: 8px; }
    h3 { margin: 0 0 6px; font-size: 17px; }
    p { margin: 0 auto 16px; max-width: 360px; color: var(--pv-muted, #6b7686); font-size: 14px; }
    .act { display: flex; justify-content: center; }
  `,
})
export class EmptyState {
  icon = input('📭');
  title = input.required<string>();
  text = input('');
}