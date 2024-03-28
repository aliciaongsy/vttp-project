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
import sg.edu.nus.iss.backend.model.Session;
import sg.edu.nus.iss.backend.repository.FocusRepository;

@Service
public class FocusService {
    
    @Autowired
    private FocusRepository focusRepo;

    public JsonObject buildJsonObject(String key, String value) {
        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add(key, value);
        return b.build();
    }

    public ResponseEntity<String> getAllSessions(String id, String workspace){
        List<Session> sessions = focusRepo.getAllSessions(id, workspace);
        if (sessions.isEmpty()){
            JsonArrayBuilder b = Json.createArrayBuilder();
            return ResponseEntity.ok(b.build().toString());
        }
        JsonArrayBuilder b = Json.createArrayBuilder();
        sessions.forEach(s -> b.add(s.toJson(s)));
        return ResponseEntity.ok(b.build().toString());
    }

    public ResponseEntity<String> addSession(String id, String workspace, String date, int duration){
        boolean added = focusRepo.addSessionToWorkspace(id, workspace, date, duration);
        if (added) {
            JsonObject o = buildJsonObject("message", "successfully added new session to workspace");
            return ResponseEntity.ok(o.toString());
        }
        JsonObject o = buildJsonObject("error", "error adding new session to workspace");
        return ResponseEntity.status(HttpStatusCode.valueOf(404)).body(o.toString());
    }
}
