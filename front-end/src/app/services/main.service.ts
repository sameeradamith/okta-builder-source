import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(private http: HttpClient) {}

  run(data) {
    return this.http.post<any>(environment.api_endpoint + "/app/update", data);
  }

  getUserBuildList(user_id) {
    return this.http.get<any>(environment.api_endpoint + "/build/" + user_id);
  }

  download(type, id) {
    window.location.href = environment.api_endpoint + "/download/" + type + "/" + id;
  }

  delete(build_id) {
    return this.http.get<any>(environment.api_endpoint + "/delete/" + build_id);
  }
}
