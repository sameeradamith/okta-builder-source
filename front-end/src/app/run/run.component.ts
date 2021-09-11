import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { OktaAuthService } from '@okta/okta-angular';
import { MainService } from '../services/main.service';

@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.css']
})
export class RunComponent implements OnInit {

  constructor(private mainService: MainService, public oktaAuth: OktaAuthService) { }

  runForm: FormGroup;
  appId:string;
  isDownload:boolean = false;
  user_id: string

  ngOnInit(): void {
    this.runForm = new FormGroup({
      user_id: new FormControl(''),
      app_name: new FormControl(''),
      framework: new FormControl('angular'),
      auth_method: new FormControl('redirect'),
      issuer_value: new FormControl(''),
      clientId_value: new FormControl(''),
      redirectUri_value: new FormControl(''),
      client_secret: new FormControl('')
    });


    this.oktaAuth.getUser().then(res => {
      console.log(res.sub)
      this.user_id = res.sub;
    })
  }


  onSubmit(form: FormGroup) {
    console.log('Valid?', form.valid); // true or false
    console.log(form.value);

    form.value.user_id = this.user_id;

    this.mainService.run(form.value).subscribe(res => {
      console.log(res)
      if(res.success === true) {
        this.runForm.reset();
        this.appId = res.resposne.build_app_id;
        this.isDownload = true;
      }

    })

  }


  downloadFile(type) {
    
    this.mainService.download(type, this.appId);
    console.log(type);

  }

}
