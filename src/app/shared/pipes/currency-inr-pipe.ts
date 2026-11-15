import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyInr'
})
export class CurrencyInrPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
