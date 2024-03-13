package sg.edu.nus.iss.backend.controller;

import java.io.StringReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import sg.edu.nus.iss.backend.model.Task;
import sg.edu.nus.iss.backend.service.TaskService;

@Controller
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskSvc;

    @GetMapping(path = "/workspace/all")
    @ResponseBody
    public ResponseEntity<String> getAllWorkspaces(@RequestParam String id){
        return taskSvc.getWorkspacesById(id);
    }

    @PostMapping(path = "/workspace/create")
    @ResponseBody
    public ResponseEntity<String> createNewWorkspace(@RequestBody String payload){
        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject o = reader.readObject();
        String workspace = o.getString("workspace_name");
        String id = o.getString("uid");

        return taskSvc.createNewWorkspace(id, workspace);
    }

    @GetMapping(path = "/{id}/{workspace}/tasks")
    @ResponseBody
    public ResponseEntity<String> getTasks(@PathVariable String id, @PathVariable String workspace){
        return taskSvc.getAllTasks(id, workspace);
    }

    @PostMapping(path = "/{id}/{workspace}/task/new")
    @ResponseBody
    public ResponseEntity<String> addNewTask(@PathVariable String id, @PathVariable String workspace, @RequestBody String payload){
        JsonReader reader = Json.createReader(new StringReader(payload));
        System.out.println(payload);
        JsonObject o = reader.readObject();

        Task task = new Task();
        task.setTask(o.getString("task"));
        task.setStatus(o.getString("status"));
        task.setPriority(o.getString("priority"));
        task.setStart(o.getJsonNumber("start").longValue());
        task.setDue(o.getJsonNumber("due").longValue());
        task.setCompleted(o.getBoolean("completed"));

        return taskSvc.addNewTask(id, workspace, task);
    }
    
}
