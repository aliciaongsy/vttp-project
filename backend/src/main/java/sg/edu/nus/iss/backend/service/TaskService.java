package sg.edu.nus.iss.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import sg.edu.nus.iss.backend.model.Task;
import sg.edu.nus.iss.backend.repository.TaskRepository;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepo;

    public JsonObject buildJsonObject(String key, String value) {
        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add(key, value);
        return b.build();
    }

    // --- workspace ---
    public ResponseEntity<String> getWorkspacesById(String id) {
        List<String> workspaces = taskRepo.getWorkspacesById(id);

        if (workspaces.size() == 0) {
            JsonArrayBuilder b = Json.createArrayBuilder();
            return ResponseEntity.ok(b.build().toString());
        }

        JsonArrayBuilder b = Json.createArrayBuilder();
        workspaces.forEach(w -> b.add(w));
        return ResponseEntity.ok(b.build().toString());
    }

    public ResponseEntity<String> createNewWorkspace(String id, String workspace) {
        boolean added = taskRepo.addWorkspace(id, workspace);
        if (added) {
            JsonObject o = buildJsonObject("message", "successfully created workspace");
            return ResponseEntity.ok(o.toString());
        }
        JsonObject o = buildJsonObject("error", "error creating new workspace");
        return ResponseEntity.status(HttpStatusCode.valueOf(404)).body(o.toString());
    }

    // --- tasks ---
    public ResponseEntity<String> getAllTasks(String id, String workspace){
        List<Task> tasks = taskRepo.getAllTasks(id, workspace);
        if (tasks.isEmpty()){
            JsonArrayBuilder b = Json.createArrayBuilder();
            return ResponseEntity.ok(b.build().toString());
        }
        JsonArrayBuilder b = Json.createArrayBuilder();
        tasks.forEach(t -> b.add(t.taskToJson(t)));
        return ResponseEntity.ok(b.build().toString());
    }

    public ResponseEntity<String> addNewTask(String id, String workspace, Task task) {
        boolean added = taskRepo.addTaskToWorkspace(id, workspace, task);
        if (added) {
            JsonObject o = buildJsonObject("message", "successfully added new task to workspace");
            return ResponseEntity.ok(o.toString());
        }
        JsonObject o = buildJsonObject("error", "error adding new task to workspace");
        return ResponseEntity.status(HttpStatusCode.valueOf(404)).body(o.toString());
    }
}