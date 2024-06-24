import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgModule } from '@angular/core';
import p5 from 'p5';
import Cookies from 'js-cookie';
import { PollService } from './poll.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [HttpClientModule, RouterOutlet],
  providers: [PollService]
})
export class AppComponent  {

  constructor(public pollService: PollService) { }


}
