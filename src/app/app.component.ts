import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    Github User Search<br />
    <input
      #searchField
      type="search"
      (input)="changed(searchField.value)"
      value="bkinsey808 in:login"
      autofocus="true"
    />
    <app-user-list [searchString]="searchString"></app-user-list>
  `,
  styles: [
    `
      input {
        padding: 10px;
      }
    `
  ]
})
export class AppComponent implements OnInit {
  @ViewChild('searchField') searchField: ElementRef;
  searchString = '';

  ngOnInit() {
    this.searchString = this.searchField.nativeElement.value;
  }

  changed(value) {
    this.searchString = value;
  }
}
