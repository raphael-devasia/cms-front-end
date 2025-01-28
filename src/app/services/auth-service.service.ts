import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any | null>(null);
  public user$ = this.userSubject.asObservable();

  http = inject(HttpClient);
  // baseurl = 'http://localhost:3000';
  // private baseurl = 'https://cms-backend-1-jofv.onrender.com';
  private baseurl = environment.backendUrl;

  registerUser(user: any) {
    console.log(user);

    return this.http.post(`${this.baseurl}/users/register`, user);
  }
  loginUser(user: any) {
    return this.http.post(`${this.baseurl}/users/login`, user);
  }
  updateUser(user: any, id: string = '') {
    console.log(id);

    return this.http.post(`http://localhost:5050/updateUser?id=${id}`, user, {
      withCredentials: true,
    });
  }
  getUser(id: string = '') {
    console.log(id);

    return this.http.get(`http://localhost:5050/getUser?id=${id}`, {
      withCredentials: true,
    });
  }

  getAllUsers() {
    return this.http.get('http://localhost:5050/users?getallusers', {
      withCredentials: true,
    });
  }
  deleteUser(id: string = '') {
    return this.http.get(`http://localhost:5050/delete-user?id=${id}`, {
      withCredentials: true,
    });
  }
}
