package sg.edu.nus.iss.backend.model;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class Session {
    private String date;
    private int duration;

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public JsonObject toJson(Session session){
        JsonObjectBuilder builder = Json.createObjectBuilder();
        return builder.add("date", session.getDate())
            .add("duration", session.getDuration())
            .build();
    }
}
