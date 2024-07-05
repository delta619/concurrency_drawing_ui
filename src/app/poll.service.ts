import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PollService {

  public _screenID?: string;
  constructor(private http: HttpClient) { }
  host = '167.99.24.118:3000';
  // host = 'http://localhost:3000';
  sendTrace(screenID:string, actions: { x: number, y: number }[], username: string): void {
    // Send the coordinates to the server
    console.log('Sending trace:');

    this.http.post(this.host+'/api/public/update', {
      actions,
      username,
      screenID,
    }).subscribe(response => {
      console.log('Response:', response);
    });
  }


  listenForTraces(screenID:string,data: any): Observable<any> {
    // Listen for traces from the server
    console.log('Listening for traces:');
    return this.http.post(this.host+'/api/public/wait', {
      screenID,
      username: data.username,
      initial: data.initial
    })
  }

  clearCanvas(screenID:string,): Observable<any> {
    // Clear the canvas
    return this.http.post(this.host+'/api/public/clear', {
      screenID,
    })
  }

  createScreen(): Observable<any> {
    // Create a new screen ID
    return this.http.post(this.host+'/api/public/create', {})
  }


}
