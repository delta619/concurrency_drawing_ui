import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PollService {

  constructor(private http: HttpClient) { }

  sendTrace(actions: { x: number, y: number }[], username: string): void {
    // Send the coordinates to the server
    console.log('Sending trace:');

    this.http.post('http://localhost:3000/api/public/update', {
      actions,
      username,
      screen: "ash"
    }).subscribe(response => {
      console.log('Response:', response);
    });
  }


  listenForTraces(data: any): Observable<any> {
    // Listen for traces from the server
    console.log('Listening for traces:');
    return this.http.post('http://localhost:3000/api/public/wait', {
      screenID: "ash",
      username: data.username,
      initial: data.initial
    })
  }

  clearCanvas(): Observable<any> {
    // Clear the canvas
    return this.http.post('http://localhost:3000/api/public/clear', {
      screen: "ash"
    })
  }


}