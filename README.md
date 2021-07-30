# SearchMatSelect

[![Travis-CI build status](https://travis-ci.com/vinesnts/search-mat-select.svg?branch=master)](https://github.com/vinesnts/search-mat-select)

This is a component made on top of the [Mat Select](https://material.angular.io/components/select/overview) component of the [Material Angular](https://material.angular.io/) library.
The SearchMatSelect features a search box to find the avaliable options and a select all option, it as well offers keybord navigation for accessibility.

The source code is avaliable on [Github](https://github.com/vinesnts/search-mat-select) and a demo is avaliable [here](http://viniciusalmeida.dev/search-mat-select-demo/).

## 1. How to...
  * ## import to your project</h2>
    * Install `search-mat-select` in your project.
      ```
      npm install search-mat-select
      ```
    * Then, import the `SearchMatSelectModule` to your `app.module.ts`.
      ```typescript
      …
      import { SearchMatSelectModule } from 'search-mat-select';
      @NgModule({
      imports: [
          …
          SearchMatSelectModule,
          …
      ],
      …
      ```
    * Finally, use the component `lib-search-mat-select` wherever you want
      ```html
      <lib-search-mat-select
        [data]="states"
        inputLabel="Brazilian States"
        [selectMultiple]="true"
        [showSelectAll]="true"
        selectAllLabel="Mark all"
        filterLabel="Search for a Brazilian state">
      </lib-search-mat-select>
      ```
  * ## set the select options
    Use the attribute `data`.
    > Note: the data passed to the search-select-mat-input MUST extend from the GenericData interface avaliable in the SearchSelectMatInputComponent class.
  * ## set the input label
    Use the attribute `inputLabel` to set the label/placeholder of the closed select input.
  * ## add the Select All/Mark All checkbox
    Use the data binding attribute `[showSelectAll]` to enable showing the option.
      * `[showSelectAll]="true"`
      * `[showSelectAll]="false"`
      * Use the atribute `filterLabel` to set Select All checkbox label
  
  * ## choose between a one option or multiple selector
    Use the data binding attribute `[selectMultiple]` to switch between one option only or multiple selector.
      * `[selectMultiple]="true"`
      * `[selectMultiple]="false"`
      
  * ## change mat input appearance
    Use the <code>appearance</code> attribute as done in a mat input.</p>
      * `appearance="legacy"`
      * `appearance="standard"`
      * `appearance="outline"`
      * `appearance="fill"`
      > Note: Default appearance is `outline`
  
  * ## change mat input float label behavior
    Use the <code>floatLabel</code> attribute as done in a mat input</p>
      * `floatLabel="auto"`
      * `floatLabel="always"`
  
  * ## handle events
    For now, there is only one event emitted from the `SearchSelectMatInput`.
      * `(selectionChange)`
        * This event emits `GenericData[]` every time an option is selected or deselected.

## 2. Accessibility
  Navigation through keyboard is avaliable on this component, see bellow the avaliable navigation keys and shortcuts:
  * `enter`
    * Opens the select options.
    * Selects the hovered option.
  * `up/down/left/right`
    * Navigates through the options.
    > Note: When clicked, the filter input will blur.
  * `ctrl + s`
    * Focuses the filter input.
    > Note: shift + tab won't focus the filter input, instead use ctrl + s.
  * `escape`
    * Unfocuses the filter input.
    * Closes the select options.
    > Note: `tab` will NOT navigate properly inside selects overall, this neither.
