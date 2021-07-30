import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { fromEvent, PartialObserver, Subscription } from 'rxjs';

export interface GenericData {
  id: number;
  name: string;
}

interface MapKey {
  Control?: boolean,
  s?: boolean
}

const ALLOWED_KEYS: Array<string> = [
  'Enter',
  'ArrowUp',
  'ArrowLeft',
  'ArrowDown',
  'ArrowRight'
];

@Component({
  selector: 'lib-search-mat-select',
  template: `
  <form [formGroup]="formGroup">
    <mat-form-field [appearance]="appearance" [floatLabel]="floatLabel">
      <mat-label>{{ inputLabel }}</mat-label>
      <mat-select
        #selectInput
        formControlName="data"
        [multiple]="selectMultiple"
        (openedChange)="doFocusFilter()"
        (selectionChange)="handleSelectAll($event)">
        <div floatLabel="never" class="form-group">
          <input
            class="form-input-control"
            #filterInput
            formControlName="filter"
            type="text"
            [placeholder]="filterLabel"
            (keydown)="handleInputKeydown($event)"
            (keyup)="handleInputKeyup()" />
        </div>
        <mat-option
          #selectAllOption
          *ngIf="showSelectAll && selectMultiple"
          [value]="selectAllOptionValue">
          {{ selectAllLabel }}</mat-option>
        <mat-option *ngFor="let d of data" [value]="d">
          {{ d.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  </form>
  `,
  styles: [`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  
  .form-group {
    width: 100%;
  }

  .form-group .form-input-control {
    width: inherit;
    height: 3em;
    padding: 1em;
    outline: none;
    border: none;
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.2);
    transition: box-shadow ease-out 100ms;
    border-radius: 0;
  }

  .form-group .form-input-control:hover,
  .form-group .form-input-control:active,
  .form-group .form-input-control:focus {
    box-shadow: 0px 1px 0px 1px rgba(0, 0, 0, 1);
    transition: box-shadow ease-out 250ms;
  }
  `
  ]
})
/**
 * @author viniciusalmeida.dev
 */
export class SearchMatSelectComponent implements OnInit {

  formGroup: FormGroup;
  keydownSubscription!: Subscription;
  keyupSubscription!: Subscription;
  mapKeysdown: MapKey = {};

  lastOptionSelected: Array<string> = [];
  unfilteredData: Array<GenericData> = [];
  selectAllOptionValue: GenericData = {
    id: 0,
    name: 'Select All'
  };

  @ViewChild('filterInput') filterInput!: ElementRef;
  @ViewChild('selectInput') selectInput!: MatSelect;
  @ViewChild('selectAllOption') selectAllOption!: MatOption;

