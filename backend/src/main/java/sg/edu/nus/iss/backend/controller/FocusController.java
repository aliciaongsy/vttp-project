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
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import sg.edu.nus.iss.backend.service.FocusService;

@Controller
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FocusController {

    @Autowired
    private FocusService focusSvc;

    @GetMapping(path = "/{id}/focus/sessions")
    @ResponseBody
    public ResponseEntity<String> getTasks(@PathVariable String id) {
        return focusSvc.getAllSessions(id);
    }
    
    @PostMapping(path = "/{id}/focus/session/new")
    @ResponseBody
    public ResponseEntity<String> addNewTask(@PathVariable String id, @RequestBody String payload) {
        JsonReader reader = Json.createReader(new StringReader(payload));
        System.out.println(payload);
        JsonObject o = reader.readObject();

        String date = o.getString("date");
        int duration = o.getInt("duration");

        return focusSvc.addSession(id, date, duration);
    }
}
