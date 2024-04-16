package sg.edu.nus.iss.backend.model;

import org.bson.Document;

public class Reminder {
    
    private String chatId;
    private String message;
    private String taskId;
    private String task;
    private long due;
    private boolean completed; // after sending reminder

    public String getChatId() { return chatId; }
    public void setChatId(String chatId) { this.chatId = chatId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTask() { return task; }
    public void setTask(String task) { this.task = task; }

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public long getDue() { return due; }
    public void setDue(long due) { this.due = due; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public Reminder(String chatId, String taskId, String task, long due) {
        this.chatId = chatId;
        this.taskId = taskId;
        this.task = task;
        this.due = due;
        this.message = "reminder: %s is due today!".formatted(this.task);
        this.completed = false;
    }

    public Reminder(){

    }
    
    @Override
    public String toString() {
        return "Reminder [chatId=" + chatId + ", message=" + message + ", taskId=" + taskId + ", task=" + task
                + ", due=" + due + ", completed=" + completed + "]";
    }

    public Document toDoc(Reminder reminder){
        Document doc = new Document();
        doc.put("chatId", reminder.getChatId());
        doc.put("taskId", reminder.getTaskId());
        doc.put("task", reminder.getTask());
        doc.put("due", reminder.getDue());
        doc.put("message", reminder.getMessage());
        doc.put("completed", reminder.isCompleted());

        return doc;
    }
    
    public Reminder toReminder(Document doc){
        Reminder reminder = new Reminder();
        reminder.setChatId(doc.getString("chatId"));
        reminder.setTaskId(doc.getString("taskId"));
        reminder.setTask(doc.getString("task"));
        reminder.setDue(doc.getLong("due"));
        reminder.setMessage(doc.getString("message"));
        reminder.setCompleted(doc.getBoolean("completed"));

        return reminder;
    }
}
