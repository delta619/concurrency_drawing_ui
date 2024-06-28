import { Component } from '@angular/core';
import { PollService } from '../poll.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [PollService]
})
export class HomeComponent {

  constructor(private pollService: PollService) { }

  getURL(){
    return window.location.href;
  }

  create_screen() {

    this.pollService.createScreen().subscribe((response: any) => {
      let screenID = response.screenID;
      
      window.location.href = this.getURL() + `/${screenID}`;
      console.log(screenID);
      
    })
  }

}
