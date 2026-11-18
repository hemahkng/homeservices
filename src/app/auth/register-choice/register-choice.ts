
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register-choice',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './register-choice.html',
  styleUrl: './register-choice.scss',
})
export class RegisterChoice {}
