package sg.edu.nus.iss.backend.model;

import java.util.UUID;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class ChatRoom {

    private String roomId;
    private String owner;
    private String name;
    private String type;

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public ChatRoom(String owner, String name, String type) {
        this.roomId = UUID.randomUUID().toString().substring(0, 6);
        this.owner = owner;
        this.name = name;
        this.type = type;
    }

    public ChatRoom(){
        this.roomId = UUID.randomUUID().toString().substring(0, 6);
    }

    public ChatRoom docToChatRoom(Document doc){
        ChatRoom room = new ChatRoom();
        room.setRoomId(doc.getString("roomId"));
        room.setName(doc.getString("name"));
        if (doc.getString("type")!=null){
            room.setType(doc.getString("type"));
        }
        if (doc.getString("owner")!=null){
            room.setOwner(doc.getString("owner"));
        }
        return room;
    }

    public Document toDoc(ChatRoom room){
        Document doc = new Document();
        doc.put("roomId", room.getRoomId());
        doc.put("owner", room.getOwner());
        doc.put("name", room.getName());
        doc.put("type", room.getType());
        return doc;
    }

    public JsonObject toJson(ChatRoom room){
        JsonObjectBuilder b = Json.createObjectBuilder();
        return b.add("roomId", room.getRoomId())
            .add("owner", room.getOwner())
            .add("name", room.getName())
            .add("type", room.getType())
            .build();
    }
    
}
