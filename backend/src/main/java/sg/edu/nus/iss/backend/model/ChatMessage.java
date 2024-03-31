package sg.edu.nus.iss.backend.model;

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
    
}
