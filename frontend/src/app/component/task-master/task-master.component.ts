import { Component } from '@angular/core';

@Component({
  selector: 'app-task-master',
  templateUrl: './task-master.component.html',
  styleUrl: './task-master.component.css'
})
export class TaskMasterComponent {

  addInput(){
    var newdiv = document.createElement('div');
    newdiv.innerHTML = "<input type='text' style='border: solid; background-color: #FFF9F4; border-color: lightgray; border-radius: 5px;'>";
    document.getElementById('workspaces')?.appendChild(newdiv);
  }

  // removeInput(btn){
  //   btn.parentNode.remove();
  // }

}
