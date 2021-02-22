# U.S.I. Forms

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.14.

Use the project `dev-site` as base for new projects.

DO NOT copy files and folders directly. Generate the required files and folders using the following commands.

## Generate application (project)

move to the root of the main project.

run `ng generate application PROJECT_NAME --prefix=PREFIX --routing=true --style=scss` to create a new project.

## Generate module (per form)

move to the root of the main project.

run `ng generate module MODULE_NAME --project=PROJECT_NAME --routing=true`

## Generate component

run `cd projects/PROJECT_NAME/src/app/MODULE_NAME` to change to the module folder.

run `ng generate component components/TYPE/COMPONENT-NAME-TYPE` to create a new component.

## Generate datasource

run `cd projects/PROJECT_NAME/src/app/MODULE_NAME` to change to the module folder.

run `ng generate class datasources/DATASOURCE_NAME.datasource` to create a new datasource class.

## Generate service

run `cd projects/PROJECT_NAME/src/app/MODULE_NAME` to change to the module folder.

run `ng generate service services/SERVICE_NAME`

## Build

move to the root of the main project.

run `ng build PROJECT_NAME --deployUrl=/path/to/project's/assets/ --outputHashing=none --prod=true` to build the project.
