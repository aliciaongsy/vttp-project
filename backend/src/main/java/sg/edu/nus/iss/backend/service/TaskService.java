package sg.edu.nus.iss.backend.service;

import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import sg.edu.nus.iss.backend.exception.DeleteWorkspaceException;
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
        return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
    }

    // --- tasks ---
    public ResponseEntity<String> getAllTasks(String id, String workspace) {
        List<Task> tasks = taskRepo.getAllTasks(id, workspace);
        if (tasks.isEmpty()) {
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
        return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
    }

    public ResponseEntity<String> updateCompletedStatus(String id, String workspace, String taskId, boolean completed) {
        boolean updated = taskRepo.updateCompleteStatus(id, workspace, taskId, completed);
        if (updated) {
            JsonObject o = buildJsonObject("message", "successfully updated completed status");
            return ResponseEntity.ok(o.toString());
        }
        JsonObject o = buildJsonObject("error", "error updating completed status");
        return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
    }

    public ResponseEntity<String> deleteTaskById(String id, String workspace, String taskId) {
        boolean deleted = taskRepo.deleteTaskById(id, workspace, taskId);
        if (deleted) {
            JsonObject o = buildJsonObject("message", "successfully deleted task");
            return ResponseEntity.ok(o.toString());
        }
        JsonObject o = buildJsonObject("error", "error deleting task");
        return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
    }

    public ResponseEntity<String> updateTaskById(String id, String workspace, String taskId, Task task) {
        boolean updated = taskRepo.updateTaskById(id, workspace, taskId, task);

        if (updated) {
            JsonObject o = buildJsonObject("message", "successfully updated task");
            return ResponseEntity.ok(o.toString());
        }
        JsonObject o = buildJsonObject("error", "error updating task");
        return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
    }

    public ResponseEntity<String> getOutstandingTasks(String id) {
        List<Document> docs = taskRepo.getOutstandingTasks(id);
        JsonArrayBuilder builder = Json.createArrayBuilder();
        if (docs.isEmpty()) {
            return ResponseEntity.ok(builder.build().toString());
        }
        
        docs.forEach(d -> {
            System.out.println(d.toJson());
            Task t = new Task();
            t = t.convertDocToTask(d);
            builder.add(t.taskToJson(t));
        });

        return ResponseEntity.ok(builder.build().toString());
    }

    public ResponseEntity<String> getTaskDataSummary(String id){
        JsonObject o = taskRepo.getTaskDataSummary(id);

        return ResponseEntity.ok(o.toString());
    }

    @Transactional(rollbackFor={DeleteWorkspaceException.class})
    public void deleteWorkspace(String id, String workspace) throws DeleteWorkspaceException{
        taskRepo.deleteWorkspace(id, workspace);
        taskRepo.deleteWorkspaceTasks(id, workspace);
    }
}
