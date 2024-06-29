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

  create_screen() {
    this.pollService.createScreen().subscribe((response: any) => {
      let screenID = response.screenID;
      window.location.href = `/${screenID}`;
      console.log(screenID);
      
    })
  }

}
