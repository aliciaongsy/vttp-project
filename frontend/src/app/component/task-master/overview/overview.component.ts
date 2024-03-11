import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit{

  data!: any
  options!: any

  ngOnInit(): void {
    this.data = {
      labels: ['completed', 'incompleted'],
      datasets: [
        {
          data: [3, 7],
          // backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500')],
          backgroundColor: ['#c6d3e3', '#010662'],
          hoverBackgroundColor: ['#c6d3e3', '#010662']
        }
      ]
    };
    this.options = {
      cutout: '50%',
      plugins: {
        legend: {
          labels: {
            color: '#010662',
            font: {
              family: "'Lora', sans-serif",
              size: 14
          }
          }
        }
      }
    };
  }

}
