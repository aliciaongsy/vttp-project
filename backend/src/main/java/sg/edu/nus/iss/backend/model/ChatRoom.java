package sg.edu.nus.iss.backend.model;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class ChatRoom {

    private String roomId;
    private String ownerId;
    private String ownerName;
    private String name;
    private List<String> users;
    private List<String> usernames;
    private int userCount;
    private long createDate;
    private String type;

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getUsers() { return users; }
    public void setUsers(List<String> users) { this.users = users; }

    public List<String> getUsernames() { return usernames; }
    public void setUsernames(List<String> usernames) { this.usernames = usernames; }

    public int getUserCount() { return userCount; }
    public void setUserCount(int userCount) { this.userCount = userCount; }

    public long getCreateDate() { return createDate; }
    public void setCreateDate(long createDate) { this.createDate = createDate; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }


    public ChatRoom(String ownerId, String ownerName, String name, List<String> users, int userCount, long createDate,
            String type) {
        this.roomId = UUID.randomUUID().toString().substring(0, 6);
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.name = name;
        this.users = users;
        this.userCount = userCount;
        this.createDate = createDate;
        this.type = type;
    }

    public ChatRoom(){
        this.roomId = UUID.randomUUID().toString().substring(0, 6);
    }

    public ChatRoom docToChatRoom(Document doc){
        System.out.println("doc to chat room: " + doc.toJson());
        ChatRoom room = new ChatRoom();
        room.setRoomId(doc.getString("roomId"));
        room.setOwnerId(doc.getString("ownerId"));
        room.setOwnerName(doc.getString("ownerName"));
        room.setName(doc.getString("name"));
        room.setUsers(doc.getList("users", String.class));
        room.setUsernames(doc.getList("usernames", String.class));
        room.setUserCount(doc.getInteger("userCount"));
        room.setCreateDate(doc.getLong("createDate"));
        room.setType(doc.getString("type"));
        return room;
    }

    public Document toDoc(ChatRoom room){
        List<String> users = new ArrayList<>();
        room.getUsers().forEach(u -> users.add(u));

        List<String> usernames = new ArrayList<>();
        room.getUsernames().forEach(u -> usernames.add(u));

        Document doc = new Document();
        doc.put("roomId", room.getRoomId());
        doc.put("ownerId", room.getOwnerId());
        doc.put("ownerName", room.getOwnerName());
        doc.put("name", room.getName());        
        doc.put("usernames", usernames);
        doc.put("users", users);
        doc.put("userCount", room.getUserCount());
        doc.put("createDate", room.getCreateDate());
        doc.put("type", room.getType());
        return doc;
    }

    public JsonObject toJson(ChatRoom room){
        JsonArrayBuilder builder = Json.createArrayBuilder();
        for (String u: room.getUsers()){
            builder.add(u);
        }

        JsonArrayBuilder builder2 = Json.createArrayBuilder();
        for (String u: room.getUsernames()){
            builder2.add(u);
        }

        JsonObjectBuilder b = Json.createObjectBuilder();
        return b.add("roomId", room.getRoomId())
            .add("ownerId", room.getOwnerId())
            .add("ownerName", room.getOwnerName())
            .add("name", room.getName())
            .add("users", builder.build())
            .add("usernames", builder2.build())
            .add("userCount", room.getUserCount())
            .add("createDate", room.getCreateDate())
            .add("type", room.getType())
            .build();
    }

    public ChatRoom jsonToChatRoom(JsonObject o){
        JsonArray u = o.getJsonArray("users");
        List<String> users = new LinkedList<>();
        for(int i = 0; i < u.size(); i++){
            users.add(u.getString(i));
        }

        JsonArray u2 = o.getJsonArray("usernames");
        List<String> usernames = new LinkedList<>();
        for(int i = 0; i < u2.size(); i++){
            usernames.add(u2.getString(i));
        }

        ChatRoom room = new ChatRoom();
        room.setOwnerId(o.getString("ownerId"));
        room.setOwnerName(o.getString("ownerName"));
        room.setName(o.getString("name"));
        room.setUsers(users);
        room.setUsernames(usernames);
        room.setUserCount(o.getInt("userCount"));
        room.setCreateDate(o.getJsonNumber("createDate").longValue());
        room.setType(o.getString("type"));
        return room;
    }

    public ChatRoom docToChatRoom2(Document doc){
        ChatRoom room = new ChatRoom();
        room.setRoomId(doc.getString("roomId"));
        room.setName(doc.getString("name"));
        return room;
    }

    public Document toDoc2(ChatRoom room){
        Document doc = new Document();
        doc.put("roomId", room.getRoomId());
        doc.put("name", room.getName());
        return doc;
    }

    public JsonObject toJson2(ChatRoom room){
        JsonObjectBuilder b = Json.createObjectBuilder();
        return b.add("roomId", room.getRoomId())
            .add("name", room.getName())
            .build();
    }
    
}