  /** filter input label text */
  @Input('filterLabel') filterLabel: string;
  /** mat select appearance definition */
  @Input('appearance') appearance: 'fill' | 'outline' | 'standard' | 'legacy' = 'outline';
  /** mat select float label behavior  */
  @Input('floatLabel') floatLabel: 'auto' | 'always' = 'auto';
  /** mat select label/placeholder text */
  @Input('inputLabel') inputLabel!: string;
  /** multiple selectable options or only one selectable option */
  @Input('selectMultiple') selectMultiple: boolean;
  /** select all option avaliability */
  @Input('showSelectAll') showSelectAll: boolean;
  /** select all option label, when enabled */
  @Input('selectAllLabel') selectAllLabel: string;
  /** options to be shown on the select */
  @Input('data') data: Array<GenericData> = [];
  /** event emitted when any option is selected or deselected */
  @Output('selectionChange') selectionChange: EventEmitter<Array<GenericData>> = new EventEmitter<Array<GenericData>>();
  /** event emitted on any change on the filter input */
  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();
  /** event emitted on escape key pressed  */
  @Output() onExit: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      data: null,
      filter: null
    });

    this.filterLabel = 'Search for an option (CTRL + S)';
    this.selectAllLabel = 'Select All';
    this.selectMultiple = true;
    this.showSelectAll = true;
  }

  ngOnInit(): void {
    this.selectAllOptionValue.name = this.selectAllLabel;
    this.unfilteredData = this.data;

    this.keydownSubscription = fromEvent(document, 'keydown').subscribe({
      next: (e: Event) => {
        const event = e as KeyboardEvent;
        switch (event.key) {
          case 'Control': {
            this.mapKeysdown[event.key] = true;
            break;
          }
          case 's': {
            this.mapKeysdown[event.key] = true;
            break;
          }
        }

        if (this.mapKeysdown['Control'] && this.mapKeysdown['s']) {
          this.mapKeysdown['Control'] = false;
          this.mapKeysdown['s'] = false;

          e.preventDefault();
          this.filterInput.nativeElement.focus();
        }
      }
    });

    this.keyupSubscription = fromEvent(document, 'keyup').subscribe({
      next: (e: Event) => {
        const event = e as KeyboardEvent;
        switch (event.key) {
          case 'Control': {
            this.mapKeysdown[event.key] = false;
            break;
          }
          case 's': {
            this.mapKeysdown[event.key] = false;
          }
        }
      }
    });
  }

  /**
   * Focuses the search/filter input to start typing
   */
   doFocusFilter(): void {
    this.filterInput.nativeElement.focus();
  }

  /**
   * Handles the selection when any option is selected
   * Selects all or deselects the select all option
   * @param event emmitted when a option is selected
   */
   handleSelectAll(event: MatSelectChange): void {
    const target: GenericData = this._getOptionSelected(event);
    
    if (this.selectMultiple) {
      if (this.selectAllOption && target === this.selectAllOption.value) {
        this._doSelectAll();

        if (event.value.includes(this.selectAllOptionValue))
          this.selectionChange.emit(this.unfilteredData);
        else this.selectionChange.emit([]);
        return;
      } else this._doSelectAny();
    }
    this.selectionChange.emit(event.value);
  }

  /**
   * Emits changes on the input after last change
   */
   handleInputKeyup(): void {
    this._doFilter(this.formGroup.controls.filter.value);
  }

  /**
   * Handles shortcuts on keydown
   * @param event keyboard event emitted when key is pressed down
   */
   handleInputKeydown(event: KeyboardEvent): void {
    if (ALLOWED_KEYS.includes(event.code)) return;
    else if (event.key === 'Escape')
      this._doExitSearchInput();
    event.stopPropagation();
  }

  /**
   * Selects all options in the select
   */
   private _doSelectAll(): void {
    const selected: boolean = this.selectAllOption.selected;
    if (selected)
      this.formGroup.controls.data.patchValue([
        ...this.unfilteredData.map((d: GenericData) => d),
        this.selectAllOptionValue
      ]);
    else this.formGroup.controls.data.patchValue([]);
  }

  /** 
   * Unselects the Select All option when any other option's selected
   * when Select All option is enabled
   * */
  private _doSelectAny(): void {
    if (this.showSelectAll) {
      this.selectAllOption.deselect();
    }
  }

  /**
   * Find the selected option from a MatSelectChange event
   * @param event MatSelectChange event emitted by the MatSelect
   * @returns the selected option
   */
   private _getOptionSelected(event: MatSelectChange): GenericData {
    return event.source.options.find((option: any) => {
      if (option._active) return option;
    })?.value ?? [];
  }

  /**
   * Unfocuses the search/filter input and focus on options below it
   */
  private _doExitSearchInput(): void {
    this.selectInput.focus();
  }

  /**
   * Search in the this.data for the event string
   * @param event character or string to be searched in this.data
   */
  _doFilter(event: string): void {
    let filteredData: Array<GenericData> = this.unfilteredData;
    const word: string = event ? event.toLocaleLowerCase() : '';
    if (word) {
      filteredData = this.unfilteredData.filter((d: GenericData) => {
        return d.name.toLocaleLowerCase().includes(word);
      });
    }
    this.data = filteredData;
  }
}
