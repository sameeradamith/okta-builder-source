import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OktaAuthGuard, OktaCallbackComponent, OktaLoginRedirectComponent } from '@okta/okta-angular';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HelpComponent } from './help/help.component';
import { RunComponent } from './run/run.component';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  {
    path: '', 
    component: WelcomeComponent
  },
  {
    path: 'run', 
    component: RunComponent,
    canActivate: [ OktaAuthGuard ]
  },
  {
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [ OktaAuthGuard ]
  },
  {
    path: 'help', 
    component: HelpComponent,
    canActivate: [ OktaAuthGuard ]
  },
  {
    path: 'login/callback',
    component: OktaCallbackComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
