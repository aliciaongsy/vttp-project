package sg.edu.nus.iss.backend.model;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class Event {

    private String id;
    private String title;
    private String start;
    private String end;
    private boolean allDay;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getStart() { return start; }
    public void setStart(String start) { this.start = start; }
    
    public String getEnd() { return end; }
    public void setEnd(String end) { this.end = end; }

    public boolean isAllDay() { return allDay; }
    public void setAllDay(boolean allDay) { this.allDay = allDay; }

    public Event docToEvent(Document doc){
        Event event = new Event();
        event.setTitle(doc.getString("title"));
        event.setStart(doc.getString("start"));
        event.setEnd(doc.getString("end"));
        event.setAllDay(doc.getBoolean("allDay"));
        return event;
    }

    public Document toDocument(Event e){
        Document doc = new Document();
        doc.put("title", e.getTitle());
        doc.put("start", e.getStart());
        doc.put("end", e.getEnd());
        doc.put("allDay", e.isAllDay());
        return doc;
    }

    public JsonObject toJson(Event e){
        JsonObjectBuilder builder = Json.createObjectBuilder();
        return builder.add("title", e.getTitle())
            .add("start", e.getStart())
            .add("end", e.getEnd())
            .add("allDay", e.isAllDay())
            .build();
    }

    public JsonObject toJson2(Event e){
        JsonObjectBuilder builder = Json.createObjectBuilder();
        return builder.add("title", e.getTitle())
            .add("start", e.getStart())
            .add("end", e.getEnd())
            .add("allDay", e.isAllDay())
            .add("id", e.getId())
            .build();
    }

}
