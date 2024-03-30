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
import sg.edu.nus.iss.backend.model.Event;
import sg.edu.nus.iss.backend.model.Task;
import sg.edu.nus.iss.backend.repository.PlannerRepository;

@Service
public class PlannerService {

    @Autowired
    private PlannerRepository plannerRepo;

    public JsonObject buildJsonObject(String key, String value) {
        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add(key, value);
        return b.build();
    }

    public ResponseEntity<String> getAllEvents(String id) {
        List<Event> events = plannerRepo.getAllEvents(id);
        if (events.isEmpty()) {
            JsonArrayBuilder b = Json.createArrayBuilder();
            return ResponseEntity.ok(b.build().toString());
        }
        JsonArrayBuilder b = Json.createArrayBuilder();
        events.forEach(e -> b.add(e.toJson(e)));
        return ResponseEntity.ok(b.build().toString());
    }

    public ResponseEntity<String> addNewEvent(String id, List<Event> events) {
        boolean added = plannerRepo.addEventsToWorkspace(id, events);
        if (added) {
            JsonObject o = buildJsonObject("message", "successfully added new event to workspace");
            return ResponseEntity.ok(o.toString());
        }
        JsonObject o = buildJsonObject("error", "error adding new event to workspace");
        return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(o.toString());
    }

    public ResponseEntity<String> getAllOutstandingTasks(String id, String[] workspaces){
        List<Task> tasks = plannerRepo.getAllOutstandingTasks(id, workspaces);
        if (tasks.isEmpty()) {
            JsonArrayBuilder b = Json.createArrayBuilder();
            return ResponseEntity.ok(b.build().toString());
        }
        JsonArrayBuilder b = Json.createArrayBuilder();
        tasks.forEach(t -> b.add(t.taskToJson(t)));
        return ResponseEntity.ok(b.build().toString());
    }
}