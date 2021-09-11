import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  
  constructor(public oktaAuth: OktaAuthService) {}

  ngOnInit(): void {
  }

  async logout() {
    await this.oktaAuth.signOut();
  }

}
