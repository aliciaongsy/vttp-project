package sg.edu.nus.iss.backend.model;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class Task {

    private String task;
    private String priority;
    private long start;
    private long due;
    private boolean completed;

    public String getTask() { return task; }
    public void setTask(String task) { this.task = task; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public long getStart() { return start; }
    public void setStart(long start) { this.start = start; }

    public long getDue() { return due; }
    public void setDue(long due) { this.due = due; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public Task(){
        
    }

    public Task(String task, String priority, long start, long due, boolean completed) {
        this.task = task;
        this.priority = priority;
        this.start = start;
        this.due = due;
        this.completed = completed;
    }

    public Document toDocument(Task task){
        Document doc = new Document();
        doc.put("task",task.getTask());
        doc.put("priority",task.getPriority());
        doc.put("start",task.getStart());
        doc.put("due",task.getDue());
        doc.put("completed",task.isCompleted());
        return doc;
    }

    public Task convertDocToTask(Document doc){
        Task task = new Task();
        task.setTask(doc.getString("task"));
        task.setPriority(doc.getString("priority"));
        task.setStart(doc.getLong("start"));
        task.setDue(doc.getLong("due"));
        task.setCompleted(doc.getBoolean("completed"));
        return task;
    }

    public JsonObject taskToJson(Task t){
        JsonObjectBuilder builder = Json.createObjectBuilder();
        return builder.add("task", t.getTask())
            .add("priority", t.getPriority())
            .add("start", t.getStart())
            .add("due", t.getDue())
            .add("completed", t.isCompleted())
            .build();
    }
}
