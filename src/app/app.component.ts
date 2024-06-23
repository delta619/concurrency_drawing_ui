import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgModule } from '@angular/core';
import p5 from 'p5';
import Cookies from 'js-cookie';
import { PollService } from './poll.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [HttpClientModule],
  providers: [PollService]
})
export class AppComponent implements OnInit, OnDestroy {
  private p5!: p5;
  private p5Initialized: boolean = false; // Flag to check if p5 is initialized
  @ViewChild('sketchContainer', { static: true }) sketchContainer!: ElementRef;
  public username!: string;
  private traceSubject = new Subject<void>();
  private coordinates: { x: number, y: number }[] = [];

  constructor(public pollService: PollService) { }

  ngOnInit(): void {
    this.checkForUsername();
    this.setupTraceSubscription();
    this.createCanvas();
    this.listenForUpdate(true);
  }

  ngOnDestroy(): void {
    this.destroyCanvas();
  }

  private checkForUsername(): void {
    this.username = prompt('Please enter your username:') || '';
  }

  private createCanvas(): void {
    this.p5 = new p5(this.sketch, this.sketchContainer.nativeElement);
  }

  private destroyCanvas(): void {
    if (this.p5) {
      this.p5.remove();
    }
  }

  private setupTraceSubscription(): void {
    this.traceSubject.pipe(
      debounceTime(100)
    ).subscribe(() => {
      if (this.coordinates.length > 0) {
        this.pollService.sendTrace(this.coordinates, this.username);
        this.coordinates = []; // Clear the coordinates after sending
      }
    });
  }

  private trace(x: number, y: number): void {
    console.log(`(${x}, ${y})`);
    this.coordinates.push({ x, y });
    this.traceSubject.next();
  }

  private sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(600, 400);
      p.background(200);
      this.p5Initialized = true; // Set flag to true when p5 is initialized
    };

    p.draw = () => {
      // We don't need to do anything in draw for this example
    };

    p.mouseDragged = () => {
      p.fill(255, 0, 0);
      p.ellipse(p.mouseX, p.mouseY, 10, 10);
      this.trace(p.mouseX, p.mouseY);
    };
  };

  listenForUpdate(initial: boolean = false) {
    this.pollService.listenForTraces({ username: this.username, initial }).subscribe((response) => {
      this.applyUpdate(response, initial);
      setTimeout(() => {
        this.listenForUpdate(false);
      }, 100);
    });
  }

  applyUpdate(data: any, initial: boolean = false) {
    if (!this.p5Initialized) {
      // Wait for p5 to be initialized before applying updates
      setTimeout(() => this.applyUpdate(data, initial), 100);
      return;
    }

    const drawDotsWithDelay = (datapoints: { x: number, y: number }[], color: [number, number, number], delay: number) => {
      datapoints.forEach((point, index) => {
        setTimeout(() => {
          this.p5.fill(...color);
          this.p5.ellipse(point.x, point.y, 10, 10);
        }, index * delay);
      });
    };

    if (initial) {
      let actions = data.actions;
      console.log(data.data); // [{x:12, y:32}]
      drawDotsWithDelay(actions, [255, 0, 0], 10);
      return;
    }

    // Apply all the dots to canvas
    for (let event of data.actions) {
      let username = event.username;
      let datapoints = event.actions;
      let color: [number, number, number] = username === this.username ? [0, 255, 0] : [255, 0, 0];
      drawDotsWithDelay(datapoints, color, 50);
    }
  }


  clearCanvas() {
    this.pollService.clearCanvas().subscribe(() => {
      window.location.reload();
    });
  }
}
