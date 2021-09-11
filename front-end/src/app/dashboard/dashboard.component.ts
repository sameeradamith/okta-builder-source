import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { MainService } from '../services/main.service';

interface Claim {
  claim: string;
  value: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  idToken;
  claims: Array<Claim>;
  builds: any;

  constructor(public oktaAuth: OktaAuthService, private mainService: MainService) {}

  async ngOnInit() {
    const userClaims = await this.oktaAuth.getUser();
    this.claims = Object.entries(userClaims).map(entry => ({ claim: entry[0], value: entry[1] }));


    this.oktaAuth.getUser().then(res => {
      console.log(res.sub)
      this.mainService.getUserBuildList(res.sub).subscribe(res => {
        this.builds = res
        console.log(res)
      })
    })


    // console.log(JSON.parse(localStorage.getItem('okta-token-storage')).accessToken.accessToken)
    console.log(this.claims)
  }


  downloadFile(type, appId) {
    this.mainService.download(type, appId);
  }


  deleteBuild(build_id, index) {
    this.mainService.delete(build_id).subscribe(res => {
      if(res.success == true) {

        this.builds.splice(index,1);

      }
    })
  }


}
