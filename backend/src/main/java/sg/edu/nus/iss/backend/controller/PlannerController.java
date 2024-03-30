package sg.edu.nus.iss.backend.controller;

import java.io.StringReader;
import java.util.LinkedList;
import java.util.List;

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
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import sg.edu.nus.iss.backend.model.Event;
import sg.edu.nus.iss.backend.service.PlannerService;

@Controller
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PlannerController {

    @Autowired
    private PlannerService plannerSvc;

    @GetMapping(path = "/{id}/events")
    @ResponseBody
    public ResponseEntity<String> getEvents(@PathVariable String id) {
        return plannerSvc.getAllEvents(id);
    }

    @PostMapping(path = "/{id}/event/new")
    @ResponseBody
    public ResponseEntity<String> addNewTask(@PathVariable String id, @RequestBody String payload) {
        JsonReader reader = Json.createReader(new StringReader(payload));
        System.out.println(payload);
        JsonArray a = reader.readArray();

        List<Event> events = new LinkedList<>();
        for (int i = 0; i < a.size(); i++) {
            JsonObject o = a.getJsonObject(i);
            Event event = new Event();
            event.setTitle(o.getString("title"));
            event.setStart(o.getString("start"));
            event.setEnd(o.getString("end"));
            event.setAllDay(o.getBoolean("allDay"));
            events.add(event);
        }

        return plannerSvc.addNewEvent(id, events);
    }

    @GetMapping(path = "/{id}/{workspaces}/outstandingtasks")
    @ResponseBody
    public ResponseEntity<String> getAllOutstandingTasks(@PathVariable String id, @PathVariable String[] workspaces) {
        return plannerSvc.getAllOutstandingTasks(id, workspaces);
    }

}
