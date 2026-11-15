import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `<span class="b" [attr.data-s]="status()">{{ label() }}</span>`,
  styles: `
    :host { display: inline-block; }
    .b { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; text-transform: capitalize; background: #eef0f4; color: #495057; white-space: nowrap; }
    .b[data-s='pending'] { background: #fff4d6; color: #9a6700; }
    .b[data-s='accepted'] { background: #dbe4ff; color: #364fc7; }
    .b[data-s='in_progress'] { background: #e5dbff; color: #5f3dc4; }
    .b[data-s='completed'] { background: #d3f9d8; color: #2b8a3e; }
    .b[data-s='rejected'], .b[data-s='cancelled'] { background: #ffe3e3; color: #c92a2a; }
  `,
})
export class StatusBadge {
  status = input.required<string>();
  label = computed(() => this.status().replace('_', ' '));
}