package sg.edu.nus.iss.backend.controller;

import java.io.StringReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    // --- workspace ----
    @GetMapping(path = "/workspace/all")
    @ResponseBody
    public ResponseEntity<String> getAllWorkspaces(@RequestParam String id) {
        return taskSvc.getWorkspacesById(id);
    }

    @PostMapping(path = "/workspace/create")
    @ResponseBody
    public ResponseEntity<String> createNewWorkspace(@RequestBody String payload) {
        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject o = reader.readObject();
        String workspace = o.getString("workspace_name");
        String id = o.getString("uid");

        return taskSvc.createNewWorkspace(id, workspace);
    }

    // --- tasks ---
    @GetMapping(path = "/{id}/{workspace}/tasks")
    @ResponseBody
    public ResponseEntity<String> getTasks(@PathVariable String id, @PathVariable String workspace) {
        return taskSvc.getAllTasks(id, workspace);
    }

    // add task
    @PostMapping(path = "/{id}/{workspace}/task/new")
    @ResponseBody
    public ResponseEntity<String> addNewTask(@PathVariable String id, @PathVariable String workspace,
            @RequestBody String payload) {
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

    // change task complete status
    @PutMapping(path = "/{id}/{workspace}/task/complete")
    @ResponseBody
    public ResponseEntity<String> updateCompleteStatus(@PathVariable String id, @PathVariable String workspace, @RequestBody String payload) {
        JsonReader reader = Json.createReader(new StringReader(payload));
        System.out.println(payload);
        JsonObject o = reader.readObject();

        String taskId = o.getString("taskId");
        boolean completed = o.getBoolean("completed");

        return taskSvc.updateCompletedStatus(id, workspace, taskId, completed);
    }

    // delete task
    @DeleteMapping(path="/{id}/{workspace}/task/delete/{taskId}")
    @ResponseBody
    public ResponseEntity<String> deleteTaskById(@PathVariable String id, @PathVariable String workspace, @PathVariable String taskId){
        return taskSvc.deleteTaskById(id, workspace, taskId);
    }

    // update task details
    @PutMapping(path="/{id}/{workspace}/task/update/{taskId}")
    @ResponseBody
    public ResponseEntity<String> updateTaskById(@PathVariable String id, @PathVariable String workspace, @PathVariable String taskId, @RequestBody String payload){
        JsonReader reader = Json.createReader(new StringReader(payload));
        System.out.println(payload);
        JsonObject o = reader.readObject();

        Task task = new Task();
        task.setId(taskId);
        task.setTask(o.getString("task"));
        task.setStatus(o.getString("status"));
        task.setPriority(o.getString("priority"));
        task.setStart(o.getJsonNumber("start").longValue());
        task.setDue(o.getJsonNumber("due").longValue());
        task.setCompleted(o.getBoolean("completed"));

        return taskSvc.updateTaskById(id, workspace, taskId, task);
    }
}
