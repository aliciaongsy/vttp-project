package sg.edu.nus.iss.backend.model;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class ChatMessage {

    private String content;
    private String sender;
    private MessageType type;
    private long timestamp;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public ChatMessage(String content, String sender, MessageType type, long timestamp) {
        this.content = content;
        this.sender = sender;
        this.type = type;
        this.timestamp = timestamp;
    }
    public ChatMessage(){
        
    }

    public Document toDoc(ChatMessage message){
        Document doc = new Document();
        doc.put("content", message.getContent());
        doc.put("sender", message.getSender());
        doc.put("type", message.getType());
        doc.put("timestamp", message.getTimestamp());
        return doc;
    }

    public ChatMessage docToChatMessage(Document doc){
        ChatMessage message = new ChatMessage();
        message.setContent(doc.getString("content"));
        message.setSender(doc.getString("sender"));
        message.setType(MessageType.valueOf(doc.getString("type")));
        message.setTimestamp(doc.getLong("timestamp"));
        return message;
    }

    public JsonObject toJson(ChatMessage message){
        JsonObjectBuilder b = Json.createObjectBuilder();
        return b.add("content", message.getContent())
            .add("sender", message.getSender())
            .add("type", message.getType().toString())
            .add("timestamp", message.getTimestamp())
            .build();
    }
    
}
