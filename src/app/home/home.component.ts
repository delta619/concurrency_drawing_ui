import { Component } from '@angular/core';
import { PollService } from '../poll.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [PollService]
})
export class HomeComponent {

  constructor(private pollService: PollService, private router: Router) { }

  getURL(){
    return window.location.href;
  }

  create_screen() {

    this.pollService.createScreen().subscribe((response: any) => {
      let screenID = response.screenID;
      
      // window.location.href = this.getURL() + `/${screenID}`;not working in mobile devices
      // console.log(screenID); not working in mobile devices

      this.router.navigate([`/${screenID}`]);


      
    })
  }

}
