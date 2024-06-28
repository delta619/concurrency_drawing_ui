import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgModule } from '@angular/core';
import p5 from 'p5';
import Cookies from 'js-cookie';
import { PollService } from '../poll.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss',
})
export class CanvasComponent {
  private p5!: p5;
  private p5Initialized: boolean = false; // Flag to check if p5 is initialized
  @ViewChild('sketchContainer', { static: true }) sketchContainer!: ElementRef;
  public username!: string;
  private traceSubject = new Subject<void>();
  private coordinates: { x: number, y: number }[] = [];
  private screenID!: string;
  constructor(private pollService: PollService, public activeRoute: ActivatedRoute) { }
  copyButton: string = 'Copy Link!';
  ngOnInit(): void {
    this.screenID = this.activeRoute.snapshot.params["screenID"];
    this.checkForUsername();
    this.setupTraceSubscription();
    this.createCanvas();
    this.listenForUpdate(true);


  }
  drawMode: 'dot' | 'line' = 'line';

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
        this.pollService.sendTrace(this.screenID, this.coordinates, this.username);
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
      if (this.drawMode === 'dot') {
        p.fill(255, 0, 0);
        p.ellipse(p.mouseX, p.mouseY, 10, 10);
      } else if (this.drawMode === 'line') {
        p.stroke(255, 0, 0);
        p.strokeWeight(5);
        if (p.pmouseX !== p.mouseX || p.pmouseY !== p.mouseY) {
          p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
        }
      }
      this.trace(p.mouseX, p.mouseY);
    };
  };

  listenForUpdate(initial: boolean = false) {
    this.pollService.listenForTraces(this.screenID, { username: this.username, initial }).subscribe((response) => {
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
      let lastPoint = datapoints[0]; // Start from the first point
      datapoints.forEach((point, index) => {
        setTimeout(() => {
          this.p5.fill(...color);
          this.p5.stroke(...color);
          this.p5.strokeWeight(5);
  
          if (this.drawMode === 'dot') {
            this.p5.ellipse(point.x, point.y, 10, 10);
          } else if (this.drawMode === 'line') {
            if (lastPoint && (point.x !== lastPoint.x || point.y !== lastPoint.y)) {
              this.p5.line(lastPoint.x, lastPoint.y, point.x, point.y);
            }
            lastPoint = point; // Update lastPoint to the current point after drawing
          }
        }, index * delay);
      });
    };
  
    if (initial) {
      let actions = data.actions;
      drawDotsWithDelay(actions, [255, 0, 0], 10);
      return;
    }
  
    // Apply all the dots to canvas
    for (let event of data.actions) {
      let username = event.username;
      let datapoints = event.actions;
      let color: [number, number, number] = username === this.username ? [255, 0, 0] : [255, 0, 0];
      drawDotsWithDelay(datapoints, color, 50);
    }
  }
  
  clearCanvas() {
    this.pollService.clearCanvas(this.screenID).subscribe(() => {
      window.location.reload();
    });
  }


  share_link() {
    this.copyButton = 'Copied!';
    let link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
    });
  }

  setDrawMode(mode: 'dot' | 'line') {
    this.drawMode = mode;
  }
}
