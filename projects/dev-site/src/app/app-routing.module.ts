import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    loadChildren: () => import('./example-form/example-form.module')
      .then(mod => mod.ExampleFormModule),
    path: 'Formularios/Noticias de Portada.aspx'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
